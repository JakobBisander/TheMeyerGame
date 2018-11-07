// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
const Player = require('./Player');
const Game = require('./Game');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));
// Routing
app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname, 'index.html'));
});
// Starts the server.
server.listen(5000, function() {
	console.log('Starting server on port 5000');
});

let players = [];
let game;

io.on('connection', function(socket) {
	console.log('client with id', socket.id, 'connected');

	socket.on('addPlayer', function(data) {
		const player = new Player(data.name, socket.id);
		console.log('Adding player: ', player.name);
		players.push(player);
		socket.emit('playerJoined', player);
	});

	socket.on('leave', function() {
		const leavingPlayer = game.players.filter(player => {
			return player.socketId === socket.id;
		});
		game.removePlayer(leavingPlayer);
	});

	socket.on('disconnect', function(socket) {
		console.log(socket);

		// const disconnectingPlayer = game.players.filter(player => {
		//   return player.socketId === socket.id;
		// });
		// game.removePlayer(disconnectingPlayer);
	});

	socket.on('start', function() {
		if (players.length === 0) {
			socket.emit('error', { message: 'error not enough players' });
			return;
		}
		game = new Game(players);
	});

	socket.on('roll', function() {
		io.to(socket.id).emit('returnRoll', game.rollDice());
	});

	socket.on('lift', function() {
		const playerObject = game.endRound();

		const nextPlayer = game.getCurrentPlayer();
		//Noget med nogle emits til clients
	});

	socket.on('call', function(data) {
		const callingPlayer = game.players.filter(player => {
			return player.socketId === socket.id;
		});
		// console.log('Calling player: ', callingPlayer.name);
		// game.call(data, callingPlayer);
		const nextPlayer = game.getCurrentPlayer();

		const newData = {
			data,
			playerName: callingPlayer.name
		};
		Object.assign(data, newData);

		socket.emit('playerCalled', data);
		io.to(nextPlayer.socketId).emit('yourTurn', data);
	});

	socket.on('lie', function(data) {
		game.lie(data);
	});

	socket.on('risk', function() {
		game.risk();
	});
});
