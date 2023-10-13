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

// func FromDBSpokenLanguage(dbSpokenLanguage []*db.SpokenLanguage) []*SpokenLanguage {
// 	ret := make([]*SpokenLanguage, 0, len(dbSpokenLanguage))
// 	for _, dbSpokenLanguage := range dbSpokenLanguage {
// 		ret = append(ret, &SpokenLanguage{
// 			Id:          dbSpokenLanguage.ID,
// 			Language:    dbSpokenLanguage.Language,
// 			Proficiency: dbSpokenLanguage.Proficiency,
// 		})
// 	}
// 	return ret
// }

func FromDbTopicsTaught(t []*db.Topic) []*Topic {
	ret := make([]*Topic, 0, len(t))
	for _, tt := range t {
		ret = append(ret, &Topic{
			Id:    tt.ID,
			Topic: tt.Topic,
		})
	}
	return ret
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
		SpokenLanguages:  t.SpokenLanguages.([]*SpokenLanguage),
		TopicsTaught:     t.TopicsTaught.([]string),
	}
}
