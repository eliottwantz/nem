package teacher

import (
	"context"
	"database/sql"
	"errors"

	"nem/api/httpmw"
	"nem/api/rpc"
	"nem/api/ws"
	"nem/db"

	"github.com/charmbracelet/log"
	"github.com/jackc/pgerrcode"
	"github.com/lib/pq"
)

type Service struct {
	wsService *ws.Service
	logger    *log.Logger
}

func NewService(wsService *ws.Service) *Service {
	return &Service{
		wsService: wsService,
		logger:    log.WithPrefix("TeacherService"),
	}
}

func (s *Service) ListTeaches(ctx context.Context) ([]*rpc.Teach, error) {
	res, err := db.Pg.ListLearnsOfUser(ctx, httpmw.ContextSessionUserID(ctx))
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	ret := make([]*rpc.Teach, 0, len(res))
	for _, c := range res {
		ret = append(ret, &rpc.Teach{
			Id:       c.ID,
			Language: c.Language,
			Topic:    c.Topic,
		})
	}

	return ret, nil
}

func (s *Service) Teach(ctx context.Context, language string, topic string) (*rpc.Teach, error) {
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
		UserID:  httpmw.ContextSessionUserID(ctx),
		LearnID: learn.ID,
	})
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	err = tx.Commit()
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	return &rpc.Teach{
		Id:       learn.ID,
		Language: learn.Language,
		Topic:    learn.Topic,
	}, nil
}

func (s *Service) ListClasses(ctx context.Context) ([]*rpc.Class, error) {
	res, err := db.Pg.ListClassesOfTeacher(ctx, httpmw.ContextSessionUserID(ctx))
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	tID := httpmw.ContextSessionUserID(ctx)

	ret := make([]*rpc.Class, 0, len(res))
	for _, c := range res {
		ret = append(ret, &rpc.Class{
			Id:        c.ID,
			Name:      c.Name,
			IsPrivate: c.IsPrivate,
			Language:  c.Language,
			Topic:     c.Topic,
			StartAt:   c.StartAt,
			EndAt:     c.EndAt,
			CreatedAt: c.CreatedAt,
			TeacherId: tID,
		})
	}
	return ret, nil
}

func (s *Service) StartClass(ctx context.Context, classId string) error {
	s.logger.Info("start class", "classId", classId)

	if classId == "" {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("empty classId param"))
	}

	class, err := db.Pg.FindClass(ctx, classId)
	if err != nil {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("class not found"))
	}

	return s.wsService.StartClass(class.ID, httpmw.ContextSessionUserID(ctx))
}

func (s *Service) EndClass(ctx context.Context, classId string) error {
	s.logger.Info("end class", "classId", classId)

	if classId == "" {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("empty classId param"))
	}

	class, err := db.Pg.FindClass(ctx, classId)
	if err != nil {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("class not found"))
	}

	return s.wsService.EndClass(class.ID)
}

func (s *Service) ListAvailabilities(ctx context.Context) ([]*rpc.TimeSlot, error) {
	res, err := db.Pg.ListTimeSlots(ctx, httpmw.ContextSessionUserID(ctx))
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	ret := make([]*rpc.TimeSlot, 0, len(res))
	for _, c := range res {
		ret = append(ret, &rpc.TimeSlot{
			Id:        c.ID,
			TeacherId: c.TeacherID,
			StartAt:   c.StartAt,
			EndAt:     c.EndAt,
		})
	}

	return ret, nil
}

func (s *Service) AddAvailability(ctx context.Context, req *rpc.AddAvailabilityRequest) ([]*rpc.TimeSlot, error) {
	err := req.Validate()
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, err)
	}

	tx, err := db.Pg.NewTx(ctx)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}
	defer tx.Rollback()

	teacherID := httpmw.ContextSessionUserID(ctx)
	timeSlots := make([]*db.TimeSlot, 0, len(req.Times))

	for _, t := range req.Times {
		res, err := tx.AddTimeSlot(ctx, db.AddTimeSlotParams{
			TeacherID: teacherID,
			StartAt:   t.StartAt,
			EndAt:     t.EndAt,
		})
		if err != nil {
			log.Warn("could not add availability", "err", err)
			return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
		}
		timeSlots = append(timeSlots, res)
	}

	err = tx.Commit()
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	ret := make([]*rpc.TimeSlot, 0, len(timeSlots))
	for _, t := range timeSlots {
		ret = append(ret, &rpc.TimeSlot{
			Id:        t.ID,
			TeacherId: t.TeacherID,
			StartAt:   t.StartAt,
			EndAt:     t.EndAt,
		})
	}

	return ret, nil
}

