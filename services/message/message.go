package message

import (
	"context"
	"errors"
	"time"

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

func (s *Service) CreateOneToOneConversation(ctx context.Context, recepientId string) (int64, error) {
	s.logger.Info("creating one-to-one conversation")

	recepientID, err := uuid.Parse(recepientId)
	if err != nil {
		s.logger.Warn("failed to parse recepient id", "error", err)
		return 0, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("empty recepient id param"))
	}

	tx, err := db.Pg.NewTx(ctx)
	if err != nil {
		s.logger.Warn("failed to start transaction", "error", err)
		return 0, utils.ErrInternalServer
	}
	defer tx.Rollback()

	sender, err := tx.FindUserByID(ctx, httpmw.ContextUID(ctx))
	if err != nil {
		return 0, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	// Create the conversation
	convo, err := tx.CreateConversation(ctx, false) // one-to-one convo
	if err != nil {
		s.logger.Warn("failed to create conversation", "error", err)
		return 0, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, ErrSendMessage)
	}
	// Add both users to the conversation
	for _, uID := range []uuid.UUID{sender.ID, recepientID} {
		err = tx.AddUserToConversation(ctx, db.AddUserToConversationParams{
			UserID:         uID,
			ConversationID: convo.ID,
		})
		if err != nil {
			s.logger.Warn("failed to add user to conversation", "error", err)
			return 0, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, ErrSendMessage)
		}
	}

	err = tx.Commit()
	if err != nil {
		s.logger.Warn("failed to commit transaction", "error", err)
		return 0, utils.ErrInternalServer
	}

	return convo.ID, nil
}

func (s *Service) SendMessageToUser(ctx context.Context, message *rpc.SentMessage) error {
	s.logger.Info("one-to-one message received")

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

	responseMsg := rpc.Message{
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

	responseMsg := rpc.Message{
		Id:             msg.ID,
		Text:           msg.Text,
		SentAt:         msg.SentAt,
		UpdatedAt:      msg.UpdatedAt.Time,
		ConversationId: msg.ConversationID,
		Sender:         rpc.FromDbUser(sender),
	}
	return s.wsService.EmitNewMessage(msg.ConversationID, &responseMsg)
}

func (s *Service) FindOneToOneConversation(ctx context.Context, user1Id string, user2Id string) (*rpc.Conversation, error) {
	u1ID, err := uuid.Parse(user1Id)
	if err != nil {
		s.logger.Warn("failed to parse user id", "error", err)
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("empty user1 id param"))
	}

	u2ID, err := uuid.Parse(user2Id)
	if err != nil {
		s.logger.Warn("failed to parse user id", "error", err)
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("empty user2 id param"))
	}

	u1, err := db.Pg.FindUserByID(ctx, u1ID)
	if err != nil {
		s.logger.Warn("failed to find user", "error", err)
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("error finding conversation"))
	}

	u2, err := db.Pg.FindUserByID(ctx, u2ID)
	if err != nil {
		s.logger.Warn("failed to find user", "error", err)
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("error finding conversation"))
	}

	convo, err := db.Pg.FindOneToOneConversation(ctx, db.FindOneToOneConversationParams{
		UserID:   u1ID,
		UserID_2: u2ID,
	})
	if err != nil {
		s.logger.Warn("failed to find conversation", "error", err)
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("failed to find conversation"))
	}

	return &rpc.Conversation{
		Id:          convo.ID,
		IsClassChat: convo.IsClassChat,
		Users:       []*rpc.User{rpc.FromDbUser(u1), rpc.FromDbUser(u2)},
		CreatedAt:   convo.CreatedAt,
	}, nil
}

func (s *Service) ListConversationsOfUser(ctx context.Context, userId string) ([]*rpc.Conversation, error) {
	uID, err := uuid.Parse(userId)
	if err != nil {
		s.logger.Warn("failed to parse user id", "error", err)
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("empty user id param"))
	}

	convos, err := db.Pg.ListConversationsOfUser(ctx, uID)
	if err != nil {
		s.logger.Warn("failed to list conversations of user", "error", err)
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("failed to list conversations of user"))
	}

	ret := make([]*rpc.Conversation, 0, len(convos))
	for _, c := range convos {
		ret = append(ret, rpc.FromDbConversation(c))
	}

	return ret, nil
}

func (s *Service) ListMessagesOfConversation(ctx context.Context, conversationId int64) ([]*rpc.Message, error) {
	if conversationId <= 0 {
		s.logger.Warn("failed to parse conversation id")
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("invalid or empty  conversation id param"))
	}

	msgs, err := db.Pg.ListMessagesOfConversation(ctx, conversationId)
	if err != nil {
		s.logger.Warn("failed to list messages of conversation", "error", err)
		return nil, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("failed to list messages of conversation"))
	}

	ret := make([]*rpc.Message, 0, len(msgs))
	for _, m := range msgs {
		ret = append(ret, &rpc.Message{
			Id:             m.ID,
			Text:           m.Text,
			SentAt:         m.SentAt,
			UpdatedAt:      m.UpdatedAt.Time,
			ConversationId: m.ConversationID,
			Sender: rpc.FromDbUser(&db.User{
				ID:               m.SenderID,
				Email:            m.Email,
				FirstName:        m.FirstName,
				LastName:         m.LastName,
				Role:             m.Role,
				PreferedLanguage: m.PreferedLanguage,
				AvatarFilePath:   m.AvatarFilePath,
				AvatarUrl:        m.AvatarUrl,
				CreatedAt:        m.CreatedAt,
				UpdatedAt:        m.UpdatedAt_2,
			}),
		})
	}

	return ret, nil
}

func (s *Service) ListMessagesOfConversationWithCursor(ctx context.Context, conversationId int64, cursor time.Time) ([]*rpc.Message, bool, error) {
	if conversationId <= 0 {
		s.logger.Warn("failed to parse conversation id")
		return nil, false, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("invalid or empty  conversation id param"))
	}

	msgs, err := db.Pg.ListMessagesOfConversationWithCursor(ctx, db.ListMessagesOfConversationWithCursorParams{
		ConversationID: conversationId,
		SentAt:         cursor,
	})
	if err != nil {
		s.logger.Warn("failed to list messages of conversation", "error", err)
		return nil, false, rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, errors.New("failed to list messages of conversation"))
	}

	ret := make([]*rpc.Message, 0, len(msgs))
	for _, m := range msgs {
		ret = append(ret, &rpc.Message{
			Id:             m.ID,
			Text:           m.Text,
			SentAt:         m.SentAt,
			UpdatedAt:      m.UpdatedAt.Time,
			ConversationId: m.ConversationID,
			Sender: rpc.FromDbUser(&db.User{
				ID:               m.SenderID,
				Email:            m.Email,
				FirstName:        m.FirstName,
				LastName:         m.LastName,
				Role:             m.Role,
				PreferedLanguage: m.PreferedLanguage,
				AvatarFilePath:   m.AvatarFilePath,
				AvatarUrl:        m.AvatarUrl,
				CreatedAt:        m.CreatedAt,
				UpdatedAt:        m.UpdatedAt_2,
			}),
		})
	}

	return ret, len(msgs) == 20, nil // isMore if LIMIT of 20 = len of msgs
}
