-- name: ListMessagesOfConversation :many
SELECT m.*,
    u.*
FROM "messages" m
    JOIN "user" u ON m.sender_id = u.id
WHERE m."conversation_id" = $1
ORDER BY m."sent_at" DESC
LIMIT 20;
-- name: ListMessagesOfConversationWithCursor :many
SELECT m.*,
    u.*
FROM "messages" m
    JOIN "user" u ON m.sender_id = u.id
WHERE m."conversation_id" = $1
    AND m."sent_at" < $2
ORDER BY m."sent_at" DESC
LIMIT 20;
-- name: FindConversationById :one
SELECT c.*,
    array_agg(DISTINCT u.*) AS users
FROM "conversations" c
    JOIN "users_conversations" uc ON c.id = uc.conversation_id
    JOIN "user" u ON uc.user_id = u.id
WHERE c.id = $1
GROUP BY c.id;
-- name: FindOneToOneConversation :one
SELECT c.*
FROM conversations c
    JOIN users_conversations uc1 ON c.id = uc1.conversation_id
    JOIN users_conversations uc2 ON c.id = uc2.conversation_id
WHERE uc1.user_id = $1
    AND uc2.user_id = $2;
-- name: ListConversationsOfUser :many
SELECT c.*,
    MAX(m.sent_at) as last_sent,
    array_agg(DISTINCT u.*) AS users
FROM "conversations" c
    JOIN "users_conversations" uc1 ON c.id = uc1.conversation_id
    JOIN "users_conversations" uc2 ON c.id = uc2.conversation_id
    JOIN "user" u ON uc2.user_id = u.id
    LEFT JOIN "messages" m ON c.id = m.conversation_id
WHERE uc1.user_id = $1
    AND c.is_class_chat = FALSE
GROUP BY c.id
ORDER BY MAX(m.sent_at) DESC;
-- name: ListUserIDsInConversation :many
SELECT u.id
FROM "user" u
    JOIN "users_conversations" uc ON u.id = uc.user_id
WHERE uc.conversation_id = $1;
-- name: CreateConversation :one
INSERT INTO "conversations" ("is_class_chat")
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