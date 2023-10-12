package db

import (
	"context"

	"github.com/google/uuid"
)

func FindFullTeacher(ctx context.Context, q *Queries, id uuid.UUID) (*FindTeacherByIDRow, []*SpokenLanguage, []*Topic, error) {
	teacher, err := q.FindTeacherByID(ctx, id)
	if err != nil {
		return nil, nil, nil, err
	}

	topicsTaught, err := q.ListTopicTaughtOfTeacher(ctx, teacher.ID)
	if err != nil {
		return nil, nil, nil, err
	}

	spokenLanguages, err := q.ListSpokenLanguagesOfTeacher(ctx, teacher.ID)
	if err != nil {
		return nil, nil, nil, err
	}

	return teacher, spokenLanguages, topicsTaught, nil
}
