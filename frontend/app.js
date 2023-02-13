var selectedchat = "general";

// Event is used to wrap all messages Send and Recieved on the Websocket//
class Event {
    // Each Event needs a Type
    // The payload is not required
    constructor(type, payload) {
        this.type = type;
        this.payload = payload;
    }
}

class SendMessageEvent {
    constructor(message, from) {
        this.message = message;
        this.from = from;
    }
}

class NewMessageEvent {
    constructor(message, from, sent) {
        this.message = message;
        this.from = from;
        this.sent = sent; 
    }
}

class changeChatRoomEvent {
    constructor(name) {
        this.name = name; 
    }
}

function changeChatRoom() {
    var newChat = document.getElementById("chatroom");
    if (newChat != null && newChat.value != selectedchat) {
        selectedchat = newChat.value;
        header = document.getElementById("chat-header").innerHTML = "You are currently in " + selectedchat; 

        let changeEvent = new changeChatRoomEvent(selectedchat);

        sendEvent("change_room", changeEvent)

        textarea = document.getElementById('chatmessages'); 
        textarea.innerHTML = `Your chat room is currently: ${selectedchat}`


    }
}

function routeEvent(event) {

    if (event.type === undefined) {
        alert("no 'type' field in event");
    }
    switch (event.type) {
        case "new_message":
            const messageEvent = Object.assign(NewMessageEvent, event.payload)
            appendChatMessage(messageEvent)
            break;
        default:
            alert("unsupported message type");
            break;
    }

}


function sendMessage() {
    var newmessage = document.getElementById("message");
    if (newmessage != null) {
        let outgoingEvent = new SendMessageEvent(newmessage.value, "Reddy");
        sendEvent("send_message", outgoingEvent);
    }
    return false;
}

function appendChatMessage(messageEvent) {
    var date = new Date(messageEvent.sent);
    const formattedMsg = `${date.toLocaleString()}: ${messageEvent.message}`;

    textarea = document.getElementById('chatmessages'); 
    textarea.innerHTML = textarea.innerHTML + "\n" + formattedMsg;
    textarea.scrollTop = textarea.scrollHeight; 
}


function sendEvent(eventName, payload) {
    // Create a event Object with a event named send_message
    const event = new Event(eventName, payload);
    // Format as JSON and send
    conn.send(JSON.stringify(event));
}



function login(){
let formData = {
    "username": document.getElementById("username").value,
    "password": document.getElementById("password").value
}

fetch("login", {
    method: 'post',
    body: JSON.stringify(formData),
    mode: 'cors'
}).then((response) => {
    if(response.ok){
        return response.json();
    }else {
        throw 'unauthorized user';
    }
}).then((data) => {
    //authenticated now

    connectWebSocket(data.otp);
}).catch((e) => { alert(e)});
return false
}


function connectWebSocket(otp){
// Check if the browser supports WebSocket
if (window["WebSocket"]) {
    console.log("supports websockets");
    // Connect to websocket
    conn = new WebSocket("wss://" + document.location.host + "/ws?otp="+otp);


    conn.onopen = function (evt) {
        document.getElementById("connection-header").innerHTML = "connected to web sockets"; 
    }

    conn.onclose = function (evt) {
        document.getElementById("connection-header").innerHTML = "not connected to web sockets"; 
    }

    // Add a listener to the onmessage event
    conn.onmessage = function (evt) {
        console.log(evt);
        // parse websocket message as JSON
        const eventData = JSON.parse(evt.data);
        // Assign JSON data to new Event Object
        const event = Object.assign(new Event, eventData);
        // Let router manage message
        routeEvent(event);
    }

} else {
    alert("Not supporting websockets");
}
}


window.onload = function () {
    // Apply our listener functions to the submit event on both forms
    // we do it this way to avoid redirects
    document.getElementById("chatroom-selection").onsubmit = changeChatRoom;
    document.getElementById("chatroom-message").onsubmit = sendMessage;
    document.getElementById("login-form").onsubmit = login

    
};