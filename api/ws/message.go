package ws

import (
	"encoding/json"
	"time"

	"github.com/charmbracelet/log"
)

type Message struct {
	Id        int64     `json:"id"`
	Text      string    `json:"text"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	SenderID  int64     `json:"senderId"`
	ChatID    int64     `json:"chatId"`
}

// EmittedMessage represents an emitted message
type EmittedMessage struct {
	Action Action `json:"action"`
	Data   any    `json:"data"`
}

// ReceivedMessage represents a received websocket message
type ReceivedMessage struct {
	Action Action `json:"action"`
	ChatID string `json:"chatId"`
	Data   any    `json:"data"`
}

// encode encodes the given EmittedMessage into a byte slice.
//
// It takes a pointer to an EmittedMessage as its parameter.
// It returns a byte slice containing the encoded message.
func (m *EmittedMessage) encode() []byte {
	encoding, err := json.Marshal(m)
	if err != nil {
		log.Warn("json marshal error", "err", err)
	}

	return encoding
}

// decode decodes the given byte slice into a ReceivedMessage struct.
//
// It takes a byte slice as a parameter, which represents the data to be decoded.
// It returns a pointer to a ReceivedMessage struct, which contains the decoded message.
func decode(d []byte) *ReceivedMessage {
	var message ReceivedMessage
	err := json.Unmarshal(d, &message)
	if err != nil {
		log.Warn("json marshal error", "err", err)
		return nil
	}
	return &message
}
