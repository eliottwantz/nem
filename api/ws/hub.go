package ws

import (
	"errors"
	"net/http"
	"time"

	"nem/db"

	"github.com/charmbracelet/log"
	"github.com/gorilla/websocket"
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
	logger     *log.Logger
}

func NewHub() *Hub {
	h := &Hub{
		clients:    make(map[*Client]struct{}),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		rooms:      make(map[*Room]struct{}),
		logger:     log.WithPrefix("WS Hub"),
	}

	return h
}

func (h *Hub) ServeWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Error("upgrade error", "err", err)
		return
	}

	uID := r.URL.Query().Get(userIDKey)
	c := newClient(uID, conn, h)

	go c.writePump()
	go c.readPump()

	h.register <- c
}

type QueryChatRes struct {
	ID        string    `json:"id" db:"id"`
	CreatedAt time.Time `json:"createdAt" db:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt" db:"updatedAt"`
	LastSent  time.Time `json:"lastSent" db:"lastSent"`
}

func queryChats(userID string) ([]string, error) {
	query := `SELECT DISTINCT c.id FROM "Chat" c
	JOIN "_ChatToUser" ctu ON c.id = ctu."A"
	JOIN "User" u ON ctu."B" = u.id
WHERE ctu."B" = $1;`
	rows, err := db.Pg.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	chats := make([]string, 0)
	for rows.Next() {
		var chatID string
		err = rows.Scan(&chatID)
		if err != nil {
			return nil, err
		}
		chats = append(chats, chatID)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return chats, nil
}

func (h *Hub) Run() {
	for {
		select {

		case c := <-h.register:
			h.clients[c] = struct{}{}
			// Add user to all rooms he is involved in
			convos, err := queryChats(c.id)
			if err != nil {
				h.logger.Warn("failed to list conversations of user", "error", err)
			} else {
				for _, id := range convos {
					room, err := h.findRoomById(id)
					if err != nil {
						room = h.createRoom(id)
					}
					room.register <- c
				}
			}
			h.logger.Info("ws client connected", userIDKey, c.id)

		case c := <-h.unregister:
			for room := range c.rooms {
				room.unregister <- c
			}
			close(c.send)
			_ = c.conn.Close()
			delete(h.clients, c)
			h.logger.Info("ws client disconnected", userIDKey, c.id)
		}
	}
}

// PublishToRoom publishes a message to a specific room in the Hub.
//
// It takes an `EmittedMessage` object `msg` and the `roomId` of the room
// where the message should be published. If the room does not exist, it creates
// a new room and adds all users in the conversation to the room. It then
// broadcasts the message to all clients in the room.
func (h *Hub) PublishToRoom(msg *EmittedMessage, roomId string) {
	room, err := h.findRoomById(roomId)
	if err != nil {
		// Create room and add all users in conversation to room
		room = h.createRoom(roomId)
		for cl := range room.clients {
			c, err := h.findClientById(cl.id)
			if err != nil {
				continue
			}
			room.register <- c
		}
	}
	room.broadcast <- msg
}

func (h *Hub) findRoomById(id string) (*Room, error) {
	for room := range h.rooms {
		if room.id == id {
			return room, nil
		}
	}

	return nil, errors.New("ws room not found")
}

func (h *Hub) findClientById(id string) (*Client, error) {
	for c := range h.clients {
		if c.id == id {
			return c, nil
		}
	}

	return nil, errors.New("ws client not found")
}

func (h *Hub) createRoom(id string) *Room {
	room := NewRoom(id)
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