func (s *Service) UpdateAvailability(ctx context.Context, req *rpc.EditAvailabilityRequest) ([]*rpc.TimeSlot, error) {
	err := req.Validate()
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, err)
	}

	if req.Id == "" {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("empty timeslot id param"))
	}
	teacherID := httpmw.ContextSessionUserID(ctx)

	tx, err := db.Pg.NewTx(ctx)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}
	defer tx.Rollback()

	_, err = tx.FindClassByTeacherAndTimeSlotId(ctx, db.FindClassByTeacherAndTimeSlotIdParams{
		TeacherID: teacherID,
		ID:        req.Id,
	})
	if err == nil {
		// There is a class for that time slot. Cannot update it
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("cannot update this time slot because there is already an existing class on this time slot"))
	}

	if len(req.Times) > 1 {
		// The user updated a time slot to span on multiple one hour time slots
		// First delete the old time slot then add the new ones
		err = tx.DeleteTimeSlot(ctx, db.DeleteTimeSlotParams{
			ID:        req.Id,
			TeacherID: teacherID,
		})
		if err != nil {
			log.Warn("could not delete availability", "err", err)
			return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
		}

		timeSlots := make([]*db.TimeSlot, 0, len(req.Times))

		for _, t := range req.Times {
			res, err := tx.AddTimeSlot(ctx, db.AddTimeSlotParams{
				TeacherID: teacherID,
				StartAt:   t.StartAt,
				EndAt:     t.EndAt,
			})
			if err != nil {
				log.Warn("could not add availability", "err", err)
				return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
			}
			timeSlots = append(timeSlots, res)
		}

		ret := make([]*rpc.TimeSlot, 0, len(req.Times))
		for _, t := range timeSlots {
			ret = append(ret, &rpc.TimeSlot{
				Id:        t.ID,
				TeacherId: t.TeacherID,
				StartAt:   t.StartAt,
				EndAt:     t.EndAt,
			})
		}

		err = tx.Commit()
		if err != nil {
			return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
		}

		return ret, nil
	} else {

		res, err := db.Pg.UpdateTimeSlot(ctx, db.UpdateTimeSlotParams{
			StartAt:   req.StartAt,
			EndAt:     req.EndAt,
			ID:        req.Id,
			TeacherID: teacherID,
		})
		if err != nil {
			log.Warn("could not update availability", "err", err)
			return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
		}

		err = tx.Commit()
		if err != nil {
			return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
		}

		return []*rpc.TimeSlot{{
			Id:        res.ID,
			TeacherId: res.TeacherID,
			StartAt:   res.StartAt,
			EndAt:     res.EndAt,
		}}, nil
	}
}

func (s *Service) DeleteAvailability(ctx context.Context, id string) error {
	if id == "" {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("empty timeslot id param"))
	}
	err := db.Pg.DeleteTimeSlot(ctx, db.DeleteTimeSlotParams{
		ID:        id,
		TeacherID: httpmw.ContextSessionUserID(ctx),
	})
	if err != nil {
		var pgErr *pq.Error
		if errors.As(err, &pgErr) {
			if pgErr.Code == pgerrcode.ForeignKeyViolation {
				log.Warn("Trying to delete a time slot that already has a class on it")
				return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("cannot delete this time slot because there is already an existing class on this time slot"))
			}
		}
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	return nil
}

func (s *Service) CancelClass(ctx context.Context, classId string) ([]*rpc.User, *rpc.User, error) {
	if classId == "" {
		return nil, nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("empty class id"))
	}

	tx, err := db.Pg.NewTx(ctx)
	if err != nil {
		return nil, nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}
	defer tx.Rollback()

	_, err = tx.FindClass(ctx, classId)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("class not found"))
		}
		return nil, nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	usersInClass, err := tx.ListUsersInClass(ctx, classId)
	if err != nil {
		return nil, nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	// Remove all students from class
	for _, u := range usersInClass {
		err = tx.RemoveUserFromClass(ctx, db.RemoveUserFromClassParams{
			UserID:  u.ID,
			ClassID: classId,
		})
		if err != nil {
			return nil, nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
		}
	}

	teacher, err := tx.FindUserByID(ctx, httpmw.ContextSessionUserID(ctx))
	if err != nil {
		return nil, nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	// Delete class
	err = tx.DeleteClass(ctx, classId)
	if err != nil {
		return nil, nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	err = tx.Commit()
	if err != nil {
		return nil, nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	ret := make([]*rpc.User, 0, len(usersInClass))
	for _, u := range usersInClass {
		ret = append(ret, rpc.FromDbUser(u))
	}

	return ret, rpc.FromDbUser(teacher), nil
}
