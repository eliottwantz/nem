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

func (s *Service) JoinClass(roomId uuid.UUID, userId string) error {
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

func (s *Service) LeaveClass(roomId uuid.UUID, userId string) error {
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

func (s *Service) StartClass(roomId uuid.UUID, userId string) error {
	c, err := s.hub.findClientById(userId)
	if err != nil {
		s.logger.Warn("ws client not found", "err", err)
		return err
	}

	r := s.hub.createRoom(roomId)
	r.register <- c

	return nil
}

func (s *Service) EndClass(roomId uuid.UUID) error {
	r, err := s.hub.findRoomById(roomId)
	if err != nil {
		s.logger.Warn("ws room not found", "err", err)
		return err
	}

	s.hub.removeRoom(r)

	return nil
}

func (s *Service) EmitNewMessage(roomID uuid.UUID, message *rpc.MessageResponse) error {
	msg := EmittedMessage{
		Action: ActionEmitNewMessage,
		Data:   message,
	}
	s.hub.PublishToRoom(&msg, roomID)

	return nil
}
