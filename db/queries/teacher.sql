-- name: ListTeachers :many
SELECT ROW_NUMBER() OVER () as "row_id",
    *
FROM (
        SELECT DISTINCT u.*,
            t.bio,
            t.hour_rate,
            t.top_agent,
            COALESCE(tr.rating, 0) as rating,
            ARRAY(
                SELECT ROW(
                        "language"."language",
                        "spoken_language"."proficiency"
                    )
                FROM "teacher_spoken_language"
                    JOIN "spoken_language" ON "spoken_language"."id" = "teacher_spoken_language"."spoken_language_id"
                    JOIN "language" ON "language"."id" = "spoken_language"."language_id"
                WHERE "teacher_spoken_language"."teacher_id" = t."id"
            ) AS "spoken_languages",
            ARRAY(
                SELECT "topics"."topic"
                FROM teacher_topic
                    JOIN "topics" ON "topics"."id" = teacher_topic."topic_id"
                WHERE teacher_topic."teacher_id" = t."id"
            ) AS "topics_taught"
        FROM "user" u
            JOIN teacher t ON u.id = t.id
            JOIN teacher_topic tt ON t.id = tt.teacher_id
            JOIN topics tp ON tt.topic_id = tp.id
            JOIN teacher_spoken_language tsl ON t.id = tsl.teacher_id
            JOIN spoken_language sl ON tsl.spoken_language_id = sl.id
            JOIN "language" ON sl.language_id = "language".id
            LEFT JOIN teacher_ratings tr ON t.id = tr.teacher_id
        WHERE t.hour_rate <= $1
            AND (
                t.top_agent = $2
                OR t.top_agent = $3
            )
            AND (
                tp.topic = $4
                OR tp.topic LIKE $5
            )
            AND (
                language.language = $6
                OR language.language LIKE $7
            )
            AND COALESCE(tr.rating, 0) >= $8
    ) "inner";
-- name: TeachersCount :one
SELECT COUNT(*)
FROM "user"
    JOIN "teacher" ON "user"."id" = "teacher"."id";
-- name: ListTopicsTaughtByAllTeachers :many
SELECT DISTINCT "topics".*
FROM teacher_topic
    JOIN "topics" ON "topics"."id" = teacher_topic."topic_id";
-- name: ListLanguagesOfAllTeachers :many
SELECT DISTINCT language.language
FROM teacher_spoken_language
    JOIN "spoken_language" ON "spoken_language"."id" = "teacher_spoken_language"."spoken_language_id"
    JOIN "language" ON "language"."id" = "spoken_language"."language_id";
-- name: FindTeacherByID :one
SELECT "user".*,
    "teacher"."bio",
    "teacher"."hour_rate",
    "teacher"."top_agent",
    "teacher_ratings"."rating",
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
        SELECT "topics"."topic"
        FROM teacher_topic
            JOIN "topics" ON "topics"."id" = teacher_topic."topic_id"
        WHERE teacher_topic."teacher_id" = "teacher"."id"
    ) AS "topics_taught"
FROM "user"
    JOIN "teacher" ON "teacher"."id" = "user"."id"
    LEFT JOIN "teacher_ratings" ON "teacher_ratings"."teacher_id" = "teacher"."id"
WHERE teacher.id = $1;
-- name: ListTeachersOfStudent :many
SELECT "user".*,
    "teacher"."bio",
    "teacher"."hour_rate",
    "teacher"."top_agent",
    "teacher_ratings"."rating",
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
        SELECT "topics"."topic"
        FROM teacher_topic
            JOIN "topics" ON "topics"."id" = teacher_topic."topic_id"
        WHERE teacher_topic."teacher_id" = "teacher"."id"
    ) AS "topics_taught"
FROM "user"
    JOIN "teacher" ON "teacher"."id" = "user"."id"
    JOIN "students_of_teacher" ON "students_of_teacher"."teacher_id" = "teacher"."id"
    LEFT JOIN "teacher_ratings" ON "teacher_ratings"."teacher_id" = "teacher"."id"
WHERE "students_of_teacher"."student_id" = $1;
-- name: CreateTeacher :one
INSERT INTO "teacher" (id, bio, hour_rate)
VALUES ($1, $2, $3)
RETURNING *;