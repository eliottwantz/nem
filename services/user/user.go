package user

import (
	"context"
	"database/sql"
	"errors"

	"nem/api/httpmw"
	"nem/api/rpc"
	"nem/db"

	"github.com/charmbracelet/log"
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

func (s *Service) Create(ctx context.Context, req *rpc.CreateUserRequest) (*rpc.User, error) {
	if !db.Role(req.Role).Valid() {
		s.logger.Warn("invalid role", "role", req.Role)
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("invalid role"))
	}

	uID := httpmw.ContextUID(ctx)
	s.logger.Info("access token", "uID", uID.String())
	u, err := db.Pg.CreateUser(ctx, db.CreateUserParams{
		ID:               httpmw.ContextUID(ctx),
		FirstName:        req.FirstName,
		LastName:         req.LastName,
		Role:             db.Role(req.Role),
		PreferedLanguage: req.PreferedLanguage,
	})
	if err != nil {
		s.logger.Warn("could not create user", "err", err)
		if err == sql.ErrNoRows {
			return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, ErrNotFound)
		}
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	return rpc.FromDbUser(u), nil
}

func (s *Service) ChooseRole(ctx context.Context, role string) error {
	uID := httpmw.ContextUID(ctx)

	if !db.Role(role).Valid() {
		s.logger.Warn("invalid role", "role", role, "uID", uID)
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadRequest, errors.New("invalid role"))
	}

	err := db.Pg.SetUserRole(ctx, db.SetUserRoleParams{
		ID:   uID,
		Role: db.Role(role),
	})
	if err != nil {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
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
		AvatarFilePath: sql.NullString{String: path, Valid: true},
		AvatarUrl:      sql.NullString{String: url, Valid: true},
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
