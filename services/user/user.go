package user

import (
	"context"
	"database/sql"
	"errors"

	"nem/api/httpmw"
	"nem/api/rpc"
	"nem/db"
	"nem/utils"

	"github.com/charmbracelet/log"
	"github.com/google/uuid"
	"github.com/jackc/pgerrcode"
	"github.com/lib/pq"
)

type Service struct {
	logger *log.Logger
}

func NewService() *Service {
	return &Service{
		logger: log.WithPrefix("UserService"),
	}
}

func (s *Service) Get(ctx context.Context) (*rpc.User, error) {
	u, err := db.Pg.FindUserByID(ctx, httpmw.ContextUID(ctx))
	if err != nil {
		s.logger.Warn("could not get user", "err", err)
		if err == sql.ErrNoRows {
			return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, ErrNotFound)
		}
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, ErrGet)
	}

	return rpc.FromDbUser(u), nil
}

func (s *Service) FindUserByID(ctx context.Context, id string) (*rpc.User, error) {
	uID, err := uuid.Parse(id)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("empty user id param"))
	}
	u, err := db.Pg.FindUserByID(ctx, uID)
	if err != nil {
		s.logger.Warn("could not find user", "err", err)
		if err == sql.ErrNoRows {
			return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, ErrNotFound)
		}
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, ErrGet)
	}

	return rpc.FromDbUser(u), nil
}

func (s *Service) ListTeachers(ctx context.Context, filters *rpc.ListTeachersFilters) ([]*rpc.Teacher, error) {
	teachers, err := db.Pg.ListTeachers(ctx)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, utils.ErrInternalServer)
	}

	ret := make([]*rpc.Teacher, 0, len(teachers))
	for _, t := range teachers {
		ret = append(ret, rpc.FromDbTeacher(&db.FindTeacherByIDRow{
			ID:               t.ID,
			Email:            t.Email,
			FirstName:        t.FirstName,
			LastName:         t.LastName,
			Role:             t.Role,
			PreferedLanguage: t.PreferedLanguage,
			AvatarFilePath:   t.AvatarFilePath,
			AvatarUrl:        t.AvatarUrl,
			CreatedAt:        t.CreatedAt,
			UpdatedAt:        t.UpdatedAt,
			Bio:              t.Bio,
			HourRate:         t.HourRate,
			TopAgent:         t.TopAgent,
			SpokenLanguages:  t.SpokenLanguages,
			TopicsTaught:     t.TopicsTaught,
		}))
	}

	return ret, nil
}

func (s *Service) CreateStudent(ctx context.Context, req *rpc.CreateStudentRequest) error {
	if !db.Role(req.Role).Valid() {
		s.logger.Warn("invalid role", "role", req.Role)
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("invalid role"))
	}

	tx, err := db.Pg.NewTx(ctx)
	if err != nil {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}
	defer tx.Rollback()

	uID := httpmw.ContextUID(ctx)
	s.logger.Info("access token", "uID", uID)
	_, err = tx.CreateUser(ctx, db.CreateUserParams{
		ID:               uID,
		Email:            req.Email,
		FirstName:        req.FirstName,
		LastName:         req.LastName,
		Role:             db.Role(req.Role),
		PreferedLanguage: req.PreferedLanguage,
	})
	if err != nil {
		s.logger.Warn("could not create user", "err", err)
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}
	_, err = tx.CreateStudent(ctx, uID)
	if err != nil {
		s.logger.Warn("could not create student", "err", err)
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	err = tx.Commit()
	if err != nil {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, utils.ErrInternalServer)
	}

	return nil
}

