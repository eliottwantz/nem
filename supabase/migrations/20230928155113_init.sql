CREATE TYPE "role" AS ENUM ('student', 'teacher', 'admin');

CREATE TABLE
    "user" (
        id UUID PRIMARY KEY REFERENCES "auth"."users"(id) ON DELETE CASCADE ON UPDATE CASCADE,
        "email" TEXT NOT NULL UNIQUE,
        "first_name" TEXT NOT NULL,
        "last_name" TEXT NOT NULL,
        "role" "role" NOT NULL,
        "prefered_language" TEXT NOT NULL DEFAULT 'en',
        "avatar_file_path" TEXT NOT NULL DEFAULT '',
        "avatar_url" TEXT NOT NULL DEFAULT '',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ
    );

CREATE INDEX "role_idx" ON "user" USING BTREE ("role");

CREATE TABLE
    "student" (
        id UUID PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE ON UPDATE CASCADE
    );

CREATE TABLE
    "teacher" (
        id UUID PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE ON UPDATE CASCADE,
        "bio" TEXT NOT NULL,
        "hour_rate" INT NOT NULL CONSTRAINT "hour_rate_check" CHECK (hour_rate > 0),
        "top_agent" BOOLEAN NOT NULL DEFAULT FALSE
    );

CREATE TABLE
    "spoken_language" (
        "id" SERIAL PRIMARY KEY,
        "language" TEXT NOT NULL,
        "proficiency" TEXT NOT NULL
    );

CREATE UNIQUE INDEX "language_proficiency_idx" ON "spoken_language" ("language", "proficiency");

CREATE TABLE
    "teacher_spoken_language" (
        "spoken_language_id" INT NOT NULL REFERENCES "spoken_language"(id) ON DELETE CASCADE ON UPDATE CASCADE,
        "teacher_id" UUID NOT NULL REFERENCES "teacher"(id) ON DELETE CASCADE ON UPDATE CASCADE,
        PRIMARY KEY (
            "spoken_language_id",
            "teacher_id"
        )
    );

CREATE TABLE
    "topic_taught" (
        "id" SERIAL PRIMARY KEY,
        "topic" TEXT NOT NULL,
        "language" TEXT NOT NULL
    );

CREATE UNIQUE INDEX "topic_language_idx" ON "topic_taught" ("topic", "language");

CREATE TABLE
    "teacher_topic_taught" (
        "teacher_id" UUID NOT NULL REFERENCES "teacher"(id) ON DELETE CASCADE ON UPDATE CASCADE,
        "topic_taught_id" INT NOT NULL REFERENCES "topic_taught"(id) ON DELETE CASCADE ON UPDATE CASCADE,
        PRIMARY KEY (
            "teacher_id",
            "topic_taught_id"
        )
    );

CREATE TABLE
    "hours_bank" (
        "hours" INT NOT NULL,
        "student_id" UUID NOT NULL REFERENCES "student"(id) ON DELETE CASCADE ON UPDATE CASCADE,
        "teacher_id" UUID NOT NULL REFERENCES "teacher"(id) ON DELETE CASCADE ON UPDATE CASCADE,
        PRIMARY KEY ("student_id", "teacher_id")
    );

CREATE TABLE
    "subscription" (
        id SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "hours" INT NOT NULL
    );

CREATE TABLE
    "subscription_student" (
        "student_id" UUID NOT NULL REFERENCES "student"(id) ON DELETE CASCADE ON UPDATE CASCADE,
        "teacher_id" UUID NOT NULL REFERENCES "teacher"(id) ON DELETE CASCADE ON UPDATE CASCADE,
        "subscription_id" INT NOT NULL REFERENCES "subscription"(id) ON DELETE CASCADE ON UPDATE CASCADE,
        PRIMARY KEY ("student_id", "teacher_id")
    );

CREATE Table
    "time_slots" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "start_at" TIMESTAMPTZ NOT NULL,
        "end_at" TIMESTAMPTZ NOT NULL,
        "teacher_id" UUID NOT NULL REFERENCES "teacher"(id) ON DELETE CASCADE ON UPDATE CASCADE
    );

CREATE INDEX
    "idx_timeslots_teacherid " ON "time_slots"("teacher_id");

CREATE INDEX
    "idx_timeslots_startat_endat" ON "time_slots" ("start_at", "end_at");

CREATE TABLE
    "class" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" TEXT NOT NULL,
        "is_private" BOOLEAN NOT NULL,
        "topic_taught_id" INT NOT NULL REFERENCES "topic_taught" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "time_slot_id" UUID NOT NULL REFERENCES "time_slots" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
        "has_started" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
    );

CREATE UNIQUE INDEX "idx_class_timeslotid" ON "class" ("time_slot_id");

CREATE TABLE
    "student_class" (
        "student_id" UUID NOT NULL REFERENCES "student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "class_id" UUID NOT NULL REFERENCES "class" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY ("student_id", "class_id")
    );

CREATE TABLE
    "students_of_teacher" (
        "student_id" UUID NOT NULL REFERENCES "student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "teacher_id" UUID NOT NULL REFERENCES "teacher" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        PRIMARY KEY ("student_id", "teacher_id")
    );

CREATE TABLE
    "message" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "text" TEXT NOT NULL,
        "user_id" UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE ON UPDATE CASCADE,
        "class_id" UUID NOT NULL REFERENCES "class" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ
    );