package main

import (
	"encoding/json"
	"log"

	"github.com/gorilla/websocket"
)

type ClientList map[*Client]bool

type Client struct {
	// the websocket connection
	connection *websocket.Conn
	manager    *Manager
	egress     chan Event
}

func NewClient(conn *websocket.Conn, manager *Manager) *Client {
	return &Client{
		connection: conn,
		manager:    manager,
		egress:     make(chan Event),
	}
}

func (c *Client) readMessages() {
	defer func() {
		// Graceful Close the Connection once this
		// function is done
		c.manager.removeClient(c)
	}()
	// Loop Forever
	for {

		_, payload, err := c.connection.ReadMessage()

		if err != nil {

			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error reading message: %v", err)
			}
			break
		}
		// Marshal incoming data into a Event struct
		var request Event
		if err := json.Unmarshal(payload, &request); err != nil {
			log.Printf("error marshalling message: %v", err)
			break
		}
		// Route the Event
		if err := c.manager.routeEvent(request, c); err != nil {
			log.Println("Error handeling Message: ", err)
		}
	}
}

func (c *Client) writeMessages() {
	defer func() {

		c.manager.removeClient(c)
	}()

	for {
		select {
		case message, ok := <-c.egress:

			if !ok {
				// Manager has closed this connection channel, so communicate that to frontend
				if err := c.connection.WriteMessage(websocket.CloseMessage, nil); err != nil {
					// Log that the connection is closed and the reason
					log.Println("connection closed: ", err)
				}

				return
			}
			data, err := json.Marshal(message)
			if err != nil {
				log.Println(err)
				return // closes the connection, should we really
			}

			if err := c.connection.WriteMessage(websocket.TextMessage, data); err != nil {
				log.Println(err)
			}
			log.Println("sent message")
		}

	}
}
