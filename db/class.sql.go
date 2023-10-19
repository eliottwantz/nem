// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.22.0
// source: class.sql

package db

import (
	"context"
	"time"

	"github.com/google/uuid"
)

const addStudentToClass = `-- name: AddStudentToClass :exec
INSERT INTO "student_class" (student_id, class_id)
VALUES ($1, $2)
`

type AddStudentToClassParams struct {
	StudentID uuid.UUID
	ClassID   uuid.UUID
}

func (q *Queries) AddStudentToClass(ctx context.Context, arg AddStudentToClassParams) error {
	_, err := q.db.ExecContext(ctx, addStudentToClass, arg.StudentID, arg.ClassID)
	return err
}

const createClass = `-- name: CreateClass :one
INSERT INTO "class" (
        name,
        is_private,
        language,
        topic,
        time_slot_id
    )
VALUES ($1, $2, $3, $4, $5)
RETURNING id, name, is_private, language, topic, time_slot_id, has_started, created_at
`

type CreateClassParams struct {
	Name       string
	IsPrivate  bool
	Language   string
	Topic      string
	TimeSlotID uuid.UUID
}

func (q *Queries) CreateClass(ctx context.Context, arg CreateClassParams) (*Class, error) {
	row := q.db.QueryRowContext(ctx, createClass,
		arg.Name,
		arg.IsPrivate,
		arg.Language,
		arg.Topic,
		arg.TimeSlotID,
	)
	var i Class
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.IsPrivate,
		&i.Language,
		&i.Topic,
		&i.TimeSlotID,
		&i.HasStarted,
		&i.CreatedAt,
	)
	return &i, err
}

const deleteClass = `-- name: DeleteClass :exec
DELETE FROM "class"
WHERE id = $1
`

func (q *Queries) DeleteClass(ctx context.Context, id uuid.UUID) error {
	_, err := q.db.ExecContext(ctx, deleteClass, id)
	return err
}

const findClass = `-- name: FindClass :one
SELECT cl.id, cl.name, cl.is_private, cl.language, cl.topic, cl.time_slot_id, cl.has_started, cl.created_at,
    ts.teacher_id,
    ts.start_at,
    ts.end_at
FROM "class" cl
    JOIN "time_slots" ts ON cl.time_slot_id = ts.id
WHERE cl.id = $1
ORDER BY cl.created_at ASC
`

type FindClassRow struct {
	ID         uuid.UUID
	Name       string
	IsPrivate  bool
	Language   string
	Topic      string
	TimeSlotID uuid.UUID
	HasStarted bool
	CreatedAt  time.Time
	TeacherID  uuid.UUID
	StartAt    time.Time
	EndAt      time.Time
}

func (q *Queries) FindClass(ctx context.Context, id uuid.UUID) (*FindClassRow, error) {
	row := q.db.QueryRowContext(ctx, findClass, id)
	var i FindClassRow
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.IsPrivate,
		&i.Language,
		&i.Topic,
		&i.TimeSlotID,
		&i.HasStarted,
		&i.CreatedAt,
		&i.TeacherID,
		&i.StartAt,
		&i.EndAt,
	)
	return &i, err
}

const findClassByTimeslot = `-- name: FindClassByTimeslot :one
SELECT cl.id, cl.name, cl.is_private, cl.language, cl.topic, cl.time_slot_id, cl.has_started, cl.created_at,
    t.teacher_id,
    t.start_at,
    t.end_at
FROM "class" cl
    JOIN "time_slots" t ON cl.time_slot_id = t.id
WHERE t.id = $1
`

type FindClassByTimeslotRow struct {
	ID         uuid.UUID
	Name       string
	IsPrivate  bool
	Language   string
	Topic      string
	TimeSlotID uuid.UUID
	HasStarted bool
	CreatedAt  time.Time
	TeacherID  uuid.UUID
	StartAt    time.Time
	EndAt      time.Time
}

func (q *Queries) FindClassByTimeslot(ctx context.Context, id uuid.UUID) (*FindClassByTimeslotRow, error) {
	row := q.db.QueryRowContext(ctx, findClassByTimeslot, id)
	var i FindClassByTimeslotRow
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.IsPrivate,
		&i.Language,
		&i.Topic,
		&i.TimeSlotID,
		&i.HasStarted,
		&i.CreatedAt,
		&i.TeacherID,
		&i.StartAt,
		&i.EndAt,
	)
	return &i, err
}

