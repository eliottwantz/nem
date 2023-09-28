// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.20.0
// source: learn.sql

package db

import (
	"context"

	"github.com/google/uuid"
)

const addUserToLearn = `-- name: AddUserToLearn :exec

INSERT INTO
    "user_learn" (user_id, learn_id)
VALUES ($1, $2) ON CONFLICT (user_id, learn_id)
DO NOTHING RETURNING user_id, learn_id, created_at, updated_at
`

type AddUserToLearnParams struct {
	UserID  uuid.UUID
	LearnID int32
}

func (q *Queries) AddUserToLearn(ctx context.Context, arg AddUserToLearnParams) error {
	_, err := q.db.ExecContext(ctx, addUserToLearn, arg.UserID, arg.LearnID)
	return err
}

const createLearn = `-- name: CreateLearn :one

INSERT INTO
    "learn" (language, topic)
VALUES ($1, $2) ON CONFLICT (language, topic)
DO NOTHING RETURNING id, language, topic
`

type CreateLearnParams struct {
	Language string
	Topic    string
}

func (q *Queries) CreateLearn(ctx context.Context, arg CreateLearnParams) (*Learn, error) {
	row := q.db.QueryRowContext(ctx, createLearn, arg.Language, arg.Topic)
	var i Learn
	err := row.Scan(&i.ID, &i.Language, &i.Topic)
	return &i, err
}

const deleteLearn = `-- name: DeleteLearn :exec

DELETE FROM "learn" WHERE id = $1
`

func (q *Queries) DeleteLearn(ctx context.Context, id int32) error {
	_, err := q.db.ExecContext(ctx, deleteLearn, id)
	return err
}

const findLearn = `-- name: FindLearn :one

SELECT id, language, topic FROM "learn" WHERE id = $1
`

func (q *Queries) FindLearn(ctx context.Context, id int32) (*Learn, error) {
	row := q.db.QueryRowContext(ctx, findLearn, id)
	var i Learn
	err := row.Scan(&i.ID, &i.Language, &i.Topic)
	return &i, err
}

const findLearnLangTopic = `-- name: FindLearnLangTopic :one

SELECT id, language, topic FROM "learn" WHERE language = $1 AND topic = $2
`

type FindLearnLangTopicParams struct {
	Language string
	Topic    string
}

func (q *Queries) FindLearnLangTopic(ctx context.Context, arg FindLearnLangTopicParams) (*Learn, error) {
	row := q.db.QueryRowContext(ctx, findLearnLangTopic, arg.Language, arg.Topic)
	var i Learn
	err := row.Scan(&i.ID, &i.Language, &i.Topic)
	return &i, err
}

const listAvailableLearns = `-- name: ListAvailableLearns :many


SELECT DISTINCT l.id, l.language, l.topic
FROM "learn" l
    JOIN "user_learn" uc ON l.id = uc.learn_id
    JOIN "user" u ON u.id = uc.user_id
WHERE u.role = 'teacher'
`

