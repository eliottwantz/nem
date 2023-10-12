-- name: ListTeachersForTopicTaught :many
SELECT DISTINCT t.bio,
    t.hour_rate,
    u.*
FROM "topics" tt
    JOIN teacher_topic ttt ON tt.id = ttt.topic_taught_id
    JOIN "teacher" t ON t.id = ttt.teacher_id
    JOIN "user" u ON u.id = ttt.teacher_id
WHERE tt.topic = $1;
-- name: ListTeachers :many
SELECT "user".*,
    "teacher"."bio",
    "teacher"."hour_rate",
    "teacher"."top_agent",
    ARRAY(
        SELECT ROW(
                "language"."language",
                "spoken_language"."proficiency"
            )
        FROM "teacher_spoken_language"
            JOIN "spoken_language" ON "spoken_language"."id" = "teacher_spoken_language"."spoken_language_id"
            JOIN "language" ON "language"."id" = "spoken_language"."language_id"
        WHERE "teacher_spoken_language"."teacher_id" = "teacher"."id"
    ) AS "spoken_languages",
    ARRAY(
        SELECT ROW(
                "topics"."id",
                "topics"."topic"
            )
        FROM teacher_topic
            JOIN "topics" ON "topics"."id" = teacher_topic."topic_id"
        WHERE teacher_topic."teacher_id" = "teacher"."id"
    ) AS "topics_taught"
FROM "user"
    JOIN "teacher" ON "teacher"."id" = "user"."id";
-- name: FindTeacherByID :one
SELECT t.bio,
    t.hour_rate,
    t.top_agent,
    u.*
FROM "teacher" t
    JOIN "user" u ON t.id = u.id
WHERE t.id = $1;
-- name: ListTeachersOfStudent :many
SELECT t.bio,
    t.hour_rate,
    u.*
FROM "students_of_teacher" sot
    JOIN "teacher" t ON sot.teacher_id = t.id
    JOIN "user" u ON sot.teacher_id = u.id
WHERE sot.student_id = $1;
-- name: CreateTeacher :one
INSERT INTO "teacher" (id, bio, hour_rate)
VALUES ($1, $2, $3)
RETURNING *;
-- name: ListSpokenLanguagesOfTeacher :many
SELECT sl.*
FROM "teacher_spoken_language" tsl
    JOIN "spoken_language" sl ON tsl.spoken_language_id = sl.id
WHERE tsl.teacher_id = $1;
-- name: FindSpokenLanguage :one
SELECT sl.*
FROM "spoken_language" sl
    JOIN "language" l ON sl.language_id = l.id
WHERE l.language = $1
    AND sl.proficiency = $2;
-- name: AddSpokenLanguageToTeacher :one
INSERT INTO "teacher_spoken_language" (
        teacher_id,
        spoken_language_id
    )
VALUES ($1, $2)
RETURNING *;
-- name: RemoveSpokenLanguageFromTeacher :exec
DELETE FROM "teacher_spoken_language"
WHERE teacher_id = $1
    AND spoken_language_id = $2;
-- name: CreateSpokenLanguage :one
INSERT INTO "spoken_language" (language_id, proficiency)
VALUES ($1, $2)
RETURNING *;