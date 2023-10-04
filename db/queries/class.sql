-- name: FindClass :one

SELECT
    cl.*,
    tt.language,
    tt.topic,
    teacher_id,
    start_at,
    end_at
FROM "class" cl
    JOIN "topic_taught" tt ON cl.topic_taught_id = tid
    JOIN "time_slots" ts ON cl.time_slot_id = id
WHERE cl.id = $1
ORDER BY cl.created_at ASC;

-- name: FindClassByTimeslot :one

SELECT
    cl.*,
    tt.language,
    tt.topic,
    t.teacher_id,
    t.start_at,
    t.end_at
FROM "class" cl
    JOIN "topic_taught" tt ON cl.topic_taught_id = tt.id
    JOIN "time_slots" t ON cl.time_slot_id = t.id
WHERE t.id = $1;

-- name: ListStudentsInClass :many

SELECT u.*
FROM "user" u
    JOIN "student_class" sc ON u.id = sc.student_id
WHERE sc.class_id = $1;

-- name: ListClassesOfStudent :many

SELECT
    cl.*,
    tt.language,
    tt.topic,
    t.teacher_id,
    t.start_at,
    t.end_at
FROM "class" cl
    JOIN "student_class" sc ON cl.id = sc.class_id
    JOIN "topic_taught" tt ON cl.learn_id = tt.id
    JOIN "time_slots" t ON cl.time_slot_id = t.id
WHERE sc.student_id = $1
ORDER BY sc.created_at ASC;

-- name: ListClassesOfTeacher :many

SELECT
    cl.*,
    c.language,
    c.topic,
    t.teacher_id,
    t.start_at,
    t.end_at
FROM "class" cl
    JOIN "topic_taught" c ON cl.topic_taught_id = c.id
    JOIN "time_slots" t ON cl.time_slot_id = t.id
WHERE t.teacher_id = $1
ORDER BY t.start_at ASC;

-- name: CreateClass :one

INSERT INTO
    "class" (
        name,
        is_private,
        topic_taught_id,
        time_slot_id
    )
VALUES ($1, $2, $3, $4) RETURNING *;

-- name: AddStudentToClass :exec

INSERT INTO
    "student_class" (student_id, class_id)
VALUES ($1, $2);

-- name: RemoveStudentFromClass :exec

DELETE FROM "student_class" WHERE student_id = $1 AND class_id = $2;

-- name: DeleteClass :exec

DELETE FROM "class" WHERE id = $1;

-- name: SetClassHasStarted :exec

UPDATE "class" SET has_started = true WHERE id = $1;