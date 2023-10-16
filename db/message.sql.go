// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.20.0
// source: message.sql

package db

import (
	"context"
	"database/sql"
	"time"

	"github.com/google/uuid"
)

const addUserToConversation = `-- name: AddUserToConversation :exec
INSERT INTO "users_conversations" (user_id, conversation_id)
VALUES ($1, $2)
`

type AddUserToConversationParams struct {
	UserID         uuid.UUID
	ConversationID int64
}

func (q *Queries) AddUserToConversation(ctx context.Context, arg AddUserToConversationParams) error {
	_, err := q.db.ExecContext(ctx, addUserToConversation, arg.UserID, arg.ConversationID)
	return err
}

const createConversation = `-- name: CreateConversation :one
INSERT INTO "conversations" ("is_class_chat")
VALUES ($1)
RETURNING id, is_class_chat, created_at
`

func (q *Queries) CreateConversation(ctx context.Context, isClassChat bool) (*Conversation, error) {
	row := q.db.QueryRowContext(ctx, createConversation, isClassChat)
	var i Conversation
	err := row.Scan(&i.ID, &i.IsClassChat, &i.CreatedAt)
	return &i, err
}

const createMessage = `-- name: CreateMessage :one
INSERT INTO "messages" (sender_id, conversation_id, text)
VALUES ($1, $2, $3)
RETURNING id, sender_id, conversation_id, text, sent_at, updated_at
`

type CreateMessageParams struct {
	SenderID       uuid.UUID
	ConversationID int64
	Text           string
}

func (q *Queries) CreateMessage(ctx context.Context, arg CreateMessageParams) (*Message, error) {
	row := q.db.QueryRowContext(ctx, createMessage, arg.SenderID, arg.ConversationID, arg.Text)
	var i Message
	err := row.Scan(
		&i.ID,
		&i.SenderID,
		&i.ConversationID,
		&i.Text,
		&i.SentAt,
		&i.UpdatedAt,
	)
	return &i, err
}

const deleteMessage = `-- name: DeleteMessage :exec
DELETE FROM "messages"
WHERE "id" = $1
`

func (q *Queries) DeleteMessage(ctx context.Context, id int64) error {
	_, err := q.db.ExecContext(ctx, deleteMessage, id)
	return err
}

const findConversationById = `-- name: FindConversationById :one
SELECT c.id, c.is_class_chat, c.created_at,
    array_agg(DISTINCT u.*) AS users
FROM "conversations" c
    JOIN "users_conversations" uc ON c.id = uc.conversation_id
    JOIN "user" u ON uc.user_id = u.id
WHERE c.id = $1
GROUP BY c.id
`

type FindConversationByIdRow struct {
	ID          int64
	IsClassChat bool
	CreatedAt   time.Time
	Users       interface{}
}

func (q *Queries) FindConversationById(ctx context.Context, id int64) (*FindConversationByIdRow, error) {
	row := q.db.QueryRowContext(ctx, findConversationById, id)
	var i FindConversationByIdRow
	err := row.Scan(
		&i.ID,
		&i.IsClassChat,
		&i.CreatedAt,
		&i.Users,
	)
	return &i, err
}

const findOneToOneConversation = `-- name: FindOneToOneConversation :one
SELECT c.id, c.is_class_chat, c.created_at
FROM conversations c
    JOIN users_conversations uc1 ON c.id = uc1.conversation_id
    JOIN users_conversations uc2 ON c.id = uc2.conversation_id
WHERE uc1.user_id = $1
    AND uc2.user_id = $2
`

type FindOneToOneConversationParams struct {
	UserID   uuid.UUID
	UserID_2 uuid.UUID
}

func (q *Queries) FindOneToOneConversation(ctx context.Context, arg FindOneToOneConversationParams) (*Conversation, error) {
	row := q.db.QueryRowContext(ctx, findOneToOneConversation, arg.UserID, arg.UserID_2)
	var i Conversation
	err := row.Scan(&i.ID, &i.IsClassChat, &i.CreatedAt)
	return &i, err
}

const listConversationsOfUser = `-- name: ListConversationsOfUser :many
SELECT c.id, c.is_class_chat, c.created_at,
    MAX(m.sent_at) as last_sent_time,
    array_agg(DISTINCT u.*) AS users
FROM "conversations" c
    JOIN "users_conversations" uc1 ON c.id = uc1.conversation_id
    JOIN "users_conversations" uc2 ON c.id = uc2.conversation_id
    JOIN "user" u ON uc2.user_id = u.id
    LEFT JOIN "messages" m ON c.id = m.conversation_id
WHERE uc1.user_id = $1
    AND c.is_class_chat = FALSE
GROUP BY c.id
ORDER BY MAX(m.sent_at) DESC
`

type ListConversationsOfUserRow struct {
	ID           int64
	IsClassChat  bool
	CreatedAt    time.Time
	LastSentTime interface{}
	Users        interface{}
}

