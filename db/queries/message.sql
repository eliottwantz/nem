-- name: ListMessagesOfConversation :many
SELECT *
FROM "messages"
WHERE "conversation_id" = $1
    AND "sent_at" < $2
ORDER BY "sent_at" DESC
LIMIT 20;
-- name: FindConversation :one
SELECT *
FROM "conversations"
WHERE "id" = $1;
-- name: FindConversationBetweenUsers :one
SELECT c.*
FROM conversations c
    JOIN users_conversations uc1 ON c.id = uc1.conversation_id
    JOIN users_conversations uc2 ON c.id = uc2.conversation_id
WHERE uc1.user_id = $1
    AND uc2.user_id = $2;
-- name: ListConversationsOfUser :many
SELECT c.*
FROM "conversations" c
    JOIN "messages" m ON c.id = m.conversation_id
    JOIN "users_conversations" uc ON c.id = uc.conversation_id
WHERE uc.user_id = $1
GROUP BY c.id
ORDER BY MAX(m.sent_at) DESC;
-- name: ListUserIDsInConversation :many
SELECT u.id
FROM "user" u
    JOIN "users_conversations" uc ON u.id = uc.user_id
WHERE uc.conversation_id = $1;
-- name: CreateConversation :one
INSERT INTO "conversations" ("is_group")
VALUES ($1)
RETURNING *;
-- name: AddUserToConversation :exec
INSERT INTO "users_conversations" (user_id, conversation_id)
VALUES ($1, $2);
-- name: CreateMessage :one
INSERT INTO "messages" (sender_id, conversation_id, text)
VALUES ($1, $2, $3)
RETURNING *;
-- name: UpdateMessage :one
UPDATE "messages"
SET "text" = $1,
    "updated_at" = now()
WHERE "id" = $2
RETURNING *;
-- name: DeleteMessage :exec
DELETE FROM "messages"
WHERE "id" = $1;