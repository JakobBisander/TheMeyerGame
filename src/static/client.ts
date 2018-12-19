
import socketIO = require('socket.io');
import Player = require('../Player');
const socket = socketIO('http://localhost:5000');

//Variables
const liftButton = document.getElementById('liftButton');
const rollButton = document.getElementById('rollButton');
const callButton = document.getElementById('callButton');
const lieButton = document.getElementById('lieButton');
const die1Field = <HTMLInputElement>document.getElementById('1stDie');
const die2Field = <HTMLInputElement>document.getElementById('2ndDie');
const lie1Field = <HTMLInputElement>document.getElementById('1stLie');
const lie2Field = <HTMLInputElement>document.getElementById('2ndLie');
const logTextArea = <HTMLInputElement>document.getElementById('log');
const startButton = document.getElementById('startButton');
const joinButton = document.getElementById('joinButton');
const nameField = <HTMLInputElement>document.getElementById('nameField');
const scoreBoard = <HTMLInputElement>document.getElementById('scoreBoard');
const playControls = Array.from(document.getElementsByClassName('playControls'));

disablePlayControls();

socket.on('connect', () => {
	console.log('connected to server');
});
//  Listeners
socket.on('playerCalled', function (data: { lastRoll: number[], playerName: string }) {
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

socket.on('returnRoll', function (data: string) {
	console.log(data);
	die1Field.value = data.charAt(0);
	die2Field.value = data.charAt(1);
	log('You rolled ' + die1Field.value + ' ' + die2Field.value);
	// Display roll to player
});

socket.on('playerJoined', function (data: Player) {
	log(data.name + ' joined the game');
	console.log(data);
	// Add data.name to log
});
socket.on('gameStarting', () => {
	console.log('The game is starting');
	startButton.hidden = true;
	playControls.map(el => {
		(<HTMLInputElement>el).hidden = false;
	});
	scoreBoard.hidden = false;
});

socket.on('yourTurn', () => {
	log('Your turn');

	enablePlayControls();
});
socket.on('gameEnded', function (data: Player) {
	disablePlayControls();
	console.log("Game ended");
	alert('Game is over!\n' + data.name + " has won!");
});

socket.on('newRound', function (data: Player[]) {
	scoreBoard.value = 'The score is \n';
	for (const player of data) {
		scoreBoard.value += `${player.name} ${player.score}\n`;
	}
	// A new round is starting, and someone just lost.
	// Data should contain the entire gamestate
	// Update scoreboard
});
socket.on('invalidCall', () => {
	alert("Invalid call. If the roll you've made is lower than the previous roll, you'll have to lie." +
		"\nThis is because the developer didn't implement the risk-it feature yet.");
	lie1Field.disabled = false;
	lie2Field.disabled = false;
	(<HTMLInputElement>lieButton).disabled = false;
});

socket.on('badLiar', function () {
	// The player tried to lie with a too low number
});
socket.on('gameReady', function () {
	log('Game ready');
	startButton.hidden = false;
});

function endTurn() {
	playControls.map(el => (<HTMLInputElement>el).disabled = true);
}

function log(logString: string) {
	logTextArea.value += logString + '\n';
}

function disablePlayControls() {
	playControls.map(el => ((<HTMLInputElement>el).disabled = true));
}

function enablePlayControls() {
	playControls.map(el => ((<HTMLInputElement>el).disabled = false));
}
//Event listeners

callButton.addEventListener('click', () => {
	const die1 = die1Field.value;
	const die2 = die2Field.value;
	disablePlayControls();
	socket.emit('call', [die1, die2]);
});

joinButton.addEventListener('click', function () {
	joinGame({ name: nameField.value });
	const startControls = Array.from(document.getElementsByClassName('startControls'));
	startControls.map(el => ((<HTMLInputElement>el).style.visibility = 'hidden'));
});

startButton.addEventListener('click', function () {
	socket.emit('start');
	const playcontrols = Array.from(document.getElementsByClassName('playControls'));
	playcontrols.map(el => ((<HTMLInputElement>el).style.visibility = 'visible'));
});

liftButton.addEventListener('click', function () {
	disablePlayControls();

	sendLift();
	endTurn();
});

joinButton.addEventListener('click', function () {
	if (nameField.value === '') {
		alert('Name must be filled out');
		return false;
	}
});

rollButton.addEventListener('click', function () {
	(<HTMLInputElement>rollButton).disabled = true;
	(<HTMLInputElement>liftButton).disabled = true;
	getRoll();
});

// riskItButton.addEventListener('click', function() {
// 	disablePlayControls();

// 	sendRisk();
// 	endTurn();
// });

lieButton.addEventListener('click', () => {
	const lie1 = Math.floor(parseInt(lie1Field.value));
	const lie2 = Math.floor(parseInt(lie2Field.value));
	if (lie1 <= 6 && lie1 >= 1 && lie2 <= 6 && lie2 >= 1) {
		sendLie(lie1, lie2);
		endTurn();
	} else {
		alert('The values for the dices must be from 1 to 6');
	}
});

// Emits
function joinGame(player: { name: string }) {
	socket.emit('addPlayer', player);
}

function getRoll() {
	socket.emit('roll');
}

function sendLift() {
	socket.emit('lift');
}

function sendLie(die1: number, die2: number) {
	socket.emit('lie', [die1, die2]);
}

function sendRisk() {
	socket.emit('risk');
}
