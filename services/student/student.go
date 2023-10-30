package student

import (
	"context"
	"errors"
	"slices"
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
		logger:    log.WithPrefix("StudentService"),
	}
}

func (s *Service) ListClasses(ctx context.Context) ([]*rpc.ListClass, error) {
	res, err := db.Pg.ListClassesOfStudent(ctx, httpmw.ContextUID(ctx))
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	ret := make([]*rpc.ListClass, 0, len(res))
	for _, c := range res {
		ret = append(ret, &rpc.ListClass{
			Id:                    c.ID.String(),
			Name:                  c.Name,
			HasStarted:            c.HasStarted,
			TeacherFirstName:      c.FirstName,
			TeacherLastName:       c.LastName,
			TeacherAvatarUrl:      c.AvatarUrl,
			TeacherAvatarFilePath: c.AvatarFilePath,
			TeacherId:             c.TeacherID.String(),
			IsPrivate:             c.IsPrivate,
			Language:              c.Language,
			Topic:                 c.Topic,
			StartAt:               c.StartAt,
			EndAt:                 c.EndAt,
			CreatedAt:             c.CreatedAt,
		})
	}
	return ret, nil
}

func (s *Service) ListTeachersOfStudent(ctx context.Context) ([]*rpc.Teacher, error) {
	res, err := db.Pg.ListTeachersOfStudent(ctx, httpmw.ContextUID(ctx))
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	ret := make([]*rpc.Teacher, 0, len(res))
	for _, u := range res {
		ret = append(ret, rpc.FromDbTeacher(&db.FindTeacherByIDRow{
			ID:               u.ID,
			Email:            u.Email,
			FirstName:        u.FirstName,
			LastName:         u.LastName,
			Role:             db.Role(u.Role),
			PreferedLanguage: u.PreferedLanguage,
			AvatarFilePath:   u.AvatarFilePath,
			AvatarUrl:        u.AvatarUrl,
			CreatedAt:        u.CreatedAt,
			UpdatedAt:        u.UpdatedAt,
			Bio:              u.Bio,
			HourRate:         u.HourRate,
			TopAgent:         u.TopAgent,
			SpokenLanguages:  u.SpokenLanguages,
			TopicsTaught:     u.TopicsTaught,
		}))
	}

	return ret, nil
}

func (s *Service) GetHoursBankForTeacher(ctx context.Context, teacherId string) (int32, error) {
	tID, err := uuid.Parse(teacherId)
	if err != nil {
		s.logger.Warn("could not parse teacher id", "err", err)
		return 0, rpc.ErrWebrpcBadRequest.WithCause(errors.New("empty teacher id param"))
	}

	res, err := db.Pg.GetHoursBankForTeacher(ctx, db.GetHoursBankForTeacherParams{
		TeacherID: tID,
		StudentID: httpmw.ContextUID(ctx),
	})
	if err != nil {
		s.logger.Warn("could not get hours bank", "err", err)
		return 0, rpc.ErrWebrpcBadResponse
	}

	return res.Hours, nil
}

func (s *Service) ListAvailabilitiesOfTeacher(ctx context.Context, teacherId string) ([]*rpc.TimeSlot, error) {
	tID, err := uuid.Parse(teacherId)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("teacherId is empty"))
	}

	timeSlots, err := db.Pg.ListTeachersAvailableTimeSlots(ctx, db.ListTeachersAvailableTimeSlotsParams{
		TeacherID: tID,
		StudentID: httpmw.ContextUID(ctx),
	})
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	userClasses, err := db.Pg.ListClassesOfStudent(ctx, httpmw.ContextUID(ctx))
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}
	userClassesTimeSlots := make([]string, 0, len(userClasses))
	for _, c := range userClasses {
		userClassesTimeSlots = append(userClassesTimeSlots, c.TimeSlotID.String())
	}

	now := time.Now()
	ret := make([]*rpc.TimeSlot, 0, len(timeSlots))
	for _, t := range timeSlots {
		if slices.Contains(userClassesTimeSlots, t.ID.String()) {
			continue
		}
		if t.NumUsers >= 4 {
			continue
		}
		if t.IsPrivate.Valid && t.IsPrivate.Bool {
			continue
		}
		if t.StartAt.Before(now) || t.EndAt.Before(now) {
			continue
		}
		ret = append(ret, &rpc.TimeSlot{
			Id:        t.ID.String(),
			TeacherId: t.TeacherID.String(),
			StartAt:   t.StartAt,
			EndAt:     t.EndAt,
		})
	}

	return ret, nil
}
