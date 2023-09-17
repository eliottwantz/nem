package httpmw

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"nem/api/rpc"
	"nem/db"

	"github.com/charmbracelet/log"
)

const (
	sessionName = "auth_session"
)

type (
	ctxSessionIdKey struct{}
	ctxSessionKey   struct{}
)

func Auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		sessionID := getSessionID(r)
		fmt.Println()
		fmt.Println("SESSION_ID:", sessionID)
		fmt.Println()
		if sessionID == "" {
			log.Warn("not session id for request")
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
		ctx = context.WithValue(ctx, ctxSessionKey{}, &u)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func getSessionID(r *http.Request) string {
	sessionID := r.Header.Get(sessionName)
	if sessionID != "" {
		return sessionID
	}

	sessionID = r.URL.Query().Get(sessionName)
	if sessionID != "" {
		return sessionID
	}

	return ""
}

func ContextSessionUser(c context.Context) *db.SessionUser {
	u := c.Value(ctxSessionKey{}).(*db.SessionUser)
	return u
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
