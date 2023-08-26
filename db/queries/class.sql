-- name: ListClasses :many

SELECT
    cl.*,
    c.language,
    c.topic
FROM "class" cl
    JOIN "learn" c ON cl.learn_id = c.id
ORDER BY cl.created_at ASC;

-- name: FindClass :one

SELECT
    cl.*,
    c.language,
    c.topic
FROM "class" cl
    JOIN "learn" c ON cl.learn_id = c.id
WHERE cl.id = $1
ORDER BY cl.created_at ASC;

-- name: ListUsersInClass :many

SELECT
    u.id,
    u.first_name,
    u.last_name,
    u.role,
    u.prefered_language,
    u.avatar_file_path,
    u.avatar_url,
    u.created_at
FROM "user" u
    JOIN "user_class" uc ON u.id = uc.user_id
WHERE uc.class_id = $1;

-- name: ListClassesOfUser :many

SELECT
    cl.*,
    c.language,
    c.topic
FROM "class" cl
    JOIN "user_class" uc ON cl.id = uc.class_id
    JOIN "learn" c ON cl.learn_id = c.id
WHERE uc.user_id = $1
ORDER BY uc.created_at ASC;

-- name: CreateClass :one

INSERT INTO
    "class" (
        name,
        learn_id,
        start_at,
        end_at
    )
VALUES ($1, $2, $3, $4) RETURNING *;

-- name: AddUserToClass :exec

INSERT INTO
    "user_class" (user_id, class_id)
VALUES ($1, $2) ON CONFLICT (user_id, class_id)
DO NOTHING;

-- name: RemoveUserFromClass :exec

DELETE FROM "user_class" WHERE user_id = $1 AND class_id = $2;

-- name: DeleteClass :exec

DELETE FROM "class" WHERE id = $1;