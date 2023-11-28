package ws

type Action string

const (
	// Subscribed actions from clients
	ActionReceiveStartTyping Action = "startTyping"
	ActionReceiveStopTyping  Action = "stopTyping"
	ActionReceiveSetOnline   Action = "setOnline"
	ActionReceiveSetOffline  Action = "setOffline"
	ActionReceiveSendMessage Action = "sendMessage"

	// Emited actions to clients
	ActionEmitJoinRoom      Action = "joinRoom"
	ActionEmitLeftRoom      Action = "leftRoom"
	ActionEmitNewMessage    Action = "newMessage"
	ActionEmitEditMessage   Action = "editMessage"
	ActionEmitDeleteMessage Action = "deleteMessage"

	ActionEmitAddToTyping      Action = "addToTyping"
	ActionEmitRemoveFromTyping Action = "removeFromTyping"

	ActionClassEnded Action = "classEnded"
)
