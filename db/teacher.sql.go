// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.20.0
// source: teacher.sql

package db

import (
	"context"
	"database/sql"
	"time"

	"github.com/google/uuid"
)

const findTeacherByID = `-- name: FindTeacherByID :one

SELECT t.bio, t.hour_rate, u.id, u.email, u.first_name, u.last_name, u.role, u.prefered_language, u.avatar_file_path, u.avatar_url, u.created_at, u.updated_at
FROM "teacher" t
    JOIN "user" u ON t.id = u.id
WHERE u.id = $1
`

type FindTeacherByIDRow struct {
	Bio              string
	HourRate         int32
	ID               uuid.UUID
	Email            string
	FirstName        string
	LastName         string
	Role             Role
	PreferedLanguage string
	AvatarFilePath   string
	AvatarUrl        string
	CreatedAt        time.Time
	UpdatedAt        sql.NullTime
}

func (q *Queries) FindTeacherByID(ctx context.Context, id uuid.UUID) (*FindTeacherByIDRow, error) {
	row := q.db.QueryRowContext(ctx, findTeacherByID, id)
	var i FindTeacherByIDRow
	err := row.Scan(
		&i.Bio,
		&i.HourRate,
		&i.ID,
		&i.Email,
		&i.FirstName,
		&i.LastName,
		&i.Role,
		&i.PreferedLanguage,
		&i.AvatarFilePath,
		&i.AvatarUrl,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return &i, err
}

const listSpokenLanguagesOfTeacher = `-- name: ListSpokenLanguagesOfTeacher :many

SELECT sl.id, sl.language, sl.proficiency
FROM
    "teacher_spoken_language" tsl
    JOIN "spoken_language" sl ON tsl.spoken_language_id = sl.id
WHERE tsl.teacher_id = $1
`

func (q *Queries) ListSpokenLanguagesOfTeacher(ctx context.Context, teacherID uuid.UUID) ([]*SpokenLanguage, error) {
	rows, err := q.db.QueryContext(ctx, listSpokenLanguagesOfTeacher, teacherID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*SpokenLanguage
	for rows.Next() {
		var i SpokenLanguage
		if err := rows.Scan(&i.ID, &i.Language, &i.Proficiency); err != nil {
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

const listTeachers = `-- name: ListTeachers :many

SELECT t.bio, t.hour_rate, u.id, u.email, u.first_name, u.last_name, u.role, u.prefered_language, u.avatar_file_path, u.avatar_url, u.created_at, u.updated_at
FROM "teacher" t
    JOIN "user" u ON sot.teacher_id = u.id
`

type ListTeachersRow struct {
	Bio              string
	HourRate         int32
	ID               uuid.UUID
	Email            string
	FirstName        string
	LastName         string
	Role             Role
	PreferedLanguage string
	AvatarFilePath   string
	AvatarUrl        string
	CreatedAt        time.Time
	UpdatedAt        sql.NullTime
}

func (q *Queries) ListTeachers(ctx context.Context) ([]*ListTeachersRow, error) {
	rows, err := q.db.QueryContext(ctx, listTeachers)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*ListTeachersRow
	for rows.Next() {
		var i ListTeachersRow
		if err := rows.Scan(
			&i.Bio,
			&i.HourRate,
			&i.ID,
			&i.Email,
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

const listTeachersForTopicTaught = `-- name: ListTeachersForTopicTaught :many

SELECT
    DISTINCT t.bio,
    t.hour_rate,
    u.id, u.email, u.first_name, u.last_name, u.role, u.prefered_language, u.avatar_file_path, u.avatar_url, u.created_at, u.updated_at
FROM "topic_taught" tt
    JOIN "teacher_topic_taught" ttt ON tt.id = ttt.topic_taught_id
    JOIN "teacher" t ON t.id = ttt.teacher_id
    JOIN "user" u ON u.id = ttt.teacher_id
WHERE
    tt.language = $1
    AND tt.topic = $2
`

type ListTeachersForTopicTaughtParams struct {
	Language string
	Topic    string
}

type ListTeachersForTopicTaughtRow struct {
	Bio              string
	HourRate         int32
	ID               uuid.UUID
	Email            string
	FirstName        string
	LastName         string
	Role             Role
	PreferedLanguage string
	AvatarFilePath   string
	AvatarUrl        string
	CreatedAt        time.Time
	UpdatedAt        sql.NullTime
}

func (q *Queries) ListTeachersForTopicTaught(ctx context.Context, arg ListTeachersForTopicTaughtParams) ([]*ListTeachersForTopicTaughtRow, error) {
	rows, err := q.db.QueryContext(ctx, listTeachersForTopicTaught, arg.Language, arg.Topic)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*ListTeachersForTopicTaughtRow
	for rows.Next() {
		var i ListTeachersForTopicTaughtRow
		if err := rows.Scan(
			&i.Bio,
			&i.HourRate,
			&i.ID,
			&i.Email,
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

const listTeachersOfStudent = `-- name: ListTeachersOfStudent :many

SELECT t.bio, t.hour_rate, u.id, u.email, u.first_name, u.last_name, u.role, u.prefered_language, u.avatar_file_path, u.avatar_url, u.created_at, u.updated_at
FROM "students_teacher" sot
    JOIN "teacher" t ON sot.teacher_id = t.id
    JOIN "user" u ON sot.teacher_id = u.id
WHERE sot.student_id = $1
`

type ListTeachersOfStudentRow struct {
	Bio              string
	HourRate         int32
	ID               uuid.UUID
	Email            string
	FirstName        string
	LastName         string
	Role             Role
	PreferedLanguage string
	AvatarFilePath   string
	AvatarUrl        string
	CreatedAt        time.Time
	UpdatedAt        sql.NullTime
}

func (q *Queries) ListTeachersOfStudent(ctx context.Context, studentID uuid.UUID) ([]*ListTeachersOfStudentRow, error) {
	rows, err := q.db.QueryContext(ctx, listTeachersOfStudent, studentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*ListTeachersOfStudentRow
	for rows.Next() {
		var i ListTeachersOfStudentRow
		if err := rows.Scan(
			&i.Bio,
			&i.HourRate,
			&i.ID,
			&i.Email,
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
