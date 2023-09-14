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
        "user_id" TEXT NOT NULL REFERENCES "user"(id),
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

CREATE TABLE
    IF NOT EXISTS "class" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" TEXT NOT NULL,
        "learn_id" INT NOT NULL REFERENCES "learn" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "start_at" TIMESTAMPTZ NOT NULL,
        "end_at" TIMESTAMPTZ NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
    );

CREATE TABLE
    IF NOT EXISTS "user_class" (
        "user_id" TEXT NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "class_id" UUID NOT NULL REFERENCES "class" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
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

CREATE Table
    IF NOT EXISTS "teacher_availabilities" (
        "id" SERIAL NOT NULL,
        "teacher_id" TEXT NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "startAt" TIMESTAMPTZ NOT NULL,
        "endAt" TIMESTAMPTZ NOT NULL
    );

ALTER TABLE
    "teacher_availabilities"
ADD
    PRIMARY KEY ("id", "teacher_id");

CREATE INDEX
    "teacher_idx" ON "teacher_availabilities" USING BTREE ("teacher_id");