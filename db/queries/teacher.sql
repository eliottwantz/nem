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
        SELECT "topics"."topic"
        FROM teacher_topic
            JOIN "topics" ON "topics"."id" = teacher_topic."topic_id"
        WHERE teacher_topic."teacher_id" = "teacher"."id"
    ) AS "topics_taught"
FROM "user"
    JOIN "teacher" ON "teacher"."id" = "user"."id"
LIMIT 7;
-- name: FindTeacherByID :one
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
        SELECT "topics"."topic"
        FROM teacher_topic
            JOIN "topics" ON "topics"."id" = teacher_topic."topic_id"
        WHERE teacher_topic."teacher_id" = "teacher"."id"
    ) AS "topics_taught"
FROM "user"
    JOIN "teacher" ON "teacher"."id" = "user"."id"
WHERE teacher.id = $1;
-- name: ListTeachersOfStudent :many
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
        SELECT "topics"."topic"
        FROM teacher_topic
            JOIN "topics" ON "topics"."id" = teacher_topic."topic_id"
        WHERE teacher_topic."teacher_id" = "teacher"."id"
    ) AS "topics_taught"
FROM "user"
    JOIN "teacher" ON "teacher"."id" = "user"."id"
    JOIN "students_of_teacher" ON "students_of_teacher"."teacher_id" = "teacher"."id"
WHERE "students_of_teacher"."student_id" = $1;
-- name: CreateTeacher :one
INSERT INTO "teacher" (id, bio, hour_rate)
VALUES ($1, $2, $3)
RETURNING *;