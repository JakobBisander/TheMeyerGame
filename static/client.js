//Variables
var socket = io();
liftButton = document.getElementById('liftButton');
rollButton = document.getElementById('rollButton');
riskItButton = document.getElementById('riskItButton');
lieButton = document.getElementById('lieButton');
die1Field = document.getElementById('1stDie');
die2Field = document.getElementById('2ndDie');
lie1Field = document.getElementById('1stLie');
lie2Field = document.getElementById('2ndLie');
lieButton = document.getElementById('lieButton');

//  Listeners
socket.on('returnRoll', function(data) {
  console.log(data);
  // Display roll to player
});

socket.on('playerJoined', function(data) {
  console.log(data);
  // Add data.name to log
});

socket.on('yourTurn', function(data) {});

socket.on('newRound', function(data) {
  // A new round is starting, and someone just lost.
  // Data should contain the entire gamestate
});

function endTurn() {
  document.getElementsByClassName('').style.visibility = 'hidden';
}

liftButton.addEventListener('click', function() {
  sendLift();
  endTurn();
});

rollButton.addEventListener('click', function() {
  getRoll();
});

riskButton.addEventListener('click', function() {
  sendRisk();
  endTurn();
});

// Emits
function joinGame(player) {
  socket.emit('addPlayer', player);
}

function sendStart() {
  socket.emit('start');
}

function getRoll() {
  socket.emit('roll');
}

function sendLift() {
  socket.emit('lift');
}

function sendCall(die1, die2) {
  socket.emit('call', [die1, die2]);
}

function sendLie(die1, die2) {
  socket.emit('lie', [die1, die2]);
}

function sendRisk() {
  socket.emit('risk');
}

// setInterval(function() {
//   socket.emit('movement', movement);
// }, 1000 / 60);

// setInterval(function() {
//   const player = { name: 'Jakob' };
//   io.sockets.emit('new player', player);
// }, 1000 / 60);

// socket.on('state', function(data) {
//   console.log(data);
// });
