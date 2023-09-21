-- name: ListTimeSlots :many

SELECT * FROM "time_slots" WHERE "teacher_id" = $1;

-- name: FindTimeSlot :one

SELECT * FROM "time_slots" WHERE "id" = $1;

-- name: FindTimeSlotsTeacherAndTime :many

SELECT *
FROM "time_slots"
WHERE
    "teacher_id" = $1
    AND "start_at" >= $2
    AND "end_at" <= $3;

-- name: AddTimeSlot :one

INSERT INTO
    "time_slots" (
        "teacher_id",
        "start_at",
        "end_at"
    )
VALUES ($1, $2, $3) RETURNING *;

-- name: DeleteTimeSlot :exec

DELETE FROM "time_slots"
WHERE
    "id" = $1
    AND "teacher_id" = $2;

-- name: UpdateTimeSlot :one

UPDATE "time_slots"
SET
    "start_at" = $1,
    "end_at" = $2
WHERE
    "id" = $3
    AND "teacher_id" = $4 RETURNING *;