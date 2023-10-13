package student

import (
	"context"
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

func (s *Service) ListClasses(ctx context.Context) ([]*rpc.Class, error) {
	res, err := db.Pg.ListClassesOfStudent(ctx, httpmw.ContextUID(ctx))
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
