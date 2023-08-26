package ws

import (
	"context"

	"github.com/charmbracelet/log"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

// Room represents a websocket room
type Room struct {
	id         uuid.UUID
	clients    map[*Client]struct{}
	register   chan *Client
	unregister chan *Client
	broadcast  chan *EmittedMessage
	redis      *redis.Client
	logger     *log.Logger
}

var ctx = context.Background()

// NewRoom creates a new Room
func NewRoom(id uuid.UUID, rds *redis.Client) *Room {
	return &Room{
		id:         id,
		clients:    make(map[*Client]struct{}),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan *EmittedMessage),
		redis:      rds,
		logger:     log.With("ws room", id.String()),
	}
}

func (r *Room) GetId() uuid.UUID {
	return r.id
}

func (r *Room) Run() {
	go r.subscribeToRoomMessages()

	for {
		select {

		case c := <-r.register:
			r.clients[c] = struct{}{}
			c.rooms[r] = struct{}{}

		case c := <-r.unregister:
			delete(r.clients, c)
			delete(c.rooms, r)

		case msg := <-r.broadcast:
			r.publishRoomMessage(msg.encode())
		}
	}
}

func (r *Room) publishRoomMessage(message []byte) {
	err := r.redis.Publish(ctx, r.GetId().String(), message).Err()
	if err != nil {
		r.logger.Warn("publish error", "err", err)
	}
}

func (r *Room) subscribeToRoomMessages() {
	ch := r.redis.Subscribe(ctx, r.GetId().String()).Channel()

	for msg := range ch {
		for client := range r.clients {
			client.send <- []byte(msg.Payload)
		}
	}
}
