package class

import (
	"context"
	"errors"

	"nem/api/rpc"
	"nem/db"

	"github.com/charmbracelet/log"
	"github.com/google/uuid"
)

type Service struct {
	logger *log.Logger
}

func NewService() *Service {
	return &Service{
		logger: log.WithPrefix("ClassService"),
	}
}

func (s *Service) ListLanguages(ctx context.Context) ([]string, error) {
	res, err := db.Pg.ListLanguages(ctx)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	ret := make([]string, 0, len(res))
	for _, l := range res {
		ret = append(ret, l.Language)
	}

	return ret, nil
}

func (s *Service) ListTopics(ctx context.Context) ([]string, error) {
	res, err := db.Pg.ListTopics(ctx)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	ret := make([]string, 0, len(res))
	for _, t := range res {
		ret = append(ret, t.Topic)
	}

	return ret, nil
}

func (s *Service) ShowClassDetails(ctx context.Context, classId string) (*rpc.ClassDetails, error) {
	cID, err := uuid.Parse(classId)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("empty classId param"))
	}

	dbClass, err := db.Pg.FindClass(ctx, cID)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	dbUsers, err := db.Pg.ListStudentsInClass(ctx, cID)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	teacher, err := db.Pg.FindTeacherByID(ctx, dbClass.TeacherID)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	rpcUsers := make([]*rpc.User, 0, len(dbUsers))
	for _, u := range dbUsers {
		rpcUsers = append(rpcUsers, rpc.FromDbUser(u))
	}

	return &rpc.ClassDetails{
		Class: &rpc.Class{
			Id:         dbClass.ID.String(),
			Name:       dbClass.Name,
			Language:   dbClass.Language,
			HasStarted: dbClass.HasStarted,
			Topic:      dbClass.Topic,
			TeacherId:  dbClass.TeacherID.String(),
			IsPrivate:  dbClass.IsPrivate,
			IsTrial:    dbClass.IsTrial,
			StartAt:    dbClass.StartAt,
			EndAt:      dbClass.EndAt,
			CreatedAt:  dbClass.CreatedAt,
		},
		Users:   rpcUsers,
		Teacher: rpc.FromDbTeacher(teacher),
	}, nil
}
