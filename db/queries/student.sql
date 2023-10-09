-- name: ListStudentsOfTeacher :many

SELECT u.*
FROM "students_of_teacher" sot
    JOIN "teacher" t ON sot.teacher_id = t.id
    JOIN "user" u ON sot.student_id = u.id
WHERE t.id = $1;

-- name: AddToStudentsOfTeacher :exec

INSERT INTO
    "students_of_teacher" (teacher_id, student_id)
VALUES ($1, $2);

-- name: FindStudentByID :one

SELECT u.*
FROM "student" s
    JOIN "user" u ON s.id = u.id
WHERE s.id = $1;

-- name: CreateStudent :one

INSERT INTO "student" ( id ) VALUES ($1) RETURNING *;