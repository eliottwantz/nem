-- name: FindLanguage :one
SELECT *
FROM "language"
WHERE language = $1;
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