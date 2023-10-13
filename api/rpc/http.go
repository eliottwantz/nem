package rpc

import (
	"context"
	"net/http"
	"strings"

	"nem/db"

	"github.com/lib/pq"
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
		Email:            dbUser.Email,
		FirstName:        dbUser.FirstName,
		LastName:         dbUser.LastName,
		Role:             string(dbUser.Role),
		PreferedLanguage: dbUser.PreferedLanguage,
		AvatarFilePath:   dbUser.AvatarFilePath,
		AvatarUrl:        dbUser.AvatarUrl,
		CreatedAt:        dbUser.CreatedAt,
		UpdatedAt:        dbUser.UpdatedAt.Time,
	}
}

//	func FromDBSpokenLanguage(dbSpokenLanguage []*db.SpokenLanguage) []*SpokenLanguage {
//		ret := make([]*SpokenLanguage, 0, len(dbSpokenLanguage))
//		for _, dbSpokenLanguage := range dbSpokenLanguage {
//			ret = append(ret, &SpokenLanguage{
//				Id:          dbSpokenLanguage.ID,
//				Language:    dbSpokenLanguage.Language,
//				Proficiency: dbSpokenLanguage.Proficiency,
//			})
//		}
//		return ret
//	}
func pgRowToSpokenLang(e interface{}) []*SpokenLanguage {
	ba := pq.ByteaArray{}
	err := ba.Scan(e)
	if err != nil {
		return []*SpokenLanguage{}
	}
	// We have sa in the form of an array of tuples (language, proficiency)
	sa := pq.StringArray{}
	ret := make([]*SpokenLanguage, 0, len(sa))
	for _, b := range ba {
		s := string(b)
		trimed := s[1 : len(s)-1] // remove parentheses
		spl := strings.Split(trimed, ",")
		ret = append(ret, &SpokenLanguage{
			Language:    spl[0],
			Proficiency: spl[1],
		})
	}
	return ret
}

func pgArrayToStringArray(e interface{}) []string {
	sa := pq.StringArray{}
	err := sa.Scan(e)
	if err != nil {
		return []string{}
	}
	return sa
}

func FromDbTeacher(t *db.FindTeacherByIDRow) *Teacher {
	return &Teacher{
		Id:               t.ID.String(),
		Email:            t.Email,
		FirstName:        t.FirstName,
		LastName:         t.LastName,
		Role:             string(t.Role),
		PreferedLanguage: t.PreferedLanguage,
		AvatarFilePath:   t.AvatarFilePath,
		AvatarUrl:        t.AvatarUrl,
		CreatedAt:        t.CreatedAt,
		UpdatedAt:        t.UpdatedAt.Time,
		Bio:              t.Bio,
		HourRate:         t.HourRate,
		TopAgent:         t.TopAgent,
		SpokenLanguages:  pgRowToSpokenLang(t.SpokenLanguages),
		TopicsTaught:     pgArrayToStringArray(t.TopicsTaught),
	}
}
