package admin

import (
	"context"
	"database/sql"
	"errors"

	"nem/api/rpc"
	"nem/db"

	"github.com/charmbracelet/log"
	"github.com/google/uuid"
)

type Service struct{}

func NewService() *Service {
	return &Service{}
}

func (s *Service) AdminListUsers(ctx context.Context) ([]*rpc.User, error) {
	users, err := db.Pg.ListUsers(ctx)
	if err != nil {
		log.Error("unable to list users", "err", err)
		if err == sql.ErrNoRows {
			return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("no users found"))
		}
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcRequestFailed, errors.New("error listing users"))
	}

	rpcUsers := make([]*rpc.User, 0, len(users))
	for _, user := range users {
		rpcUsers = append(rpcUsers, &rpc.User{
			Id:               user.ID.String(),
			FirstName:        user.FirstName,
			LastName:         user.LastName,
			Role:             string(user.Role),
			PreferedLanguage: user.PreferedLanguage,
			AvatarFilePath:   user.AvatarFilePath,
			AvatarUrl:        user.AvatarUrl,
			CreatedAt:        user.CreatedAt,
		})
	}

	return rpcUsers, nil
}

func (s *Service) AdminSetRole(ctx context.Context, userId string, role string) error {
	uID, err := uuid.Parse(userId)
	if err != nil {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("user id is empty"))
	}

	if !db.Role(role).Valid() {
		log.Info("cannot add role")
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, ErrInvalidRole)
	}

	err = db.Pg.SetUserRole(ctx, db.SetUserRoleParams{
		ID:   uID,
		Role: db.Role(role),
	})
	if err != nil {
		log.Error("unable to add role", "err", err)
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, ErrAddRole)
	}

	return nil
}

func (s *Service) AdminListClasses(ctx context.Context) ([]*rpc.Class, error) {
	res, err := db.Pg.ListClasses(ctx)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	ret := make([]*rpc.Class, 0, len(res))
	for _, c := range res {
		ret = append(ret, &rpc.Class{
			Id:        c.ID.String(),
			Name:      c.Name,
			TeacherId: c.TeacherID.String(),
			IsPrivate: c.IsPrivate,
			Language:  c.Language,
			Topic:     c.Topic,
			StartAt:   c.StartAt,
			EndAt:     c.EndAt,
			CreatedAt: c.CreatedAt,
		})
	}

	return ret, nil
}

func (s *Service) AdminCreateClass(ctx context.Context, req *rpc.AdminCreateClassRequest) (*rpc.Class, error) {
	err := req.Validate()
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, err)
	}

	tx, err := db.Pg.NewTx(ctx)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}
	defer tx.Rollback()

	tID, err := uuid.Parse(req.TimeSlotId)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("empty timeSlotId param"))
	}

	class, err := tx.CreateClass(ctx, db.CreateClassParams{
		Name:       req.Name,
		LearnID:    req.LearnId,
		TimeSlotID: tID,
	})
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	timeSlot, err := tx.FindTimeSlot(ctx, tID)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	for _, uID := range req.UserIDs {
		err = tx.AddUserToClass(ctx, db.AddUserToClassParams{
			UserID:  uuid.MustParse(uID),
			ClassID: class.ID,
		})
		if err != nil {
			return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
		}
	}

	learn, err := tx.FindLearn(ctx, req.LearnId)
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	err = tx.Commit()
	if err != nil {
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	return &rpc.Class{
		Id:        class.ID.String(),
		Name:      class.Name,
		TeacherId: timeSlot.TeacherID.String(),
		IsPrivate: class.IsPrivate,
		Language:  learn.Language,
		Topic:     learn.Topic,
		StartAt:   timeSlot.StartAt,
		EndAt:     timeSlot.EndAt,
		CreatedAt: class.CreatedAt,
	}, nil
}
