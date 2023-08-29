const params = new URLSearchParams(window.location.search);
let chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages")
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

const socket = io();

const username = params.get('username');
const room = params.get('room');

// console.log(username);
// console.log(room);

socket.emit('joinRoom', ({username, room}));

// Show all users of perticular room 
socket.on('roomUsers', ({room, users})=>{
  outputRoom(room);
  outputUsers(users);
})

// Recieve message from  the server
socket.on("message", (user) => {
  document.getElementById("room-name").innerText = room;
  // addUser(user.username);
  showMessage(user);


  // Scroll the chat messages
  chatMessages.scrollTop = chatMessages.scrollHeight;
});



chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = e.target.elements.msg.value;

  // Emit a message to the server

  // Send user to server
  socket.emit("chatmessage", text);

  // focus on input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});



function showMessage(user){
  const div = document.createElement('div');
  div.classList.add('message');
  if(user.username === username){
    div.classList.add('right');
  }
  else {
    div.classList.add('left');
  }
  div.innerHTML = `
  <p class= "meta">${user.username} <span> ${user.time}</span></p>
  <p class = "text">${user.text}</p>
  `;

 
  document.querySelector(".chat-messages").appendChild(div);
}




function addUser(username){
  console.log(username);
  const list = document.createElement('li');
  list.innerText = `
   ${username}
  `;
  document.querySelector("#users").appendChild(list);
}

function outputRoom(room){
  roomName.innerText = room; 
}

function outputUsers(users){
  // console.log(users);
  userList.innerHTML = `
   ${users.map(user => `<li>${user.username}</li>`).join('')}`
}
