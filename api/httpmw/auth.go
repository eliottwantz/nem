package httpmw

import (
	"context"
	"encoding/json"
	"net/http"

	"nem/api/rpc"
	"nem/db"
	"nem/utils"

	"github.com/charmbracelet/log"
)

const (
	sessionCookieName = "auth_session"
)

type (
	ctxSessionIdKey struct{}
)

func Auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		sessionID, err := utils.ReadCookie(r, sessionCookieName)
		if err != nil {
			log.Warn("not session id cookie for request", "err", err)
			rpc.RespondWithError(w, rpc.ErrUnauthorized)
			return
		}

		sessionStr, err := db.Redis.Get(ctx, "session:"+sessionID).Result()
		if err != nil {
			log.Error("could not get session from redis", "err", err)
			return
		}

		var u db.SessionUser
		err = json.Unmarshal([]byte(sessionStr), &u)
		if err != nil {
			log.Error("could not unmarshal session", "err", err)
			return
		}

		ctx = context.WithValue(ctx, ctxSessionIdKey{}, sessionID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func ContextSessionUser(c context.Context) *db.SessionUser {
	sessionID := ContextSessionID(c)
	sessionStr, err := db.Redis.Get(c, "session:"+sessionID).Result()
	if err != nil {
		log.Error("could not get session from redis", "err", err)
		return nil
	}

	var u db.SessionUser
	err = json.Unmarshal([]byte(sessionStr), &u)
	if err != nil {
		log.Error("could not unmarshal session", "err", err)
		return nil
	}
	return &u
}

func ContextSessionUserID(c context.Context) string {
	session := ContextSessionUser(c)
	if session == nil {
		return ""
	}
	return session.UserID
}

func ContextSessionID(c context.Context) string {
	sessionID := c.Value(ctxSessionIdKey{}).(string)
	return sessionID
}

// OnlyRoles middleware restricts access to accounts having roles parameter in their access token.
func OnlyRoles(roles ...db.Role) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			u := ContextSessionUser(r.Context())
			if !hasRole(u.Role, roles) {
				rpc.RespondWithError(w, rpc.ErrPermissionDenied)
				return
			}

			// User has role
			next.ServeHTTP(w, r)
		})
	}
}

func hasRole(role db.Role, roles []db.Role) bool {
	for _, r := range roles {
		if r == role {
			return true
		}
	}
	return false
}
