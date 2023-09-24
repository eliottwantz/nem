-- name: ListClasses :many

SELECT
    cl.*,
    c.language,
    c.topic,
    t.teacher_id,
    t.start_at,
    t.end_at
FROM "class" cl
    JOIN "learn" c ON cl.learn_id = c.id
    JOIN "time_slots" t ON cl.time_slot_id = t.id
ORDER BY cl.created_at ASC;

-- name: FindClass :one

SELECT
    cl.*,
    c.language,
    c.topic,
    t.teacher_id,
    t.start_at,
    t.end_at
FROM "class" cl
    JOIN "learn" c ON cl.learn_id = c.id
    JOIN "time_slots" t ON cl.time_slot_id = t.id
WHERE cl.id = $1
ORDER BY cl.created_at ASC;

-- name: FindClassByTeacherAndTime :one

SELECT
    cl.*,
    c.language,
    c.topic,
    t.teacher_id,
    t.start_at,
    t.end_at
FROM "class" cl
    JOIN "learn" c ON cl.learn_id = c.id
    JOIN "time_slots" t ON cl.time_slot_id = t.id
WHERE
    t.teacher_id = $1
    AND t.start_at = $2
    AND t.end_at = $3;

-- name: FindClassByTeacherAndTimeSlotId :one

SELECT
    cl.*,
    c.language,
    c.topic,
    t.teacher_id,
    t.start_at,
    t.end_at
FROM "class" cl
    JOIN "learn" c ON cl.learn_id = c.id
    JOIN "time_slots" t ON cl.time_slot_id = t.id
WHERE
    t.teacher_id = $1
    AND t.id = $2;

-- name: ListUsersInClass :many

SELECT u.*
FROM "user" u
    JOIN "user_class" uc ON u.id = uc.user_id
WHERE uc.class_id = $1;

-- name: ListClassesOfUser :many

SELECT
    cl.*,
    c.language,
    c.topic,
    t.teacher_id,
    t.start_at,
    t.end_at
FROM "class" cl
    JOIN "user_class" uc ON cl.id = uc.class_id
    JOIN "learn" c ON cl.learn_id = c.id
    JOIN "time_slots" t ON cl.time_slot_id = t.id
WHERE uc.user_id = $1
ORDER BY uc.created_at ASC;

-- name: ListClassesOfTeacher :many

SELECT
    cl.*,
    c.language,
    c.topic,
    t.teacher_id,
    t.start_at,
    t.end_at
FROM "class" cl
    JOIN "learn" c ON cl.learn_id = c.id
    JOIN "time_slots" t ON cl.time_slot_id = t.id
WHERE t.teacher_id = $1
ORDER BY t.start_at ASC;

-- name: CreateClass :one

INSERT INTO
    "class" (
        name,
        learn_id,
        is_private,
        time_slot_id
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