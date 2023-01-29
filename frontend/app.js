var selectedChat = "general";

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
            console.log(evt); 
        }
    }

    else {
        alert('Websockets are not supported')
    }


}