// This means that it is a language and topic taught by a teacher
func (q *Queries) ListAvailableLearns(ctx context.Context) ([]*Learn, error) {
	rows, err := q.db.QueryContext(ctx, listAvailableLearns)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*Learn
	for rows.Next() {
		var i Learn
		if err := rows.Scan(&i.ID, &i.Language, &i.Topic); err != nil {
			return nil, err
		}
		items = append(items, &i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const listLearns = `-- name: ListLearns :many

SELECT id, language, topic FROM "learn"
`

func (q *Queries) ListLearns(ctx context.Context) ([]*Learn, error) {
	rows, err := q.db.QueryContext(ctx, listLearns)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*Learn
	for rows.Next() {
		var i Learn
		if err := rows.Scan(&i.ID, &i.Language, &i.Topic); err != nil {
			return nil, err
		}
		items = append(items, &i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const listLearnsOfUser = `-- name: ListLearnsOfUser :many

SELECT l.id, l.language, l.topic
FROM "learn" l
    JOIN "user_learn" uc ON l.id = uc.learn_id
WHERE uc.user_id = $1
ORDER BY uc.created_at ASC
`

func (q *Queries) ListLearnsOfUser(ctx context.Context, userID uuid.UUID) ([]*Learn, error) {
	rows, err := q.db.QueryContext(ctx, listLearnsOfUser, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*Learn
	for rows.Next() {
		var i Learn
		if err := rows.Scan(&i.ID, &i.Language, &i.Topic); err != nil {
			return nil, err
		}
		items = append(items, &i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const listLearnsWhereLangIs = `-- name: ListLearnsWhereLangIs :many

SELECT id, language, topic FROM "learn" WHERE language = $1
`

func (q *Queries) ListLearnsWhereLangIs(ctx context.Context, language string) ([]*Learn, error) {
	rows, err := q.db.QueryContext(ctx, listLearnsWhereLangIs, language)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*Learn
	for rows.Next() {
		var i Learn
		if err := rows.Scan(&i.ID, &i.Language, &i.Topic); err != nil {
			return nil, err
		}
		items = append(items, &i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const listLearnsWhereTopicIs = `-- name: ListLearnsWhereTopicIs :many

SELECT id, language, topic FROM "learn" WHERE topic = $1
`

func (q *Queries) ListLearnsWhereTopicIs(ctx context.Context, topic string) ([]*Learn, error) {
	rows, err := q.db.QueryContext(ctx, listLearnsWhereTopicIs, topic)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*Learn
	for rows.Next() {
		var i Learn
		if err := rows.Scan(&i.ID, &i.Language, &i.Topic); err != nil {
			return nil, err
		}
		items = append(items, &i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const listTeachersForLearn = `-- name: ListTeachersForLearn :many

SELECT DISTINCT u.id, u.first_name, u.last_name, u.role, u.prefered_language, u.avatar_file_path, u.avatar_url, u.created_at, u.updated_at
FROM "learn" l
    JOIN "user_learn" uc ON l.id = uc.learn_id
    JOIN "user" u ON u.id = uc.user_id
WHERE
    u.role = 'teacher'
    AND l.language = $1
    AND l.topic = $2
`

type ListTeachersForLearnParams struct {
	Language string
	Topic    string
}

func (q *Queries) ListTeachersForLearn(ctx context.Context, arg ListTeachersForLearnParams) ([]*User, error) {
	rows, err := q.db.QueryContext(ctx, listTeachersForLearn, arg.Language, arg.Topic)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*User
	for rows.Next() {
		var i User
		if err := rows.Scan(
			&i.ID,
			&i.FirstName,
			&i.LastName,
			&i.Role,
			&i.PreferedLanguage,
			&i.AvatarFilePath,
			&i.AvatarUrl,
			&i.CreatedAt,
			&i.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, &i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const listUsersInLearn = `-- name: ListUsersInLearn :many

SELECT u.id, u.first_name, u.last_name, u.role, u.prefered_language, u.avatar_file_path, u.avatar_url, u.created_at, u.updated_at
FROM "user" u
    JOIN "user_learn" uc ON u.id = uc.user_id
WHERE uc.learn_id = $1
`

func (q *Queries) ListUsersInLearn(ctx context.Context, learnID int32) ([]*User, error) {
	rows, err := q.db.QueryContext(ctx, listUsersInLearn, learnID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*User
	for rows.Next() {
		var i User
		if err := rows.Scan(
			&i.ID,
			&i.FirstName,
			&i.LastName,
			&i.Role,
			&i.PreferedLanguage,
			&i.AvatarFilePath,
			&i.AvatarUrl,
			&i.CreatedAt,
			&i.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, &i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const removeUserFromLearn = `-- name: RemoveUserFromLearn :exec

DELETE FROM "user_learn" WHERE user_id = $1 AND learn_id = $2
`

type RemoveUserFromLearnParams struct {
	UserID  uuid.UUID
	LearnID int32
}

func (q *Queries) RemoveUserFromLearn(ctx context.Context, arg RemoveUserFromLearnParams) error {
	_, err := q.db.ExecContext(ctx, removeUserFromLearn, arg.UserID, arg.LearnID)
	return err
}
