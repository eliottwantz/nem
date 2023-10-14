package ws

import (
	"errors"

	"nem/api/rpc"

	"github.com/charmbracelet/log"
	"github.com/google/uuid"
)

type Service struct {
	hub    *Hub
	logger *log.Logger
}

func NewService(hub *Hub) *Service {
	return &Service{
		hub:    hub,
		logger: log.WithPrefix("WS Service"),
	}
}

func (s *Service) JoinClass(roomId int64, userId uuid.UUID) error {
	c, err := s.hub.findClientById(userId)
	if err != nil {
		s.logger.Warn("ws client not found", "err", err)
		return err
	}

	r, err := s.hub.findRoomById(roomId)
	if err != nil {
		s.logger.Warn("ws room not found", "err", err)
		return errors.New("the teacher has not started the class yet. please wait for the teacher to start the class")
	}

	r.register <- c

	return nil
}

func (s *Service) LeaveClass(roomId int64, userId uuid.UUID) error {
	c, err := s.hub.findClientById(userId)
	if err != nil {
		s.logger.Warn("ws client not found", "err", err)
		return err
	}

	r, err := s.hub.findRoomById(roomId)
	if err != nil {
		s.logger.Warn("ws room not found", "err", err)
		return err
	}

	r.unregister <- c

	return nil
}

func (s *Service) StartClass(roomId int64, userId uuid.UUID) error {
	c, err := s.hub.findClientById(userId)
	if err != nil {
		s.logger.Warn("ws client not found", "err", err)
		return err
	}

	r := s.hub.createRoom(roomId)
	r.register <- c

	return nil
}

func (s *Service) EndClass(roomId int64) error {
	r, err := s.hub.findRoomById(roomId)
	if err != nil {
		s.logger.Warn("ws room not found", "err", err)
		return err
	}

	s.hub.PublishToRoom(&EmittedMessage{
		Action: ActionClassEnded,
		Data:   nil,
	}, roomId)

	s.hub.removeRoom(r)

	return nil
}

func (s *Service) EmitNewMessage(roomID int64, message *rpc.MessageResponse) error {
	s.hub.PublishToRoom(&EmittedMessage{
		Action: ActionEmitNewMessage,
		Data:   message,
	}, roomID)

	return nil
}
