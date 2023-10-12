-- name: ListTopics :many
SELECT *
FROM "topics";
-- name: FindTopics :one
SELECT *
FROM "topics"
WHERE id = $1;
-- name: ListTopicsWhereTopicsIs :many
SELECT *
FROM "topics"
WHERE topic = $1;
-- name: ListTopicsOfTeacher :many
SELECT tt.*
FROM topics tt
    JOIN teacher_topic t ON tt.id = t.topic_id
WHERE t.teacher_id = $1;
-- name: ListAvailableTopics :many
SELECT DISTINCT tt.*
FROM topics tt
    JOIN teacher_topic ttt ON tt.id = ttt.topic_id
    JOIN "teacher" t ON ttt.teacher_id = t.id;
-- name: AddTeacherToTopics :exec
INSERT INTO teacher_topic (teacher_id, topic_id)
VALUES ($1, $2) ON CONFLICT (teacher_id, topic_id) DO NOTHING
RETURNING *;
-- name: RemoveTeacherFromTopics :exec
DELETE FROM teacher_topic
WHERE teacher_id = $1
    AND topic_id = $2;