const listClassesOfStudent = `-- name: ListClassesOfStudent :many
SELECT cl.id, cl.name, cl.is_private, cl.language, cl.topic, cl.time_slot_id, cl.has_started, cl.created_at,
    t.teacher_id,
    t.start_at,
    t.end_at
FROM "class" cl
    JOIN "student_class" sc ON cl.id = sc.class_id
    JOIN "time_slots" t ON cl.time_slot_id = t.id
WHERE sc.student_id = $1
ORDER BY sc.created_at ASC
`

type ListClassesOfStudentRow struct {
	ID         uuid.UUID
	Name       string
	IsPrivate  bool
	Language   string
	Topic      string
	TimeSlotID uuid.UUID
	HasStarted bool
	CreatedAt  time.Time
	TeacherID  uuid.UUID
	StartAt    time.Time
	EndAt      time.Time
}

func (q *Queries) ListClassesOfStudent(ctx context.Context, studentID uuid.UUID) ([]*ListClassesOfStudentRow, error) {
	rows, err := q.db.QueryContext(ctx, listClassesOfStudent, studentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*ListClassesOfStudentRow
	for rows.Next() {
		var i ListClassesOfStudentRow
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.IsPrivate,
			&i.Language,
			&i.Topic,
			&i.TimeSlotID,
			&i.HasStarted,
			&i.CreatedAt,
			&i.TeacherID,
			&i.StartAt,
			&i.EndAt,
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

const listClassesOfTeacher = `-- name: ListClassesOfTeacher :many
SELECT cl.id, cl.name, cl.is_private, cl.language, cl.topic, cl.time_slot_id, cl.has_started, cl.created_at,
    t.teacher_id,
    t.start_at,
    t.end_at
FROM "class" cl
    JOIN "time_slots" t ON cl.time_slot_id = t.id
WHERE t.teacher_id = $1
ORDER BY t.start_at ASC
`

type ListClassesOfTeacherRow struct {
	ID         uuid.UUID
	Name       string
	IsPrivate  bool
	Language   string
	Topic      string
	TimeSlotID uuid.UUID
	HasStarted bool
	CreatedAt  time.Time
	TeacherID  uuid.UUID
	StartAt    time.Time
	EndAt      time.Time
}

func (q *Queries) ListClassesOfTeacher(ctx context.Context, teacherID uuid.UUID) ([]*ListClassesOfTeacherRow, error) {
	rows, err := q.db.QueryContext(ctx, listClassesOfTeacher, teacherID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*ListClassesOfTeacherRow
	for rows.Next() {
		var i ListClassesOfTeacherRow
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.IsPrivate,
			&i.Language,
			&i.Topic,
			&i.TimeSlotID,
			&i.HasStarted,
			&i.CreatedAt,
			&i.TeacherID,
			&i.StartAt,
			&i.EndAt,
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

const listStudentsInClass = `-- name: ListStudentsInClass :many
SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.prefered_language, u.avatar_file_path, u.avatar_url, u.stripe_customer_id, u.created_at, u.updated_at
FROM "student" s
    JOIN "user" u ON s.id = u.id
    JOIN "student_class" sc ON u.id = sc.student_id
WHERE sc.class_id = $1
`

func (q *Queries) ListStudentsInClass(ctx context.Context, classID uuid.UUID) ([]*User, error) {
	rows, err := q.db.QueryContext(ctx, listStudentsInClass, classID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*User
	for rows.Next() {
		var i User
		if err := rows.Scan(
			&i.ID,
			&i.Email,
			&i.FirstName,
			&i.LastName,
			&i.Role,
			&i.PreferedLanguage,
			&i.AvatarFilePath,
			&i.AvatarUrl,
			&i.StripeCustomerID,
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

const removeStudentFromClass = `-- name: RemoveStudentFromClass :exec
DELETE FROM "student_class"
WHERE student_id = $1
    AND class_id = $2
`

type RemoveStudentFromClassParams struct {
	StudentID uuid.UUID
	ClassID   uuid.UUID
}

func (q *Queries) RemoveStudentFromClass(ctx context.Context, arg RemoveStudentFromClassParams) error {
	_, err := q.db.ExecContext(ctx, removeStudentFromClass, arg.StudentID, arg.ClassID)
	return err
}

const setClassHasStarted = `-- name: SetClassHasStarted :exec
UPDATE "class"
SET has_started = true
WHERE id = $1
`

func (q *Queries) SetClassHasStarted(ctx context.Context, id uuid.UUID) error {
	_, err := q.db.ExecContext(ctx, setClassHasStarted, id)
	return err
}
