-- name: ListSubscriptions :many
SELECT *
FROM subscription;
-- name: AddSubscriptionForStudent :exec
INSERT INTO "subscription_student" (subscription_id, teacher_id, student_id)
VALUES ($1, $2, $3);