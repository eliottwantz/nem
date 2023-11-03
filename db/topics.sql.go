// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.23.0
// source: topics.sql

package db

import (
	"context"

	"github.com/google/uuid"
)

const addTeacherToTopics = `-- name: AddTeacherToTopics :exec
INSERT INTO teacher_topic (teacher_id, topic_id)
VALUES ($1, $2) ON CONFLICT (teacher_id, topic_id) DO NOTHING
RETURNING teacher_id, topic_id
`

type AddTeacherToTopicsParams struct {
	TeacherID uuid.UUID
	TopicID   int32
}

func (q *Queries) AddTeacherToTopics(ctx context.Context, arg AddTeacherToTopicsParams) error {
	_, err := q.db.ExecContext(ctx, addTeacherToTopics, arg.TeacherID, arg.TopicID)
	return err
}

const findTopic = `-- name: FindTopic :one
SELECT id, topic
FROM "topics" t
WHERE t.topic = $1
`

func (q *Queries) FindTopic(ctx context.Context, topic string) (*Topic, error) {
	row := q.db.QueryRowContext(ctx, findTopic, topic)
	var i Topic
	err := row.Scan(&i.ID, &i.Topic)
	return &i, err
}

const listAvailableTopics = `-- name: ListAvailableTopics :many
SELECT DISTINCT tt.id, tt.topic
FROM topics tt
    JOIN teacher_topic ttt ON tt.id = ttt.topic_id
    JOIN "teacher" t ON ttt.teacher_id = t.id
`

func (q *Queries) ListAvailableTopics(ctx context.Context) ([]*Topic, error) {
	rows, err := q.db.QueryContext(ctx, listAvailableTopics)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*Topic
	for rows.Next() {
		var i Topic
		if err := rows.Scan(&i.ID, &i.Topic); err != nil {
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

const listTopics = `-- name: ListTopics :many
SELECT id, topic
FROM "topics"
`

func (q *Queries) ListTopics(ctx context.Context) ([]*Topic, error) {
	rows, err := q.db.QueryContext(ctx, listTopics)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*Topic
	for rows.Next() {
		var i Topic
		if err := rows.Scan(&i.ID, &i.Topic); err != nil {
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

const listTopicsOfTeacher = `-- name: ListTopicsOfTeacher :many
SELECT tt.id, tt.topic
FROM topics tt
    JOIN teacher_topic t ON tt.id = t.topic_id
WHERE t.teacher_id = $1
`

func (q *Queries) ListTopicsOfTeacher(ctx context.Context, teacherID uuid.UUID) ([]*Topic, error) {
	rows, err := q.db.QueryContext(ctx, listTopicsOfTeacher, teacherID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*Topic
	for rows.Next() {
		var i Topic
		if err := rows.Scan(&i.ID, &i.Topic); err != nil {
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

const listTopicsWhereTopicsIs = `-- name: ListTopicsWhereTopicsIs :many
SELECT id, topic
FROM "topics"
WHERE topic = $1
`

func (q *Queries) ListTopicsWhereTopicsIs(ctx context.Context, topic string) ([]*Topic, error) {
	rows, err := q.db.QueryContext(ctx, listTopicsWhereTopicsIs, topic)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*Topic
	for rows.Next() {
		var i Topic
		if err := rows.Scan(&i.ID, &i.Topic); err != nil {
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

const removeTeacherFromTopics = `-- name: RemoveTeacherFromTopics :exec
DELETE FROM teacher_topic
WHERE teacher_id = $1
    AND topic_id = $2
`

type RemoveTeacherFromTopicsParams struct {
	TeacherID uuid.UUID
	TopicID   int32
}

func (q *Queries) RemoveTeacherFromTopics(ctx context.Context, arg RemoveTeacherFromTopicsParams) error {
	_, err := q.db.ExecContext(ctx, removeTeacherFromTopics, arg.TeacherID, arg.TopicID)
	return err
}
