package httpmw

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"

	"nem/api/rpc"
	"nem/db"

	"github.com/charmbracelet/log"
	"github.com/go-chi/jwtauth/v5"
	"github.com/google/uuid"
	"github.com/lestrrat-go/jwx/v2/jwt"
)

const (
	supaAuthToken    = "sb-auth-token"
	supaAccessToken  = "sb-access-token"
	supaRefreshToken = "sb-refresh-token"
	authHeaderKey    = "Authorization"
	authTypeBearer   = "bearer"
)

type (
	ctxTokenKey struct{}
)

func Auth(ja *jwtauth.JWTAuth) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()
			fmt.Printf("hdr: %+v\n", r.Header)
			accessToken := jwtauth.TokenFromHeader(r)
			if accessToken == "" {
				log.Warn("no access token found in Bearer header")
				rpc.RespondWithError(w, rpc.ErrUnauthorized)
				return
			}
			log.Info("access token found", "token", accessToken)
			token, err := jwtauth.VerifyToken(ja, accessToken)
			if err != nil {
				log.Warn("could not verify request", "err", err)
				rpc.RespondWithError(w, rpc.ErrUnauthorized)
				return
			}

			if token == nil || jwt.Validate(token) != nil {
				log.Warn("could not validate token", "err", err)
				rpc.RespondWithError(w, rpc.ErrUnauthorized)
				return
			}

			ctx = context.WithValue(ctx, ctxTokenKey{}, token)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func WSAuth(ja *jwtauth.JWTAuth) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()
			token, err := jwtauth.VerifyRequest(ja, r, jwtauth.TokenFromQuery)
			if err != nil {
				log.Warn("could not verify request", "err", err)
				rpc.RespondWithError(w, rpc.ErrUnauthorized)
				return
			}

			if token == nil || jwt.Validate(token) != nil {
				log.Warn("could not validate token", "err", err)
				rpc.RespondWithError(w, rpc.ErrUnauthorized)
				return
			}

			ctx = context.WithValue(ctx, ctxTokenKey{}, token)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func ContextJWT(c context.Context) jwt.Token {
	token := c.Value(ctxTokenKey{}).(jwt.Token)
	return token
}

func ContextUID(c context.Context) uuid.UUID {
	token := ContextJWT(c)
	return uuid.MustParse(token.Subject())
}

// OnlyRoles middleware restricts access to accounts having roles parameter in their access token.
func OnlyRoles(roles ...db.Role) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			uID := ContextUID(r.Context())
			u, err := db.Pg.FindUserByID(r.Context(), uID)
			if err != nil {
				rpc.RespondWithError(w, rpc.ErrPermissionDenied)
				return
			}
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

func decodeURLEncodedToken(token string) (string, error) {
	decoded, err := url.QueryUnescape(token)
	if err != nil {
		return "", err
	}
	return decoded, nil
}

func unmarshallTokenArray(token string) ([]string, error) {
	var arr []string
	err := json.Unmarshal([]byte(token), &arr)
	if err != nil {
		return nil, err
	}
	return arr, nil
}
