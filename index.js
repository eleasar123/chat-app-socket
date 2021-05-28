const express = require("express");
const socket = require("socket.io");

// App setup
const PORT = process.env.PORT ||5000;
const app = express();
const server = app.listen(PORT, function() {
    console.log(`Listening on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});

// Static files
app.use(express.static("public"));

// Socket setup
const io = socket(server);
let activeUsers = [];
// const activeUsers = new Set();
socket.nickname = "";
io.on("connection", function(socket) {
    // console.log(socket)
    console.log("Made socket connection");

    //get the user who connected
    socket.on("user connected", function(nickname) {
        socket.nickname = nickname;
        // console.log(nickname)
        if (nickname != "") {
            activeUsers.push(nickname);
        }
        console.log(activeUsers + "hey");
        io.emit("all users", activeUsers);
        // console.log("kini siya niapil"+nickname)
        socket.broadcast.emit("user connected",nickname);
        console.log("user" + activeUsers);
        return;
    });

    socket.on("disconnect", () => {
        // console.log(socket.nickname)
        if(socket.nickname!=null){
            var i = activeUsers.indexOf(socket.nickname);
            console.log(i + "t");
            console.log(socket.nickname + "left oi");
            socket.broadcast.emit("user disconnected", socket.nickname);
            console.log(activeUsers);
            if (i != -1) {
                activeUsers.splice(i, 1);
            }
            // activeUsers.splice(i, 1);
            console.log(activeUsers);
        }
    });

    socket.on("user disconnected", data => {
        var i = activeUsers.indexOf(data);
        console.log(data + " left");
        socket.broadcast.emit("user disconnected", data);
        if (i != -1) {
            activeUsers.splice(i, 1);
        }
        // activeUsers.splice(i, 1);
        console.log(activeUsers);
    });

    socket.on("chat message", function(nickname, data) {
        console.log(nickname + " says " + data);
        socket.broadcast.emit("chat message", nickname, data);
    });

    socket.on("typing", function(data) {
        console.log(data.nick + " is typing");
        socket.broadcast.emit("typing", data.isTyping, data.nick);
    });

    socket.on("stopped typing", function(data) {
        console.log(data + " stopped typing");
        socket.broadcast.emit("stopped typing", data);
    });

    socket.on("private message", function(receiverName, senderName, input) {
        console.log(receiverName + " " + senderName + " " + input);
        socket.broadcast.emit("private message", receiverName, senderName, input);
    });
});