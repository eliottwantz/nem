// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.22.0
// source: student.sql

package db

import (
	"context"

	"github.com/google/uuid"
)

const addHoursToHoursBank = `-- name: AddHoursToHoursBank :exec
INSERT INTO "hours_bank" (student_id, teacher_id, hours)
VALUES ($1, $2, $3) ON CONFLICT (student_id, teacher_id) DO
UPDATE
SET hours = hours_bank.hours + $3
`

type AddHoursToHoursBankParams struct {
	StudentID uuid.UUID
	TeacherID uuid.UUID
	Hours     int32
}

func (q *Queries) AddHoursToHoursBank(ctx context.Context, arg AddHoursToHoursBankParams) error {
	_, err := q.db.ExecContext(ctx, addHoursToHoursBank, arg.StudentID, arg.TeacherID, arg.Hours)
	return err
}

const addToStudentsOfTeacher = `-- name: AddToStudentsOfTeacher :exec
INSERT INTO "students_of_teacher" (teacher_id, student_id)
VALUES ($1, $2)
`

type AddToStudentsOfTeacherParams struct {
	TeacherID uuid.UUID
	StudentID uuid.UUID
}

func (q *Queries) AddToStudentsOfTeacher(ctx context.Context, arg AddToStudentsOfTeacherParams) error {
	_, err := q.db.ExecContext(ctx, addToStudentsOfTeacher, arg.TeacherID, arg.StudentID)
	return err
}

const createStudent = `-- name: CreateStudent :one
INSERT INTO "student" (id)
VALUES ($1)
RETURNING id
`

func (q *Queries) CreateStudent(ctx context.Context, id uuid.UUID) (uuid.UUID, error) {
	row := q.db.QueryRowContext(ctx, createStudent, id)
	err := row.Scan(&id)
	return id, err
}

const createSubscriptionStudent = `-- name: CreateSubscriptionStudent :exec
INSERT INTO "subscription_student" (subscription_id, teacher_id, student_id)
VALUES ($1, $2, $3)
`

type CreateSubscriptionStudentParams struct {
	SubscriptionID string
	TeacherID      uuid.UUID
	StudentID      uuid.UUID
}

func (q *Queries) CreateSubscriptionStudent(ctx context.Context, arg CreateSubscriptionStudentParams) error {
	_, err := q.db.ExecContext(ctx, createSubscriptionStudent, arg.SubscriptionID, arg.TeacherID, arg.StudentID)
	return err
}

const findStudentByID = `-- name: FindStudentByID :one
SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.prefered_language, u.avatar_file_path, u.avatar_url, u.stripe_customer_id, u.created_at, u.updated_at
FROM "student" s
    JOIN "user" u ON s.id = u.id
WHERE s.id = $1
`

func (q *Queries) FindStudentByID(ctx context.Context, id uuid.UUID) (*User, error) {
	row := q.db.QueryRowContext(ctx, findStudentByID, id)
	var i User
	err := row.Scan(
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
	)
	return &i, err
}

const findStudentOfTeacher = `-- name: FindStudentOfTeacher :one
SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.prefered_language, u.avatar_file_path, u.avatar_url, u.stripe_customer_id, u.created_at, u.updated_at
FROM "students_of_teacher" sot
    JOIN "teacher" t ON sot.teacher_id = t.id
    JOIN "user" u ON sot.student_id = u.id
WHERE t.id = $1
    AND sot.student_id = $2
`

type FindStudentOfTeacherParams struct {
	ID        uuid.UUID
	StudentID uuid.UUID
}

func (q *Queries) FindStudentOfTeacher(ctx context.Context, arg FindStudentOfTeacherParams) (*User, error) {
	row := q.db.QueryRowContext(ctx, findStudentOfTeacher, arg.ID, arg.StudentID)
	var i User
	err := row.Scan(
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
	)
	return &i, err
}

const getHoursBankForTeacher = `-- name: GetHoursBankForTeacher :one
SELECT hours, student_id, teacher_id
FROM "hours_bank"
WHERE teacher_id = $1
    AND student_id = $2
`

type GetHoursBankForTeacherParams struct {
	TeacherID uuid.UUID
	StudentID uuid.UUID
}

func (q *Queries) GetHoursBankForTeacher(ctx context.Context, arg GetHoursBankForTeacherParams) (*HoursBank, error) {
	row := q.db.QueryRowContext(ctx, getHoursBankForTeacher, arg.TeacherID, arg.StudentID)
	var i HoursBank
	err := row.Scan(&i.Hours, &i.StudentID, &i.TeacherID)
	return &i, err
}

const listStudentsOfTeacher = `-- name: ListStudentsOfTeacher :many
SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.prefered_language, u.avatar_file_path, u.avatar_url, u.stripe_customer_id, u.created_at, u.updated_at
FROM "students_of_teacher" sot
    JOIN "teacher" t ON sot.teacher_id = t.id
    JOIN "user" u ON sot.student_id = u.id
WHERE t.id = $1
`

func (q *Queries) ListStudentsOfTeacher(ctx context.Context, id uuid.UUID) ([]*User, error) {
	rows, err := q.db.QueryContext(ctx, listStudentsOfTeacher, id)
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
