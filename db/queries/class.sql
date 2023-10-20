-- name: FindClass :one
SELECT cl.*,
    ts.teacher_id,
    ts.start_at,
    ts.end_at
FROM "class" cl
    JOIN "time_slots" ts ON cl.time_slot_id = ts.id
WHERE cl.id = $1
ORDER BY cl.created_at ASC;
-- name: FindClassByTimeslot :one
SELECT cl.*,
    t.teacher_id,
    t.start_at,
    t.end_at
FROM "class" cl
    JOIN "time_slots" t ON cl.time_slot_id = t.id
WHERE t.id = $1;
-- name: ListStudentsInClass :many
SELECT u.*
FROM "student" s
    JOIN "user" u ON s.id = u.id
    JOIN "student_class" sc ON u.id = sc.student_id
WHERE sc.class_id = $1;
-- name: ListClassesOfStudent :many
SELECT cl.*,
    t.teacher_id,
    u.first_name,
    u.last_name,
    u.avatar_url,
    u.avatar_file_path,
    t.start_at,
    t.end_at
FROM "class" cl
    JOIN "student_class" sc ON cl.id = sc.class_id
    JOIN "time_slots" t ON cl.time_slot_id = t.id
    JOIN "user" u ON u.id = t.teacher_id
WHERE sc.student_id = $1
ORDER BY sc.created_at ASC;
-- name: ListClassesOfTeacher :many
SELECT cl.*,
    t.teacher_id,
    t.start_at,
    t.end_at
FROM "class" cl
    JOIN "time_slots" t ON cl.time_slot_id = t.id
WHERE t.teacher_id = $1
ORDER BY t.start_at ASC;
-- name: CreateClass :one
INSERT INTO "class" (
        name,
        is_private,
        language,
        topic,
        time_slot_id
    )
VALUES ($1, $2, $3, $4, $5)
RETURNING *;
-- name: AddStudentToClass :exec
INSERT INTO "student_class" (student_id, class_id)
VALUES ($1, $2);
-- name: RemoveStudentFromClass :exec
DELETE FROM "student_class"
WHERE student_id = $1
    AND class_id = $2;
-- name: DeleteClass :exec
DELETE FROM "class"
WHERE id = $1;
-- name: SetClassHasStarted :exec
UPDATE "class"
SET has_started = true
WHERE id = $1;