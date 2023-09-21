package teacher

import (
	"context"
	"database/sql"
	"errors"
	"time"

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
	res, err := db.Pg.ListClassesOfUser(ctx, httpmw.ContextSessionUserID(ctx))
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	ret := make([]*rpc.Class, 0, len(res))
	for _, c := range res {
		ret = append(ret, &rpc.Class{
			Id:        c.ID.String(),
			Name:      c.Name,
			Language:  c.Language,
			Topic:     c.Topic,
			StartAt:   c.StartAt,
			EndAt:     c.EndAt,
			CreatedAt: c.CreatedAt,
		})
	}
	return ret, nil
}

func (s *Service) StartClass(ctx context.Context, classId string) error {
	s.logger.Info("start class", "classId", classId)

	cID, err := uuid.Parse(classId)
	if err != nil {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	class, err := db.Pg.FindClass(ctx, cID)
	if err != nil {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("class not found"))
	}

	return s.wsService.StartClass(class.ID, httpmw.ContextSessionUserID(ctx))
}

func (s *Service) EndClass(ctx context.Context, classId string) error {
	s.logger.Info("end class", "classId", classId)

	cID, err := uuid.Parse(classId)
	if err != nil {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, err)
	}

	class, err := db.Pg.FindClass(ctx, cID)
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
			Id:        c.ID.String(),
			TeacherId: c.TeacherID,
			StartAt:   c.StartAt,
			EndAt:     c.EndAt,
		})
	}

	return ret, nil
}

func (s *Service) AddAvailability(ctx context.Context, req *rpc.AddAvailabilityRequest) ([]*rpc.TimeSlot, error) {
	tx, err := db.Pg.NewTx(ctx)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}
	defer tx.Rollback()

	for _, t := range req.Times {
		_, err := tx.AddTimeSlot(ctx, db.AddTimeSlotParams{
			TeacherID: httpmw.ContextSessionUserID(ctx),
			StartAt:   t.StartAt,
			EndAt:     t.EndAt,
		})
		if err != nil {
			log.Warn("could not add availability", "err", err)
			return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
		}
	}

	timeSlots, err := tx.FindTimeSlotsTeacherAndTime(ctx, db.FindTimeSlotsTeacherAndTimeParams{
		TeacherID: httpmw.ContextSessionUserID(ctx),
		StartAt:   req.StartAt,
		EndAt:     req.EndAt,
	})
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	err = tx.Commit()
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	ret := make([]*rpc.TimeSlot, 0, len(timeSlots))
	for _, t := range timeSlots {
		ret = append(ret, &rpc.TimeSlot{
			Id:        t.ID.String(),
			TeacherId: t.TeacherID,
			StartAt:   t.StartAt,
			EndAt:     t.EndAt,
		})
	}

	return ret, nil
}

func (s *Service) UpdateAvailability(ctx context.Context, id string, startAt time.Time, endAt time.Time) (*rpc.TimeSlot, error) {
	timeslotID, err := uuid.Parse(id)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("empty id param"))
	}
	res, err := db.Pg.UpdateTimeSlot(ctx, db.UpdateTimeSlotParams{
		StartAt:   startAt,
		EndAt:     endAt,
		ID:        timeslotID,
		TeacherID: httpmw.ContextSessionUserID(ctx),
	})
	if err != nil {
		log.Warn("could not update availability", "err", err)
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	return &rpc.TimeSlot{
		Id:        res.ID.String(),
		TeacherId: res.TeacherID,
		StartAt:   res.StartAt,
		EndAt:     res.EndAt,
	}, nil
}

func (s *Service) DeleteAvailability(ctx context.Context, id string) error {
	timeslotID, err := uuid.Parse(id)
	if err != nil {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("empty id param"))
	}
	err = db.Pg.DeleteTimeSlot(ctx, db.DeleteTimeSlotParams{
		ID:        timeslotID,
		TeacherID: httpmw.ContextSessionUserID(ctx),
	})
	if err != nil {
		log.Warn("could not delete availability", "err", err)
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	return nil
}
