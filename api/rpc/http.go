package rpc

import (
	"context"
	"net/http"

	"nem/db"
)

func ResReq(ctx context.Context) (http.ResponseWriter, *http.Request) {
	w, ok := ctx.Value(HTTPResponseWriterCtxKey).(http.ResponseWriter)
	if !ok {
		return nil, nil
	}
	r, ok := ctx.Value(HTTPRequestCtxKey).(*http.Request)
	if !ok {
		return nil, nil
	}
	return w, r
}

func FromDbUser(dbUser *db.User) *User {
	return &User{
		Id:               dbUser.ID.String(),
		FirstName:        dbUser.FirstName,
		LastName:         dbUser.LastName,
		Role:             string(dbUser.Role),
		PreferedLanguage: dbUser.PreferedLanguage,
		AvatarFilePath:   dbUser.AvatarFilePath.String,
		AvatarUrl:        dbUser.AvatarUrl.String,
		CreatedAt:        dbUser.CreatedAt,
	}
}
