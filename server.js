const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const forwardMessage = require('./utils/message')
const { userJoin, getCurrUser, userLeave, getRoomUsers} = require("./utils/user");

app.use(express.static(path.join(__dirname, 'public')))

const io = socketio(server);

const botName = 'techChat'

// When client connect to the server
io.on('connection', socket =>{
    console.log('New WS connection...');

    socket.on('joinRoom', ({username, room})=>{
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

         // Send message to the client
        socket.emit('message',  forwardMessage(botName, "Welcome to te techchat."))

        //Broadcast message to the all client except to the current client
        socket.broadcast.to(user.room).emit('message', forwardMessage(botName, `${user.username} has joined the chat`));

         // Send User and room users
         io.to(user.room).emit('roomUsers', {
            room : user.room,
            users: getRoomUsers(user.room)
        })
    })

   

    // io.emit('message', 'A new client has joined.')

    // Recive a message from the client
    socket.on('chatmessage', msg=>{
        const user = getCurrUser(socket.id);

        io.to(user.room).emit('message', forwardMessage(user.username, msg))
    });

    // Run when client disconnects
    socket.on('disconnect', ()=>{
        const user = userLeave(socket.id);

        if(user){
            io.to(user.room).emit('message', forwardMessage(botName, `${user.username} has leave the chat room.`))

            // Send User and room users
            io.to(user.room).emit('roomUsers', {
                room : user.room,
                users: getRoomUsers(user.room)
            })
        }
    })
})



const PORT = 8000 || process.env.PORT;

server.listen(PORT, ()=>{
    console.log(`You are listening the port ${PORT}`);
})