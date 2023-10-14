package message

import (
	"context"
	"database/sql"
	"errors"

	"nem/api/httpmw"
	"nem/api/rpc"
	"nem/api/ws"
	"nem/db"
	"nem/utils"

	"github.com/charmbracelet/log"
	"github.com/google/uuid"
)

var ErrSendMessage = errors.New("could not send message")

type Service struct {
	wsService *ws.Service
	logger    *log.Logger
}

func NewService(wsService *ws.Service) *Service {
	return &Service{
		wsService: wsService,
		logger:    log.WithPrefix("MessageService"),
	}
}

func (s *Service) SendMessageToUser(ctx context.Context, recepientId string, message *rpc.SentMessage) error {
	s.logger.Info("one-to-one message received")

	recepientID, err := uuid.Parse(recepientId)
	if err != nil {
		s.logger.Warn("failed to parse recepient id", "error", err)
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("empty recepient id param"))
	}

	tx, err := db.Pg.NewTx(ctx)
	if err != nil {
		s.logger.Warn("failed to start transaction", "error", err)
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, utils.ErrInternalServer)
	}
	defer tx.Rollback()

	sender, err := tx.FindUserByID(ctx, httpmw.ContextUID(ctx))
	if err != nil {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}
	convo, err := tx.FindConversation(ctx, message.ConversationId)
	if err != nil {
		s.logger.Warn("failed to find conversation", "error", err)
		if err == sql.ErrNoRows {
			// Create the conversation
			convo, err = tx.CreateConversation(ctx, false) // one-to-one convo
			if err != nil {
				s.logger.Warn("failed to create conversation", "error", err)
				return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, ErrSendMessage)
			}
			// Add both users to the conversation
			for _, uID := range []uuid.UUID{sender.ID, recepientID} {
				err = tx.AddUserToConversation(ctx, db.AddUserToConversationParams{
					UserID:         uID,
					ConversationID: convo.ID,
				})
				if err != nil {
					s.logger.Warn("failed to add user to conversation", "error", err)
					return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, ErrSendMessage)
				}
			}
		} else {
			return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, utils.ErrInternalServer)
		}
	}

	msg, err := tx.CreateMessage(ctx, db.CreateMessageParams{
		SenderID:       sender.ID,
		ConversationID: convo.ID,
		Text:           message.Text,
	})
	if err != nil {
		s.logger.Warn("failed to create message", "error", err)
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, ErrSendMessage)
	}

	if err := tx.Commit(); err != nil {
		s.logger.Warn("failed to commit transaction", "error", err)
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, utils.ErrInternalServer)
	}

	responseMsg := rpc.MessageResponse{
		Id:             msg.ID,
		Text:           msg.Text,
		SentAt:         msg.SentAt,
		UpdatedAt:      msg.UpdatedAt.Time,
		ConversationId: msg.ConversationID,
		Sender:         rpc.FromDbUser(sender),
	}
	return s.wsService.EmitNewMessage(msg.ConversationID, &responseMsg)
}

func (s *Service) SendMessageToClass(ctx context.Context, message *rpc.SentMessage) error {
	s.logger.Info("class message received")

	tx, err := db.Pg.NewTx(ctx)
	if err != nil {
		s.logger.Warn("failed to start transaction", "error", err)
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, utils.ErrInternalServer)
	}
	defer tx.Rollback()

	sender, err := tx.FindUserByID(ctx, httpmw.ContextUID(ctx))
	if err != nil {
		s.logger.Warn("failed to find sender user", "error", err)
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, ErrSendMessage)
	}
	convo, err := tx.FindConversation(ctx, message.ConversationId)
	if err != nil {
		s.logger.Warn("failed to find conversation", "error", err)
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, ErrSendMessage)
	}

	msg, err := tx.CreateMessage(ctx, db.CreateMessageParams{
		SenderID:       sender.ID,
		ConversationID: convo.ID,
		Text:           message.Text,
	})
	if err != nil {
		s.logger.Warn("failed to create message", "error", err)
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, ErrSendMessage)
	}

	if err := tx.Commit(); err != nil {
		s.logger.Warn("failed to commit transaction", "error", err)
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, utils.ErrInternalServer)
	}

	responseMsg := rpc.MessageResponse{
		Id:             msg.ID,
		Text:           msg.Text,
		SentAt:         msg.SentAt,
		UpdatedAt:      msg.UpdatedAt.Time,
		ConversationId: msg.ConversationID,
		Sender:         rpc.FromDbUser(sender),
	}
	return s.wsService.EmitNewMessage(msg.ConversationID, &responseMsg)
}
