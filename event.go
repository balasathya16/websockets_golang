package main

import (
	"encoding/json"
	"time"
)

type Event struct {
	Type string `json:"type"`

	Payload json.RawMessage `json:"payload"`
}

type EventHandler func(event Event, c *Client) error

const (
	// EventSendMessage is the event name for new chat messages sent
	EventSendMessage = "send_message"
)

type SendMessageEvent struct {
	Message string `json:"message"`
	From    string `json:"from"`
}

type NewmessageEvent struct {
	SendMessageEvent
	Sent time.Time `json:"sent"`
}
