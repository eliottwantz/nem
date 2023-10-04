package ws

import (
	"errors"
	"net/http"
	"time"

	"nem/api/httpmw"
	"nem/services/user"

	"github.com/charmbracelet/log"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
)

const (
	PingInterval = 5 * time.Second
	userIDKey    = "uID"
	wsKey        = "wsKey"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// Hub maintains the set of active clients and broadcasts messages to the
// clients.
type Hub struct {
	clients    map[*Client]struct{}
	register   chan *Client
	unregister chan *Client
	rooms      map[*Room]struct{}

	userService *user.Service
	redisClient *redis.Client

	logger *log.Logger
}

type Config struct {
	UserService *user.Service
	RedisClient *redis.Client
}

func NewHub(c *Config) *Hub {
	h := &Hub{
		clients:    make(map[*Client]struct{}),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		rooms:      make(map[*Room]struct{}),

		userService: c.UserService,
		redisClient: c.RedisClient,

		logger: log.WithPrefix("WS Hub"),
	}

	return h
}

func (h *Hub) ServeWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Error("upgrade error", "err", err)
		return
	}

	c := newClient(httpmw.ContextUID(r.Context()), conn, h)

	go c.writePump()
	go c.readPump()

	h.register <- c
}

func (h *Hub) Run() {
	for {
		select {

		case c := <-h.register:
			h.clients[c] = struct{}{}
			h.logger.Info("ws client connected", userIDKey, c.id)

		case c := <-h.unregister:
			delete(h.clients, c)
			h.logger.Info("ws client disconnected", userIDKey, c.id)
		}
	}
}

// PublishToRoom sends a message to all connected clients in a specific room.
//
// The function takes in the message to be sent as a byte array and the ID of the room.
// It finds the room with the given ID and publishes the message to all clients in that room.
func (h *Hub) PublishToRoom(msg *EmittedMessage, roomId uuid.UUID) {
	if room, err := h.findRoomById(roomId); err == nil {
		room.broadcast <- msg
	}
}

func (h *Hub) findRoomById(id uuid.UUID) (*Room, error) {
	for room := range h.rooms {
		if room.id == id {
			return room, nil
		}
	}

	return nil, errors.New("ws room not found")
}

func (h *Hub) findClientById(id uuid.UUID) (*Client, error) {
	for c := range h.clients {
		if c.id == id {
			return c, nil
		}
	}

	return nil, errors.New("ws client not found")
}

func (h *Hub) createRoom(id uuid.UUID) *Room {
	room := NewRoom(id, h.redisClient)
	go room.Run()
	h.rooms[room] = struct{}{}

	return room
}

func (h *Hub) removeRoom(r *Room) {
	for c := range r.clients {
		r.unregister <- c
	}
	delete(h.rooms, r)
}
