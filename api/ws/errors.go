package ws

import "errors"

var (
	ErrClientNotFound = errors.New("client not found")
	ErrRoomNotFound   = errors.New("room not found")
)
