CREATE TYPE "public"."role" AS ENUM ('student', 'teacher', 'admin');

CREATE TABLE
    IF NOT EXISTS "public"."user" (
        "id" UUID PRIMARY KEY REFERENCES "auth"."users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "first_name" TEXT NOT NULL,
        "last_name" TEXT NOT NULL,
        "role" "role" NOT NULL,
        "prefered_language" TEXT NOT NULL DEFAULT 'en',
        "avatar_file_path" TEXT,
        "avatar_url" TEXT,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
    );

CREATE INDEX "role_idx" ON "public"."user" USING BTREE ("role");

CREATE TABLE
    IF NOT EXISTS "public"."learn" (
        "id" SERIAL PRIMARY KEY,
        "language" TEXT NOT NULL,
        "topic" TEXT NOT NULL
    );

CREATE UNIQUE INDEX "lang_topic_idx" ON "public"."learn" USING BTREE ("language", "topic");

CREATE TABLE
    IF NOT EXISTS "public"."user_learn" (
        "user_id" UUID NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "learn_id" INT NOT NULL REFERENCES "learn" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
    );

ALTER TABLE
    "public"."user_learn"
ADD
    PRIMARY KEY ("user_id", "learn_id");

CREATE TABLE
    IF NOT EXISTS "public"."class" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" TEXT NOT NULL,
        "learn_id" INT NOT NULL REFERENCES "learn" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "start_at" TIMESTAMPTZ NOT NULL,
        "end_at" TIMESTAMPTZ NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
    );

CREATE TABLE
    IF NOT EXISTS "public"."user_class" (
        "user_id" UUID NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "class_id" UUID NOT NULL REFERENCES "class" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
    );

ALTER TABLE
    "public"."user_class"
ADD
    PRIMARY KEY ("user_id", "class_id");

CREATE TABLE
    IF NOT EXISTS "public"."message" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "text" TEXT NOT NULL,
        "user_id" UUID NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "class_id" UUID NOT NULL REFERENCES "class" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
    )