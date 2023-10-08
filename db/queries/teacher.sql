-- name: ListTeachers :many

SELECT t.bio, t.hour_rate, u.*
FROM "teacher" t
    JOIN "user" u ON sot.teacher_id = u.id;

-- name: ListTeachersForTopicTaught :many

SELECT
    DISTINCT t.bio,
    t.hour_rate,
    u.*
FROM "topic_taught" tt
    JOIN "teacher_topic_taught" ttt ON tt.id = ttt.topic_taught_id
    JOIN "teacher" t ON t.id = ttt.teacher_id
    JOIN "user" u ON u.id = ttt.teacher_id
WHERE
    tt.language = $1
    AND tt.topic = $2;

-- name: FindTeacherByID :one

SELECT t.bio, t.hour_rate, u.*
FROM "teacher" t
    JOIN "user" u ON t.id = u.id
WHERE u.id = $1;

-- name: ListTeachersOfStudent :many

SELECT t.bio, t.hour_rate, u.*
FROM "students_teacher" sot
    JOIN "teacher" t ON sot.teacher_id = t.id
    JOIN "user" u ON sot.teacher_id = u.id
WHERE sot.student_id = $1;

-- name: CreateTeacher :one

INSERT INTO
    "teacher" (id, bio, hour_rate)
VALUES ($1, $2, $3) RETURNING *;

-- name: ListSpokenLanguagesOfTeacher :many

SELECT sl.*
FROM
    "teacher_spoken_language" tsl
    JOIN "spoken_language" sl ON tsl.spoken_language_id = sl.id
WHERE tsl.teacher_id = $1;

-- name: FindSpokenLanguage :one

SELECT sl.*
FROM "spoken_language" sl
WHERE
    sl.language = $1
    AND sl.proficiency = $2;

-- name: AddSpokenLanguageToTeacher :one

INSERT INTO
    "teacher_spoken_language" (
        teacher_id,
        spoken_language_id
    )
VALUES ($1, $2) RETURNING *;

-- name: RemoveSpokenLanguageFromTeacher :exec

DELETE FROM
    "teacher_spoken_language"
WHERE
    teacher_id = $1
    AND spoken_language_id = $2;

-- name: CreateSpokenLanguage :one

INSERT INTO
    "spoken_language" (language, proficiency)
VALUES ($1, $2) RETURNING *;