func (s *Service) CreateTeacher(ctx context.Context, req *rpc.CreateTeacherRequest) error {
	ErrCreateTeacher := errors.New("failed to create user")

	if !db.Role(req.Role).Valid() {
		s.logger.Warn("invalid role", "role", req.Role)
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("invalid role"))
	}

	tx, err := db.Pg.NewTx(ctx)
	if err != nil {
		s.logger.Warn("could not create transaction", "err", err)
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, utils.ErrInternalServer)
	}
	defer tx.Rollback()

	uID := httpmw.ContextUID(ctx)
	s.logger.Info("access token", "uID", uID)
	u, err := tx.CreateUser(ctx, db.CreateUserParams{
		ID:               uID,
		Email:            req.Email,
		FirstName:        req.FirstName,
		LastName:         req.LastName,
		Role:             db.Role(req.Role),
		PreferedLanguage: req.PreferedLanguage,
	})
	if err != nil {
		s.logger.Warn("could not create user", "err", err)
		var pgErr *pq.Error
		if errors.As(err, &pgErr) {
			if pgErr.Code == pgerrcode.UniqueViolation {
				log.Warn("Trying to create a user that already exists")
				return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("user already created. please login if it is your account"))
			}
		}
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, utils.ErrInternalServer)
	}
	// Create the teacher
	_, err = tx.CreateTeacher(ctx, db.CreateTeacherParams{
		ID:       u.ID,
		Bio:      req.Bio,
		HourRate: req.HourRate,
	})
	if err != nil {
		s.logger.Warn("could not create teacher", "err", err)
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, ErrCreateTeacher)
	}

	for _, lang := range req.SpokenLanguages {
		exists, err := tx.FindSpokenLanguage(ctx, db.FindSpokenLanguageParams{
			Language:    lang.Language,
			Proficiency: lang.Proficiency,
		})
		if err != nil {
			if err == sql.ErrNoRows {
				langDB, err := tx.FindLanguage(ctx, lang.Language)
				if err != nil {
					s.logger.Warn("error finding language", "err", err)
					return rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New(" Language not supported. Please contact us if you wish to teach this language"))
				}
				// Create spoken language
				exists, err = tx.CreateSpokenLanguage(ctx, db.CreateSpokenLanguageParams{
					LanguageID:  langDB.ID,
					Proficiency: lang.Proficiency,
				})
				if err != nil {
					s.logger.Warn("could not create spoken language", "err", err)
					return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, utils.ErrInternalServer)
				}

			} else {
				s.logger.Warn("error finding spoken language", "err", err)
				return rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, utils.ErrInternalServer)
			}
		}
		// Add it to teacher's spoken languages
		_, err = tx.AddSpokenLanguageToTeacher(ctx, db.AddSpokenLanguageToTeacherParams{
			TeacherID:        u.ID,
			SpokenLanguageID: exists.ID,
		})
		if err != nil {
			s.logger.Warn("could not add spoken language to teacher", "err", err)
			return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, utils.ErrInternalServer)
		}
	}

	for _, topic := range req.TopicsTaught {
		dbTopic, err := tx.FindTopic(ctx, topic)
		if err != nil {
			s.logger.Warn("could not find topic", "err", err)
			return rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New(" Topic not supported. please contact us if you wish to teach this topic"))
		}
		err = tx.AddTeacherToTopics(ctx, db.AddTeacherToTopicsParams{
			TeacherID: u.ID,
			TopicID:   dbTopic.ID,
		})
		if err != nil {
			s.logger.Warn("could not add teacher to topic", "err", err)
			return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, utils.ErrInternalServer)
		}
	}

	err = tx.Commit()
	if err != nil {
		s.logger.Warn("could not commit transaction creating user", "err", err)
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, utils.ErrInternalServer)
	}

	return nil
}

func (s *Service) UpdatePreferedLanguage(ctx context.Context, lang string) error {
	uID := httpmw.ContextUID(ctx)

	err := db.Pg.UpdateUserPreferedLanguage(ctx, db.UpdateUserPreferedLanguageParams{
		PreferedLanguage: lang,
		ID:               uID,
	})
	if err != nil {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	return nil
}

func (s *Service) UpdateAvatar(ctx context.Context, path, url string) error {
	if path == "" {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("avatar file path is empty"))
	}
	if url == "" {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("avatar url is empty"))
	}

	err := db.Pg.UpdateAvatar(ctx, db.UpdateAvatarParams{
		AvatarFilePath: path,
		AvatarUrl:      url,
		ID:             httpmw.ContextUID(ctx),
	})
	if err != nil {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	return nil
}

func (s *Service) DeleteAvatar(ctx context.Context) error {
	err := db.Pg.DeleteAvatar(ctx, httpmw.ContextUID(ctx))
	if err != nil {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	return nil
}

func (s *Service) Delete(ctx context.Context) error {
	err := db.Pg.DeleteUser(ctx, httpmw.ContextUID(ctx))
	if err != nil {
		s.logger.Error("unable to delete user", "err", err)
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, ErrDelete)
	}
	return nil
}

func (s *Service) AddStripeCustomerId(ctx context.Context, stripeId string) error {
	if stripeId == "" {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("empty stripe id"))
	}
	err := db.Pg.AddStripeCustomerId(ctx, db.AddStripeCustomerIdParams{
		StripeCustomerID: sql.NullString{String: stripeId, Valid: true},
		ID:               httpmw.ContextUID(ctx),
	})
	if err != nil {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	return nil
}
