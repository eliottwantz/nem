-- name: ListTopicTaught :many

SELECT * FROM "topic_taught";

-- name: FindTopicTaught :one

SELECT * FROM "topic_taught" WHERE id = $1;

-- name: FindTopicTaughtLangTopic :one

SELECT * FROM "topic_taught" WHERE language = $1 AND topic = $2;

-- name: ListTopicTaughtWhereLangIs :many

SELECT * FROM "topic_taught" WHERE language = $1;

-- name: ListTopicTaughtWhereTopicIs :many

SELECT * FROM "topic_taught" WHERE topic = $1;

-- name: ListTopicTaughtOfTeacher :many

SELECT tt.*
FROM "topic_taught" tt
    JOIN "teacher_topic_taught" t ON tt.id = t.topic_taught_id
WHERE t.teacher_id = $1;

-- name: ListAvailableTopicTaught :many

SELECT DISTINCT tt.*
FROM "topic_taught" tt
    JOIN "teacher_topic_taught" ttt ON tt.id = ttt.topic_taught_id
    JOIN "teacher" t ON ttt.teacher_id = t.id;

-- name: CreateTopicTaught :one

INSERT INTO
    "topic_taught" (language, topic)
VALUES ($1, $2) ON CONFLICT (language, topic)
DO NOTHING RETURNING *;

-- name: AddTeacherToTopicTaught :exec

INSERT INTO
    "teacher_topic_taught" (teacher_id, topic_taught_id)
VALUES ($1, $2) ON CONFLICT (teacher_id, topic_taught_id)
DO NOTHING RETURNING *;

-- name: RemoveTeacherFromTopicTaught :exec

DELETE FROM
    "teacher_topic_taught"
WHERE
    teacher_id = $1
    AND topic_taught_id = $2;

-- name: DeleteTopicTaught :exec

DELETE FROM "topic_taught" WHERE id = $1;