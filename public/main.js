const socket = io();

var date = new Date();
const formattedTime = date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric"
});

var form = document.getElementById("chat-form");
var input = document.getElementById("input");
var messages = document.getElementById("message-text");
var nickname = "";

$(".joinChat").click(function() {
    nickname = $(this)
        .parent()
        .siblings(".nicknameDiv")
        .children("#nickname")
        .val();
    console.log(nickname);

    if (nickname != "") {
        socket.emit("user connected", nickname);
        // socket.emit("new user", nickname);
        $("#userJoined").html("You joined the chat!");
        $(".nickname").hide();
        window.setTimeout(function() {
            $(".chat").show();
        }, 300);
        $("#you").html(
            `<div class="conversation active2" id="' ${nickname} '"><i class="fa fa-user-circle-o" aria-hidden="true" style="color:greenyellow;">Active</i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${nickname}</div>`
        );
    } else {
        // $(this).parent().siblings('.nicknameDiv').children('#nickname').val("Enter a nickname")
        $("#nickname").attr("placeholder", "Enter a nickname");
    }
});

$("#back").click(function() {
    console.log(nickname + " hello");
    socket.emit("user disconnected", nickname);
    $(".chat").hide();
    window.setTimeout(function() {
        $(".nickname").show();
    }, 300);
});

form.addEventListener("submit", function(e) {
    e.preventDefault();
    if (input.value) {
        console.log(nickname + input.value);
        console.log(typeof input.value);
        socket.emit("chat message", nickname, input.value);
        var item1 = document.createElement("div");
        item1.classList.add("paraRight");
        item1.innerHTML =
            "<strong>You: </strong>" +
            input.value +
            "<br><span><em>" +
            formattedTime +
            "</em></span>";
        messages.append(item1);
        input.value = "";
    }
});

input.addEventListener("keydown", () => {
    console.log(nickname);
    socket.emit("typing", {
        isTyping: input.value.length > 0,
        nick: nickname
    });
});

input.addEventListener("keyup", () => {
    console.log(nickname);
    setTimeout(function() { socket.emit("stopped typing", nickname);},1000)
   
});

socket.on("user connected", nickname => {
        console.log(nickname+"joined");
        $("#userJoined").html(`${nickname} joined the chat!`);
})

socket.on("user disconnected", function(nickname) {
    $("#userJoined").html(nickname + " left the chat!");
    $("#" + nickname + "-privateMessage").remove();
    $("#" + nickname + "-user").remove();

    // $('#'+nickname).children('.fa-user-circle-o').css("color","gray");
    // $('#'+nickname).remove();
});

socket.on("typing", function(data) {
    if(data.isTyping){
    $("#typing").html(data + " is typing");
    }else{
        $("#typing").html(data + " is typing");
    }
});

socket.on("stopped typing", function(data) {
    $("#typing").html(data + " stopped typing");
    setTimeout(function() {
        $("#typing").html("Nobody is typing");
    }, 1000);
});

socket.on("chat message", function(nickname, data) {
    $("#message-text").append(
        '<div class="" style="margin-left:0;margin-right:40%"><p><strong>' +
        nickname +
        ": </strong>" +
        data +
        "</p><em>" +
        formattedTime +
        "<em></div><br>"
    );
});

socket.on("all users", function(users) {
    users.forEach(element => console.log(element));
    document.querySelector(".participants").innerHTML = "";
    for (i = 0; i < users.length; i++) {
        if (users[i] === nickname) {
            continue;
        }
        $(".participants")
            .append(`<div class="container-fluid divContainer"><div class="conversation active" id="${users[i]}-user"><i class="fa fa-user-circle-o" aria-hidden="true" style="z-index:1;color:greenyellow;">Active</i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${users[i]}&nbsp;&nbsp;&nbsp;&nbsp;<button class="title-text btn user" id="${users[i]}"><i class="fas fa-envelope"></i>PM</button></div>
        <div class="conversation-message" id="${users[i]}-privateMessage">No message for you</div>
        <div class="card " id="${users[i]}-messageBox" style="display:none;position:absolute;font-size:15px;width:45rem;height:40rem;border:solid black 2px;bottom:50px;left:40%;">
            <div class="container-fluid">    
                <span class="pull-left receiverName" id="${users[i]}-receiverName" style="width:fit-content;"></span>
                <button class="btn btn-danger pull-right" id="${users[i]}-exit"style="margin:5px;">X</button>
            </div>
            <div class="container" id="${users[i]}-message-text" style="height:80%;width:95%;border:solid blue 1px;overflow-y: scroll;">
            
            </div>
            <div class="container p-1 m-1">
                <form id="${users[i]}-form" class="form ">
                <button class="pull-left" style="border:none; width:fit-content;height:auto"><i class="fa fa-send-o" style="font-size:15px;margin-right:10px"
                        alt="Send"></i>Send</button>
                     <input id="${users[i]}-input" class="form-control pull-right" style="width:80%;height:auto" style="font-size:15px;" autocomplete="off" placeholder="Type a message" />
            </div>
            </div></div><br>
        `);

        $(document).on("click", "#" + users[i], function() {
            console.log(nickname);
            let receiverName = this.id;
            let senderName = nickname;

            $("#" + receiverName + "-messageBox").show();
            $("#" + receiverName + "-receiverName").html(receiverName);
            $("#" + receiverName + "-receiverName").css({
                "margin-left": "10%",
                "padding-top": "5px",
                "padding-bottom": "5px",
                "padding-left": "30px",
                "padding-right": "30px",
                "text-align": "center",
                "width": "fit-content",
                "font-weight": "bold",
                "font-size": "25px",
                "background-color": "skyblue",
                "border": "solid black green 2px",
                "border-radius": "5px"
            })
            $("#" + receiverName + "-exit").on("click", function() {
                $("#" + receiverName + "-messageBox").hide();
            });
            $(document).on("submit", "#" + receiverName + "-form", function(e) {
                e.preventDefault();
                let input = $("#" + receiverName + "-input").val();
                if (input != "") {
                    socket.emit("private message", receiverName, senderName, input);
                    var item1 = document.createElement("div");
                    item1.classList.add("paraRight");
                    item1.innerHTML =
                        "<strong>You: </strong>" +
                        input +
                        "<br><span><em>" +
                        formattedTime +
                        "</em></span>";
                    $("#" + receiverName + "-message-text").append(item1);
                    $("#" + receiverName + "-input").val("");
                }else{

                }
            });
        });
    }
});

//for emoji
$(".emoji").on("click", function() {
    // console.log('clicked emoji'+this.value)
    // console.log(this.value)
    let inputValue = $("#input").val();
    $("#input").val(inputValue + this.value);
    console.log($("#input").val(inputValue + this.value));
});

//for search bar
$("#search").on("keyup", function() {
    console.log("key up");
    // let input=$('#search').val().toUpperCase();
    var value = $(this).val().toLowerCase();
    $(".divContainer").filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
});

$("#exit").on("click", function() {
    $(this).parents("#privateMessage").hide();
});

//for private message

socket.on("private message", function(receiverName, senderName, input) {
    if (nickname === receiverName) {
        console.log(receiverName + " " + senderName + " " + input);
        $("#" + senderName + "-privateMessage").html(senderName + " says " + input);
        $("#" + senderName + "-message-text").append(
            '<div class="" style="margin-left:0;font-size:15px;color:black;margin-right:0%"><p><strong>' +
            senderName +
            ": </strong>" +
            input +
            "</p><em>" +
            formattedTime +
            "<em></div><br>"
        );
    }
});