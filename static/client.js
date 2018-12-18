const socket = io('http://localhost:5000');
//Variables
const logTextarea = document.getElementById('logTextarea');
const liftButton = document.getElementById('liftButton');
const rollButton = document.getElementById('rollButton');
const callButton = document.getElementById('callButton');
const lieButton = document.getElementById('lieButton');
const die1Field = document.getElementById('1stDie');
const die2Field = document.getElementById('2ndDie');
const lie1Field = document.getElementById('1stLie');
const lie2Field = document.getElementById('2ndLie');
const logTextArea = document.getElementById('log');
const startButton = document.getElementById('startButton');
const joinButton = document.getElementById('joinButton');
const nameField = document.getElementById('nameField');
const scoreBoard = document.getElementById('scoreBoard');
const playControls = Array.from(document.getElementsByClassName('playControls'));

disablePlayControls();

socket.on('connect', () => {
	console.log('connected to server');
	//socket.emit('addPlayer', { name: 'Simon FizzKal Sinding' + Date.now() });
});
//  Listeners
socket.on('playerCalled', function(data) {
	console.log({ data });

	const { lastRoll, playerName } = data;
	log(playerName + ' says ' + lastRoll[0] + ' and ' + lastRoll[1]);
	// Emit that a player made a given call
	// The data object looks like the following
	// const newData = {
	//   data,
	//   playerName: callingPlayer.name
	// };
});

socket.on('returnRoll', function(data) {
	console.log(data);
	die1Field.value = parseInt(data.charAt(0));
	die2Field.value = parseInt(data.charAt(1));
	log('You rolled ' + die1Field.value + ' ' + die2Field.value);
	// Display roll to player
});

socket.on('playerJoined', function(data) {
	log(data.name + ' joined the game');
	console.log(data);
	// Add data.name to log
});
socket.on('gameStarting', () => {
	console.log('The game is starting');
	playControls.map(el => {
		el.hidden = false;
	});
});

socket.on('yourTurn', function(data) {
	log('Your turn');

	enablePlayControls();
});

socket.on('newRound', function(data) {
	scoreBoard.value = 'The score is \n';
	for (const player of data.players) {
		scoreBoard.value += `${player.name} ${player.score}\n`;
	}
	// A new round is starting, and someone just lost.
	// Data should contain the entire gamestate
	// Update scoreboard
});

socket.on('badLiar', function() {
	// The player tried to lie with a too low number
});
socket.on('gameReady', function() {
	log('Game ready');
	console.log(startButton);
	startButton.hidden = false;
});

function endTurn() {
	playControls.map(el => el.setAttribute('disabled', true));
}

function log(logString) {
	logTextArea.value += logString + '\n';
}

function disablePlayControls() {
	playControls.map(el => (el.disabled = true));
}

function enablePlayControls() {
	playControls.map(el => (el.disabled = false));
}
//Event listeners
callButton.addEventListener('click', () => {
	const die1 = die1Field.value;
	const die2 = die2Field.value;
	disablePlayControls();

	socket.emit('call', [die1, die2]);
});

joinButton.addEventListener('click', function() {
	joinGame({ name: nameField.value });
	const startControls = Array.from(document.getElementsByClassName('startControls'));
	startControls.map(el => (el.style.visibility = 'hidden'));
});

startButton.addEventListener('click', function() {
	socket.emit('start');
	const playcontrols = Array.from(document.getElementsByClassName('playControls'));
	playcontrols.map(el => (el.style.visbility = 'visible'));
});

liftButton.addEventListener('click', function() {
	disablePlayControls();

	sendLift();
	endTurn();
});

joinButton.addEventListener('click', function() {
	if (nameField.value === '') {
		alert('Name must be filled out');
		return false;
	}
});

rollButton.addEventListener('click', function() {
	rollButton.disabled = true;
	liftButton.disabled = true;
	getRoll();
});

// riskItButton.addEventListener('click', function() {
// 	disablePlayControls();

// 	sendRisk();
// 	endTurn();
// });

lieButton.addEventListener('click', function() {
	const lie1 = Math.floor(lie1Field.value);
	const lie2 = Math.floor(lie2Field.value);
	if (lie1 <= 6 && lie1 >= 1 && lie2 <= 6 && lie2 >= 1) {
		sendLie(lie1, lie2);
		endTurn();
	} else {
		log('The values for the dices must be from 1 to 6');
	}
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
