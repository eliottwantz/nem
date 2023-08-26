package ws

import (
	"encoding/json"

	"github.com/charmbracelet/log"
	"github.com/google/uuid"
)

// EmittedMessage represents an emitted message
type EmittedMessage struct {
	Action Action `json:"action"`
	Data   any    `json:"data"`
}

// ReceivedMessage represents a received websocket message
type ReceivedMessage struct {
	Action Action    `json:"action"`
	RoomID uuid.UUID `json:"roomId"`
	Data   any       `json:"data"`
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
