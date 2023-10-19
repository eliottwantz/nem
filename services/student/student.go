package student

import (
	"context"

	"nem/api/httpmw"
	"nem/api/rpc"
	"nem/api/ws"
	"nem/db"

	"github.com/charmbracelet/log"
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
