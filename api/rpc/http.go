package rpc

import (
	"context"
	"net/http"
	"strconv"
	"strings"
	"time"

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
		StripeCustomerId: dbUser.StripeCustomerID.String,
		FirstName:        dbUser.FirstName,
		LastName:         dbUser.LastName,
		Role:             string(dbUser.Role),
		PreferedLanguage: dbUser.PreferedLanguage,
		AvatarFilePath:   dbUser.AvatarFilePath,
		AvatarUrl:        dbUser.AvatarUrl,
		CreatedAt:        dbUser.CreatedAt,
		UpdatedAt:        dbUser.UpdatedAt,
	}
}

func pgRowToSpokenLang(e interface{}) []*SpokenLanguage {
	ba := pq.ByteaArray{}
	err := ba.Scan(e)
	if err != nil {
		return []*SpokenLanguage{}
	}
	// We have sa in the form of an array of tuples (language, proficiency)
	ret := make([]*SpokenLanguage, 0, len(ba))
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

func pgRowToUsers(e interface{}) []*User {
	ba := pq.ByteaArray{}
	err := ba.Scan(e)
	if err != nil {
		return []*User{}
	}
	// We have sa in the form of an array of tuples (id,email,firstName,lastName,role,preferedLang,avatar_file_path,avatar_url,createdAt,updatedAt)
	ret := make([]*User, 0, len(ba))
	for _, b := range ba {
		s := string(b)
		trimed := s[1 : len(s)-1] // remove parentheses
		spl := strings.Split(trimed, ",")
		createdAt, _ := time.Parse("2006-01-02 15:04:05.999999+00", spl[8])
		updatedAt, _ := time.Parse("2006-01-02 15:04:05", spl[9])
		ret = append(ret, &User{
			Id:               spl[0],
			Email:            spl[1],
			FirstName:        spl[2],
			LastName:         spl[3],
			Role:             spl[4],
			PreferedLanguage: spl[5],
			AvatarFilePath:   spl[6],
			AvatarUrl:        spl[7],
			CreatedAt:        createdAt,
			UpdatedAt:        updatedAt,
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

func FromDbConversation(c *db.ListConversationsOfUserRow) *Conversation {
	return &Conversation{
		Id:          c.ID,
		IsClassChat: c.IsClassChat,
		LastSent:    c.LastSent.(time.Time),
		Users:       pgRowToUsers(c.Users),
		CreatedAt:   c.CreatedAt,
	}
}

func FromDbConversationFind(c *db.FindConversationByIdRow) *Conversation {
	return &Conversation{
		Id:          c.ID,
		IsClassChat: c.IsClassChat,
		Users:       pgRowToUsers(c.Users),
		CreatedAt:   c.CreatedAt,
	}
}

func FromDbTeacher(t *db.FindTeacherByIDRow) *Teacher {
	var rating int32 = 0
	if t.Rating.Valid {
		r, err := strconv.Atoi(t.Rating.String)
		if err != nil {
			rating = 0
		} else {
			rating = int32(r)
		}
	}
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
		UpdatedAt:        t.UpdatedAt,
		StripeCustomerId: t.StripeCustomerID.String,
		Bio:              t.Bio,
		HourRate:         t.HourRate,
		TopAgent:         t.TopAgent,
		Rating:           rating,
		SpokenLanguages:  pgRowToSpokenLang(t.SpokenLanguages),
		TopicsTaught:     pgArrayToStringArray(t.TopicsTaught),
	}
}
