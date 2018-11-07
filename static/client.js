const logTextarea = document.getElementById('logTextarea');
var socket = io('http://localhost:5000');

socket.on('connect', () => {
	console.log('connected to server');
	socket.emit('addPlayer', { name: 'Simon Fucking Sinding' });
});
//  Listeners
socket.on('returnRoll', function(data) {
	console.log(data);
	// Display roll to player
});

socket.on('playerJoined', function(data) {
	console.log(data);
	logTextarea.value += `${data.name} joined the session`;
	// Add data.name to log
});

function endTurn() {
	document.getElementsByClassName('').style.visibility = 'hidden';
}

document.getElementById('liftButton').addEventListener('click', () => sendLift(0));

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
