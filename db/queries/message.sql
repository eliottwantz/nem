-- name: ListMessages :many

SELECT * FROM "message";

-- name: CreateMessage :one

INSERT INTO
    "message" ("user_id", "class_id", "text")
VALUES ($1, $2, $3) RETURNING *;

-- name: UpdateMessage :one

UPDATE "message"
SET
    "text" = $1,
    "updated_at" = $2
WHERE "id" = $3 RETURNING *;

-- name: DeleteMessage :exec

DELETE FROM "message" WHERE "id" = $1;