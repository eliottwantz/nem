-- name: ListTeacherAvailabilities :many

SELECT * FROM "teacher_availabilities" WHERE "teacher_id" = $1;

-- name: AddTeacherAvailability :one

INSERT INTO
    "teacher_availabilities" (
        "teacher_id",
        "startAt",
        "endAt"
    )
VALUES ($1, $2, $3) RETURNING *;

-- name: DeleteTeacherAvailability :exec

DELETE FROM
    "teacher_availabilities"
WHERE
    "id" = $1
    AND "teacher_id" = $2;

-- name: UpdateTeacherAvailability :one

UPDATE
    "teacher_availabilities"
SET "startAt" = $1, "endAt" = $2
WHERE
    "id" = $3
    AND "teacher_id" = $4 RETURNING *;