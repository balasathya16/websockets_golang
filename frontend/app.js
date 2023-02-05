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

function routeEvent(event) {

    if (event.type === undefined) {
        alert("no 'type' field in event");
    }
    switch (event.type) {
        case "new_message":
            console.log("new message");
            break;
        default:
            alert("unsupported message type");
            break;
    }

}


function changeChatRoom() {
    var newchat = document.getElementById("chatroom");
    if (newchat != null && newchat.value != selectedchat) {
        console.log(newchat);
    }
    return false;
}

function sendMessage() {
    var newmessage = document.getElementById("message");
    if (newmessage != null) {
        sendEvent("send_message", newmessage.value)
    }
    return false;
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
})

}


window.onload = function () {
    // Apply our listener functions to the submit event on both forms
    // we do it this way to avoid redirects
    document.getElementById("chatroom-selection").onsubmit = changeChatRoom;
    document.getElementById("chatroom-message").onsubmit = sendMessage;
    document.getElementById("login-form").onsubmit = login

    // Check if the browser supports WebSocket
    if (window["WebSocket"]) {
        console.log("supports websockets");
        // Connect to websocket
        conn = new WebSocket("ws://" + document.location.host + "/ws");

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
};