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

func FromDBSpokenLanguage(dbSpokenLanguage []*db.SpokenLanguage) []*SpokenLanguage {
	ret := make([]*SpokenLanguage, 0, len(dbSpokenLanguage))
	for _, dbSpokenLanguage := range dbSpokenLanguage {
		ret = append(ret, &SpokenLanguage{
			Id:          dbSpokenLanguage.ID.String(),
			Language:    dbSpokenLanguage.Language,
			Proficiency: dbSpokenLanguage.Proficiency,
		})
	}
	return ret
}

func FromDbTopicsTaught(t []*db.TopicTaught) []*TopicTaught {
	ret := make([]*TopicTaught, 0, len(t))
	for _, tt := range t {
		ret = append(ret, &TopicTaught{
			Id:       tt.ID,
			Topic:    tt.Topic,
			Language: tt.Language,
		})
	}
	return ret
}

func FromDbTeacher(u *db.User, t *db.Teacher, tt []*db.TopicTaught, lang []*db.SpokenLanguage) *Teacher {
	return &Teacher{
		BaseUser:        FromDbUser(u),
		Bio:             t.Bio,
		HourRate:        t.HourRate,
		SpokenLanguages: FromDBSpokenLanguage(lang),
		TopicsTaught:    FromDbTopicsTaught(tt),
	}
}
