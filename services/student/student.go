package student

import (
	"context"
	"database/sql"
	"errors"

	"nem/api/httpmw"
	"nem/api/rpc"
	"nem/api/ws"
	"nem/db"

	"github.com/charmbracelet/log"
	"github.com/google/uuid"
)

type Service struct {
	wsService *ws.Service
	logger    *log.Logger
}

func NewService(wsService *ws.Service) *Service {
	return &Service{
		wsService: wsService,
		logger:    log.WithPrefix("StudentService"),
	}
}

func (s *Service) ListLearns(ctx context.Context) ([]*rpc.Learn, error) {
	res, err := db.Pg.ListLearnsOfUser(ctx, httpmw.ContextUID(ctx))
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	ret := make([]*rpc.Learn, 0, len(res))
	for _, c := range res {
		ret = append(ret, &rpc.Learn{
			Id:       c.ID,
			Language: c.Language,
			Topic:    c.Topic,
		})
	}

	return ret, nil
}

func (s *Service) Learn(ctx context.Context, language string, topic string) (*rpc.Learn, error) {
	if language == "" {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("empty language param"))
	}
	if topic == "" {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("empty topic param"))
	}

	tx, err := db.Pg.NewTx(ctx)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}
	defer tx.Rollback()

	learn, err := tx.FindLearnLangTopic(ctx, db.FindLearnLangTopicParams{
		Language: language,
		Topic:    topic,
	})
	if err != nil {
		if err == sql.ErrNoRows {
			// Learn doesn't exist, need to create it
			learn, err = tx.CreateLearn(ctx, db.CreateLearnParams{
				Language: language,
				Topic:    topic,
			})
			if err != nil {
				return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
			}

		} else {
			return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
		}
	}

	// Add user to learn
	err = tx.AddUserToLearn(ctx, db.AddUserToLearnParams{
		UserID:  httpmw.ContextUID(ctx),
		LearnID: learn.ID,
	})
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	err = tx.Commit()
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	return &rpc.Learn{
		Id:       learn.ID,
		Language: learn.Language,
		Topic:    learn.Topic,
	}, nil
}

func (s *Service) ListClasses(ctx context.Context) ([]*rpc.Class, error) {
	res, err := db.Pg.ListClassesOfUser(ctx, httpmw.ContextUID(ctx))
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	ret := make([]*rpc.Class, 0, len(res))
	for _, c := range res {
		ret = append(ret, &rpc.Class{
			Id:         c.ID.String(),
			Name:       c.Name,
			HasStarted: c.HasStarted,
			TeacherId:  c.TeacherID.String(),
			IsPrivate:  c.IsPrivate,
			Language:   c.Language,
			Topic:      c.Topic,
			StartAt:    c.StartAt,
			EndAt:      c.EndAt,
			CreatedAt:  c.CreatedAt,
		})
	}
	return ret, nil
}

func (s *Service) JoinClass(ctx context.Context, classId string) error {
	s.logger.Info("join class", "classId", classId)

	cID, err := uuid.Parse(classId)
	if err != nil {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("empty classId param"))
	}

	class, err := db.Pg.FindClass(ctx, cID)
	if err != nil {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("class not found"))
	}

	return s.wsService.JoinClass(class.ID, httpmw.ContextUID(ctx))
}

func (s *Service) LeaveClass(ctx context.Context, classId string) error {
	s.logger.Info("leave class", "classId", classId)

	cID, err := uuid.Parse(classId)
	if err != nil {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("empty classId param"))
	}
	class, err := db.Pg.FindClass(ctx, cID)
	if err != nil {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("class not found"))
	}

	return s.wsService.LeaveClass(class.ID, httpmw.ContextUID(ctx))
}
