// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.20.0
// source: user.sql

package db

import (
	"context"

	"github.com/google/uuid"
)

const addToListOfStudents = `-- name: AddToListOfStudents :exec

INSERT INTO
    "students_teacher" (teacher_id, student_id)
VALUES ($1, $2)
`

type AddToListOfStudentsParams struct {
	TeacherID uuid.UUID
	StudentID uuid.UUID
}

func (q *Queries) AddToListOfStudents(ctx context.Context, arg AddToListOfStudentsParams) error {
	_, err := q.db.ExecContext(ctx, addToListOfStudents, arg.TeacherID, arg.StudentID)
	return err
}

const createUser = `-- name: CreateUser :one

INSERT INTO
    "user" (
        id,
        email,
        first_name,
        last_name,
        role,
        prefered_language
    )
VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, first_name, last_name, role, prefered_language, avatar_file_path, avatar_url, created_at, updated_at
`

type CreateUserParams struct {
	ID               uuid.UUID
	Email            string
	FirstName        string
	LastName         string
	Role             Role
	PreferedLanguage string
}

func (q *Queries) CreateUser(ctx context.Context, arg CreateUserParams) (*User, error) {
	row := q.db.QueryRowContext(ctx, createUser,
		arg.ID,
		arg.Email,
		arg.FirstName,
		arg.LastName,
		arg.Role,
		arg.PreferedLanguage,
	)
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
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return &i, err
}

const deleteAvatar = `-- name: DeleteAvatar :exec

UPDATE "user"
SET
    avatar_file_path = NULL,
    avatar_url = NULL
WHERE id = $1
`

func (q *Queries) DeleteAvatar(ctx context.Context, id uuid.UUID) error {
	_, err := q.db.ExecContext(ctx, deleteAvatar, id)
	return err
}

const deleteUser = `-- name: DeleteUser :exec

DELETE FROM "user" WHERE id = $1
`

func (q *Queries) DeleteUser(ctx context.Context, id uuid.UUID) error {
	_, err := q.db.ExecContext(ctx, deleteUser, id)
	return err
}

const findUserByID = `-- name: FindUserByID :one

SELECT id, email, first_name, last_name, role, prefered_language, avatar_file_path, avatar_url, created_at, updated_at FROM "user" WHERE id = $1
`

func (q *Queries) FindUserByID(ctx context.Context, id uuid.UUID) (*User, error) {
	row := q.db.QueryRowContext(ctx, findUserByID, id)
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
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return &i, err
}

const listStudents = `-- name: ListStudents :many

SELECT id, email, first_name, last_name, role, prefered_language, avatar_file_path, avatar_url, created_at, updated_at FROM "user" WHERE role = 'student'
`

func (q *Queries) ListStudents(ctx context.Context) ([]*User, error) {
	rows, err := q.db.QueryContext(ctx, listStudents)
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

const listStudentsOfTeacher = `-- name: ListStudentsOfTeacher :many

SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.prefered_language, u.avatar_file_path, u.avatar_url, u.created_at, u.updated_at
FROM "students_teacher" sot
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

const listUsers = `-- name: ListUsers :many

SELECT id, email, first_name, last_name, role, prefered_language, avatar_file_path, avatar_url, created_at, updated_at FROM "user"
`

func (q *Queries) ListUsers(ctx context.Context) ([]*User, error) {
	rows, err := q.db.QueryContext(ctx, listUsers)
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

const setUserRole = `-- name: SetUserRole :exec

UPDATE "user" SET role = $1 WHERE id = $2
`

type SetUserRoleParams struct {
	Role Role
	ID   uuid.UUID
}

func (q *Queries) SetUserRole(ctx context.Context, arg SetUserRoleParams) error {
	_, err := q.db.ExecContext(ctx, setUserRole, arg.Role, arg.ID)
	return err
}

const updateAvatar = `-- name: UpdateAvatar :exec

UPDATE "user"
SET
    avatar_file_path = $1,
    avatar_url = $2
WHERE id = $3
`

type UpdateAvatarParams struct {
	AvatarFilePath string
	AvatarUrl      string
	ID             uuid.UUID
}

func (q *Queries) UpdateAvatar(ctx context.Context, arg UpdateAvatarParams) error {
	_, err := q.db.ExecContext(ctx, updateAvatar, arg.AvatarFilePath, arg.AvatarUrl, arg.ID)
	return err
}

const updateUserNames = `-- name: UpdateUserNames :one

UPDATE "user"
SET
    first_name = $1,
    last_name = $2
WHERE id = $3 RETURNING id, email, first_name, last_name, role, prefered_language, avatar_file_path, avatar_url, created_at, updated_at
`

type UpdateUserNamesParams struct {
	FirstName string
	LastName  string
	ID        uuid.UUID
}

func (q *Queries) UpdateUserNames(ctx context.Context, arg UpdateUserNamesParams) (*User, error) {
	row := q.db.QueryRowContext(ctx, updateUserNames, arg.FirstName, arg.LastName, arg.ID)
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
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return &i, err
}

const updateUserPreferedLanguage = `-- name: UpdateUserPreferedLanguage :exec

UPDATE "user" SET prefered_language = $1 WHERE id = $2
`

type UpdateUserPreferedLanguageParams struct {
	PreferedLanguage string
	ID               uuid.UUID
}

func (q *Queries) UpdateUserPreferedLanguage(ctx context.Context, arg UpdateUserPreferedLanguageParams) error {
	_, err := q.db.ExecContext(ctx, updateUserPreferedLanguage, arg.PreferedLanguage, arg.ID)
	return err
}
