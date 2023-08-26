-- name: ListLearns :many

SELECT * FROM "learn";

-- name: FindLearn :one

SELECT * FROM "learn" WHERE id = $1;

-- name: FindLearnLangTopic :one

SELECT * FROM "learn" WHERE language = $1 AND topic = $2;

-- name: ListLearnsWhereLangIs :many

SELECT * FROM "learn" WHERE language = $1;

-- name: ListLearnsWhereTopicIs :many

SELECT * FROM "learn" WHERE topic = $1;

-- name: ListUsersInLearn :many

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
    JOIN "user_learn" uc ON u.id = uc.user_id
WHERE uc.learn_id = $1;

-- name: ListLearnsOfUser :many

SELECT l.*
FROM "learn" l
    JOIN "user_learn" uc ON l.id = uc.learn_id
WHERE uc.user_id = $1
ORDER BY uc.created_at ASC;

-- name: ListAvailableLearns :many

-- This means that it is a language and topic taught by a teacher

SELECT DISTINCT l.*
FROM "learn" l
    JOIN "user_learn" uc ON l.id = uc.learn_id
    JOIN "user" u ON u.id = uc.user_id
WHERE u.role = 'teacher';

-- name: CreateLearn :one

INSERT INTO
    "learn" (language, topic)
VALUES ($1, $2) ON CONFLICT (language, topic)
DO NOTHING RETURNING *;

-- name: AddUserToLearn :exec

INSERT INTO
    "user_learn" (user_id, learn_id)
VALUES ($1, $2) ON CONFLICT (user_id, learn_id)
DO NOTHING RETURNING *;

-- name: RemoveUserFromLearn :exec

DELETE FROM "user_learn" WHERE user_id = $1 AND learn_id = $2;

-- name: DeleteLearn :exec

DELETE FROM "learn" WHERE id = $1;