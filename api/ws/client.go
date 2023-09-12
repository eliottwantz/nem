package ws

import (
	"time"

	"github.com/charmbracelet/log"
	"github.com/gorilla/websocket"
)

const (
	// Max wait time when writing message to peer
	writeWait = 10 * time.Second

	// Max time till next pong from peer
	pongWait = 60 * time.Second

	// Send ping interval, must be less then pong wait time
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 10000
)

var newline = []byte{'\n'}

type Client struct {
	id    string
	conn  *websocket.Conn
	hub   *Hub
	send  chan []byte
	rooms map[*Room]struct{}
}

func newClient(id string, conn *websocket.Conn, hub *Hub) *Client {
	return &Client{
		id:    id,
		conn:  conn,
		hub:   hub,
		send:  make(chan []byte),
		rooms: make(map[*Room]struct{}),
	}
}

func (c *Client) readPump() {
	defer func() {
		c.disconnect()
	}()
	c.conn.SetReadLimit(maxMessageSize)

	_ = c.conn.SetReadDeadline(time.Now().Add(pongWait))

	c.conn.SetPongHandler(func(string) error {
		_ = c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, jsonMessage, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure, websocket.CloseNoStatusReceived) {
				break
			}
			c.hub.logger.Error("read error", "err", err)
			break
		}
		c.handleNewMessage(jsonMessage)
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		_ = c.conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			_ = c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel.
				_ = c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			_, _ = w.Write(message)

			// Add queued chat messages to the current websocket message.
			n := len(c.send)
			for i := 0; i < n; i++ {
				_, _ = w.Write(newline)
				_, _ = w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			_ = c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func (c *Client) disconnect() {
	c.hub.unregister <- c
	for room := range c.rooms {
		room.unregister <- c
	}
	close(c.send)
	_ = c.conn.Close()
}

func (c *Client) handleNewMessage(raw []byte) {
	msg := decode(raw)
	if msg == nil {
		log.Warn("cannot decode message")
		return
	}

	switch msg.Action {
	case ActionReceiveStartTyping:
		c.handleTypingEvent(msg, ActionEmitAddToTyping)
	case ActionReceiveStopTyping:
		c.handleTypingEvent(msg, ActionEmitRemoveFromTyping)
	}
}

func (c *Client) handleTypingEvent(msg *ReceivedMessage, action Action) {
	c.hub.PublishToRoom(&EmittedMessage{
		Action: action,
		Data:   msg.Data,
	}, msg.RoomID)
}
