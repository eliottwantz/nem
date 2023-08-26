package message

import (
	"context"

	"nem/api/httpmw"
	"nem/api/rpc"
	"nem/api/ws"
	"nem/db"

	"github.com/charmbracelet/log"

	"github.com/google/uuid"
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

	cID, err := uuid.Parse(message.ClassId)
	if err != nil {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	u, err := db.Pg.FindUserByID(ctx, httpmw.ContextUID(ctx))
	if err != nil {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	msg, err := db.Pg.CreateMessage(ctx, db.CreateMessageParams{
		UserID:  u.ID,
		ClassID: cID,
		Text:    message.Text,
	})
	if err != nil {
		return rpc.ErrorWithCause(rpc.ErrWebrpcBadResponse, err)
	}

	responseMsg := rpc.MessageResponse{
		Id:        msg.ID.String(),
		Text:      msg.Text,
		CreatedAt: msg.CreatedAt,
		UpdatedAt: msg.UpdatedAt,
		ClassId:   msg.ClassID.String(),
		User:      rpc.FromDbUser(u),
	}
	return s.wsService.EmitNewMessage(cID, &responseMsg)
}
