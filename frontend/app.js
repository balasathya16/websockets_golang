var selectedChat = "general";

class Event { 
    constructor(type, payload){
        this.type = type;
        this.payload = payload;
    }
}


function routeEvent(event) {
    if(event.type === undefined){
        alert('no type field in the event');
    }

    switch(event.type) {
        case "new message":
            console.log("new message received");
            break;
            default:
                alert("unsupported message"); 
                break;
    }
}

function sendEvent(eventName, payload) {
    const event = new Event(eventName, payload);
    conn.send(JSON.stringify(event));
}

function changeChatRoom() {
    var newChat = document.getElementById("chatroom");
    if(newChat != null && newChat.value != selectedChat){
        console.log(newChat);
    }
    return false;
}

function sendMessage() {
    var newMessage = document.getElementById("message");
    if(newMessage != null){
        conn.send(newMessage.value);
        sendEvent("send_message", newMessage.value)
    }
    return false; 
}

window.onload = function() {
    document.getElementById("chatroom-selection").onsubmit = changeChatRoom;
    document.getElementById("chatroom-message").onsubmit = sendMessage;

    if (window["WebSocket"]) {
        console.log("Websockets are supported");
        //connect to websockets 
        conn = new WebSocket("ws://" + document.location.host + "/ws");

        conn.onmessage = function(evt) {
            const eventData = JSON.parse(evt.data);
            const event = Object.assign(new Event, eventData);
            
            routeEvent(event); 
        }
    }

    else {
        alert('Websockets are not supported')
    }


}