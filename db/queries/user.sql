-- name: FindUserByID :one
SELECT *
FROM "user"
WHERE id = $1;
-- name: CreateUser :one
INSERT INTO "user" (
        id,
        email,
        first_name,
        last_name,
        role,
        prefered_language
    )
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;
-- name: UpdateUserNames :one
UPDATE "user"
SET first_name = $1,
    last_name = $2
WHERE id = $3
RETURNING *;
-- name: UpdateAvatar :exec
UPDATE "user"
SET avatar_file_path = $1,
    avatar_url = $2
WHERE id = $3;
-- name: DeleteAvatar :exec
UPDATE "user"
SET avatar_file_path = '',
    avatar_url = ''
WHERE id = $1;
-- name: UpdateUserPreferedLanguage :exec
UPDATE "user"
SET prefered_language = $1
WHERE id = $2;
-- name: DeleteUser :exec
DELETE FROM "user"
WHERE id = $1;
-- name: AddStripeCustomerId :exec
UPDATE "user"
SET stripe_customer_id = $1
WHERE id = $2;