-- name: ListUsers :many

SELECT * FROM "user";

-- name: ListStudents :many

SELECT * FROM "user" WHERE role = 'student';

-- name: ListTeachers :many

SELECT * FROM "user" WHERE role = 'teacher';

-- name: FindUserByID :one

SELECT * FROM "user" WHERE id = $1;

-- name: CreateUser :one

INSERT INTO
    "user" (
        id,
        first_name,
        last_name,
        role,
        prefered_language
    )
VALUES ($1, $2, $3, $4, $5) RETURNING *;

-- name: UpdateUserNames :one

UPDATE "user"
SET
    first_name = $1,
    last_name = $2
WHERE id = $3 RETURNING *;

-- name: UpdateAvatar :exec

UPDATE "user"
SET
    avatar_file_path = $1,
    avatar_url = $2
WHERE id = $3;

-- name: DeleteAvatar :exec

UPDATE "user"
SET
    avatar_file_path = NULL,
    avatar_url = NULL
WHERE id = $1;

-- name: UpdateUserPreferedLanguage :exec

UPDATE "user" SET prefered_language = $1 WHERE id = $2;

-- name: DeleteUser :exec

DELETE FROM "user" WHERE id = $1;

-- name: SetUserRole :exec

UPDATE "user" SET role = $1 WHERE id = $2;