func (q *Queries) ListConversationsOfUser(ctx context.Context, userID uuid.UUID) ([]*ListConversationsOfUserRow, error) {
	rows, err := q.db.QueryContext(ctx, listConversationsOfUser, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*ListConversationsOfUserRow
	for rows.Next() {
		var i ListConversationsOfUserRow
		if err := rows.Scan(
			&i.ID,
			&i.IsClassChat,
			&i.CreatedAt,
			&i.LastSentTime,
			&i.Users,
		); err != nil {
			return nil, err
		}
		items = append(items, &i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const listMessagesOfConversation = `-- name: ListMessagesOfConversation :many
SELECT m.id, m.sender_id, m.conversation_id, m.text, m.sent_at, m.updated_at,
    u.id, u.email, u.first_name, u.last_name, u.role, u.prefered_language, u.avatar_file_path, u.avatar_url, u.created_at, u.updated_at
FROM "messages" m
    JOIN "user" u ON m.sender_id = u.id
WHERE m."conversation_id" = $1
ORDER BY m."sent_at" DESC
LIMIT 20
`

type ListMessagesOfConversationRow struct {
	ID               int64
	SenderID         uuid.UUID
	ConversationID   int64
	Text             string
	SentAt           time.Time
	UpdatedAt        sql.NullTime
	ID_2             uuid.UUID
	Email            string
	FirstName        string
	LastName         string
	Role             Role
	PreferedLanguage string
	AvatarFilePath   string
	AvatarUrl        string
	CreatedAt        time.Time
	UpdatedAt_2      time.Time
}

func (q *Queries) ListMessagesOfConversation(ctx context.Context, conversationID int64) ([]*ListMessagesOfConversationRow, error) {
	rows, err := q.db.QueryContext(ctx, listMessagesOfConversation, conversationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*ListMessagesOfConversationRow
	for rows.Next() {
		var i ListMessagesOfConversationRow
		if err := rows.Scan(
			&i.ID,
			&i.SenderID,
			&i.ConversationID,
			&i.Text,
			&i.SentAt,
			&i.UpdatedAt,
			&i.ID_2,
			&i.Email,
			&i.FirstName,
			&i.LastName,
			&i.Role,
			&i.PreferedLanguage,
			&i.AvatarFilePath,
			&i.AvatarUrl,
			&i.CreatedAt,
			&i.UpdatedAt_2,
		); err != nil {
			return nil, err
		}
		items = append(items, &i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const listMessagesOfConversationWithCursor = `-- name: ListMessagesOfConversationWithCursor :many
SELECT m.id, m.sender_id, m.conversation_id, m.text, m.sent_at, m.updated_at,
    u.id, u.email, u.first_name, u.last_name, u.role, u.prefered_language, u.avatar_file_path, u.avatar_url, u.created_at, u.updated_at
FROM "messages" m
    JOIN "user" u ON m.sender_id = u.id
WHERE m."conversation_id" = $1
    AND m."sent_at" < $2
ORDER BY m."sent_at" DESC
LIMIT 20
`

type ListMessagesOfConversationWithCursorParams struct {
	ConversationID int64
	SentAt         time.Time
}

type ListMessagesOfConversationWithCursorRow struct {
	ID               int64
	SenderID         uuid.UUID
	ConversationID   int64
	Text             string
	SentAt           time.Time
	UpdatedAt        sql.NullTime
	ID_2             uuid.UUID
	Email            string
	FirstName        string
	LastName         string
	Role             Role
	PreferedLanguage string
	AvatarFilePath   string
	AvatarUrl        string
	CreatedAt        time.Time
	UpdatedAt_2      time.Time
}

func (q *Queries) ListMessagesOfConversationWithCursor(ctx context.Context, arg ListMessagesOfConversationWithCursorParams) ([]*ListMessagesOfConversationWithCursorRow, error) {
	rows, err := q.db.QueryContext(ctx, listMessagesOfConversationWithCursor, arg.ConversationID, arg.SentAt)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*ListMessagesOfConversationWithCursorRow
	for rows.Next() {
		var i ListMessagesOfConversationWithCursorRow
		if err := rows.Scan(
			&i.ID,
			&i.SenderID,
			&i.ConversationID,
			&i.Text,
			&i.SentAt,
			&i.UpdatedAt,
			&i.ID_2,
			&i.Email,
			&i.FirstName,
			&i.LastName,
			&i.Role,
			&i.PreferedLanguage,
			&i.AvatarFilePath,
			&i.AvatarUrl,
			&i.CreatedAt,
			&i.UpdatedAt_2,
		); err != nil {
			return nil, err
		}
		items = append(items, &i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const listUserIDsInConversation = `-- name: ListUserIDsInConversation :many
SELECT u.id
FROM "user" u
    JOIN "users_conversations" uc ON u.id = uc.user_id
WHERE uc.conversation_id = $1
`

func (q *Queries) ListUserIDsInConversation(ctx context.Context, conversationID int64) ([]uuid.UUID, error) {
	rows, err := q.db.QueryContext(ctx, listUserIDsInConversation, conversationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []uuid.UUID
	for rows.Next() {
		var id uuid.UUID
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		items = append(items, id)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const updateMessage = `-- name: UpdateMessage :one
UPDATE "messages"
SET "text" = $1,
    "updated_at" = now()
WHERE "id" = $2
RETURNING id, sender_id, conversation_id, text, sent_at, updated_at
`

type UpdateMessageParams struct {
	Text string
	ID   int64
}

func (q *Queries) UpdateMessage(ctx context.Context, arg UpdateMessageParams) (*Message, error) {
	row := q.db.QueryRowContext(ctx, updateMessage, arg.Text, arg.ID)
	var i Message
	err := row.Scan(
		&i.ID,
		&i.SenderID,
		&i.ConversationID,
		&i.Text,
		&i.SentAt,
		&i.UpdatedAt,
	)
	return &i, err
}
