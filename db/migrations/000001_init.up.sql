CREATE TYPE "role" AS ENUM ('student', 'teacher', 'admin');

CREATE TABLE
    "user" (
        id TEXT NOT NULL PRIMARY KEY,
        "email" VARCHAR(255) NOT NULL UNIQUE,
        "email_verified" BOOLEAN NOT NULL,
        "first_name" TEXT NOT NULL,
        "last_name" TEXT NOT NULL,
        "role" "role" NOT NULL,
        "prefered_language" TEXT NOT NULL DEFAULT 'en',
        "avatar_file_path" TEXT NOT NULL DEFAULT '',
        "avatar_url" TEXT NOT NULL DEFAULT '',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
    );

CREATE INDEX "role_idx" ON "user" USING BTREE ("role");

CREATE TABLE
    "user_key" (
        id TEXT PRIMARY KEY,
        "user_id" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE ON UPDATE CASCADE,
        "hashed_password" TEXT
    );

CREATE TABLE
    "email_verification_token" (
        id VARCHAR(63) PRIMARY KEY,
        "user_id" TEXT NOT NULL,
        "expires" BIGINT NOT NULL
    );

CREATE TABLE
    "password_reset_token" (
        id VARCHAR(63) PRIMARY KEY,
        "user_id" TEXT NOT NULL,
        "expires" BIGINT NOT NULL
    );

CREATE TABLE
    IF NOT EXISTS "learn" (
        "id" SERIAL PRIMARY KEY,
        "language" TEXT NOT NULL,
        "topic" TEXT NOT NULL
    );

CREATE UNIQUE INDEX "lang_topic_idx" ON "learn" USING BTREE ("language", "topic");

CREATE TABLE
    IF NOT EXISTS "user_learn" (
        "user_id" TEXT NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "learn_id" INT NOT NULL REFERENCES "learn" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
    );

ALTER TABLE "user_learn" ADD PRIMARY KEY ("user_id", "learn_id");

CREATE Table
    if NOT exists "time_slots" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "start_at" TIMESTAMPTZ NOT NULL,
        "end_at" TIMESTAMPTZ NOT NULL,
        "teacher_id" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE ON UPDATE CASCADE
    );

CREATE INDEX
    "idx_timeslots_teacherid " ON "time_slots"("teacher_id");

CREATE INDEX
    "idx_timeslots_startat_endat" ON "time_slots" ("start_at", "end_at");

CREATE TABLE
    IF NOT EXISTS "class" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" TEXT NOT NULL,
        "is_private" BOOLEAN NOT NULL,
        "learn_id" INT NOT NULL REFERENCES "learn" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "time_slot_id" UUID NOT NULL REFERENCES "time_slots" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );

CREATE INDEX "idx_class_timeslotid" ON "class" ("time_slot_id");

CREATE TABLE
    IF NOT EXISTS "user_class" (
        "user_id" TEXT NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "class_id" UUID NOT NULL REFERENCES "class" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
    );

ALTER TABLE "user_class" ADD PRIMARY KEY ("user_id", "class_id");

CREATE TABLE
    IF NOT EXISTS "message" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "text" TEXT NOT NULL,
        "user_id" TEXT NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "class_id" UUID NOT NULL REFERENCES "class" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
    );