package message

import (
	"context"

	"nem/api/httpmw"
	"nem/api/rpc"
	"nem/api/ws"
	"nem/db"

	"github.com/charmbracelet/log"
)

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

func (s *Service) SendMessage(ctx context.Context, message *rpc.Message) error {
	s.logger.Info("message received")

	u, err := db.Pg.FindUserByID(ctx, httpmw.ContextSessionUserID(ctx))
	if err != nil {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	msg, err := db.Pg.CreateMessage(ctx, db.CreateMessageParams{
		UserID:  u.ID,
		ClassID: message.ClassId,
		Text:    message.Text,
	})
	if err != nil {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	responseMsg := rpc.MessageResponse{
		Id:        msg.ID,
		Text:      msg.Text,
		CreatedAt: msg.CreatedAt,
		UpdatedAt: msg.UpdatedAt,
		ClassId:   msg.ClassID,
		User:      rpc.FromDbUser(u),
	}
	return s.wsService.EmitNewMessage(message.ClassId, &responseMsg)
}
