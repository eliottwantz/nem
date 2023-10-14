CREATE TYPE "role" AS ENUM ('student', 'teacher', 'admin');
CREATE TABLE "user" (
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
CREATE TABLE "student" (
    id UUID PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "teacher" (
    id UUID PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "bio" TEXT NOT NULL,
    "hour_rate" INT NOT NULL CONSTRAINT "hour_rate_check" CHECK (hour_rate > 0),
    "top_agent" BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE TABLE "language" (
    "id" SERIAL PRIMARY KEY,
    "language" TEXT NOT NULL
);
CREATE UNIQUE INDEX "language_idx" ON "language" ("language");
CREATE TABLE "spoken_language" (
    "id" SERIAL PRIMARY KEY,
    "language_id" INT NOT NULL REFERENCES "language"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "proficiency" TEXT NOT NULL
);
CREATE INDEX "proficiency_idx" ON "spoken_language" ("proficiency");
CREATE TABLE "teacher_spoken_language" (
    "spoken_language_id" INT NOT NULL REFERENCES "spoken_language"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "teacher_id" UUID NOT NULL REFERENCES "teacher"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (
        "spoken_language_id",
        "teacher_id"
    )
);
CREATE TABLE "topics" (
    "id" SERIAL PRIMARY KEY,
    "topic" TEXT NOT NULL
);
CREATE UNIQUE INDEX "topic_idx" ON "topics" ("topic");
CREATE TABLE "teacher_topic" (
    "teacher_id" UUID NOT NULL REFERENCES "teacher"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "topic_id" INT NOT NULL REFERENCES "topics"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY ("teacher_id", "topic_id")
);
CREATE TABLE "hours_bank" (
    "hours" INT NOT NULL,
    "student_id" UUID NOT NULL REFERENCES "student"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "teacher_id" UUID NOT NULL REFERENCES "teacher"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY ("student_id", "teacher_id")
);
CREATE TABLE "subscription" (
    id SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "hours" INT NOT NULL
);
CREATE TABLE "subscription_student" (
    "student_id" UUID NOT NULL REFERENCES "student"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "teacher_id" UUID NOT NULL REFERENCES "teacher"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "subscription_id" INT NOT NULL REFERENCES "subscription"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY ("student_id", "teacher_id")
);
CREATE Table "time_slots" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "start_at" TIMESTAMPTZ NOT NULL,
    "end_at" TIMESTAMPTZ NOT NULL,
    "teacher_id" UUID NOT NULL REFERENCES "teacher"(id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "idx_timeslots_teacherid " ON "time_slots"("teacher_id");
CREATE INDEX "idx_timeslots_startat_endat" ON "time_slots" ("start_at", "end_at");
CREATE TABLE "reviews" (
    "id" SERIAL PRIMARY KEY,
    "rating" INTEGER NOT NULL CONSTRAINT "rating_check" CHECK (
        rating >= 1
        AND rating <= 5
    ),
    "comment" TEXT,
    "teacher_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES teacher (id),
    FOREIGN KEY (student_id) REFERENCES student (id)
);
CREATE TABLE "teacher_ratings" (
    "id" SERIAL PRIMARY KEY,
    "rating" NUMERIC(2, 1) NOT NULL,
    "teacher_id" UUID NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES teacher (id)
);
-- Create the trigger function
CREATE OR REPLACE FUNCTION update_teacher_rating() RETURNS TRIGGER AS $$ BEGIN
UPDATE teacher_ratings
SET rating = (
        SELECT AVG(rating)
        FROM reviews
        WHERE teacher_id = NEW.teacher_id
    )
WHERE teacher_id = NEW.teacher_id;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Create the AFTER INSERT trigger
CREATE TRIGGER update_teacher_rating_trigger
AFTER
INSERT ON reviews FOR EACH ROW EXECUTE FUNCTION update_teacher_rating();
CREATE TABLE "conversations" (
    "id" BIGSERIAL PRIMARY KEY,
    "is_group" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE "messages" (
    "id" BIGSERIAL PRIMARY KEY,
    "sender_id" UUID NOT NULL,
    "conversation_id" BIGINT NOT NULL,
    "text" TEXT NOT NULL,
    "sent_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ DEFAULT NULL,
    FOREIGN KEY (sender_id) REFERENCES "user"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (conversation_id) REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
-- Get all messages in a conversation
CREATE INDEX "idx_messages_conversation_id" ON "messages"("conversation_id");
-- Index for listing the message by sent_at
CREATE INDEX "idx_messages_send_at" ON "messages"("send_at");
CREATE TABLE "users_conversations" (
    "user_id" UUID NOT NULL,
    "conversation_id" BIGINT NOT NULL,
    PRIMARY KEY ("user_id", "conversation_id"),
    FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("conversation_id") REFERENCES "conversations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
-- Get all conversations for a user
CREATE INDEX "idx_user_conversations_user_id" ON "user_conversations"("user_id");
CREATE TABLE "users_messages" (
    "recipient_id" UUID NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "message_id" BIGINT NOT NULL REFERENCES "messages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY ("recipient_id", "message_id")
);
CREATE TABLE "class" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "is_private" BOOLEAN NOT NULL,
    "language" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "conversation_id" BIGINT NOT NULL REFERENCES "conversations" ("id") ON DELETE RESTRICT,
    "time_slot_id" UUID NOT NULL REFERENCES "time_slots" ("id") ON DELETE RESTRICT,
    "has_started" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX "idx_class_timeslotid" ON "class" ("time_slot_id");
CREATE TABLE "student_class" (
    "student_id" UUID NOT NULL REFERENCES "student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "class_id" UUID NOT NULL REFERENCES "class" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY ("student_id", "class_id")
);
CREATE TABLE "students_of_teacher" (
    "student_id" UUID NOT NULL REFERENCES "student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "teacher_id" UUID NOT NULL REFERENCES "teacher" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY ("student_id", "teacher_id")
);