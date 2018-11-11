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
	socket.on('addPlayer', function(data) {
		const player = new Player(data.name, socket.id);
		players.push(player);
		io.emit('playerJoined', player);
		if(players.length>=2){
			io.emit('gameReady');
		}
	});

	// Called whenever a player willingly leaves
	socket.on('leave', function() {
		const leavingPlayer = game.players.filter(player => {
			return player.socketId === socket.id;
		});
		game.removePlayer(leavingPlayer);
	});

	// Called whenever a player loses connection to the server
	socket.on('disconnect', function() {
		if (typeof game === 'undefined') {
			// If the game has not yet started, the disconnecting player should only be removed from the players array
		} else {
			// If the game has started, the disconnecting player should be removed from the game instance
			const disconnectingPlayer = game.players.filter(player => {
				return player.socketId === socket.id;
			});
			game.removePlayer(disconnectingPlayer);
		}
	});

	// Called whenever a player decides to start the game, with the currently connected players
	socket.on('start', function() {
		game = new Game(players);

		const nextPlayer = game.getCurrentPlayer();

		socket.emit('newRound', gameState);

		io.to(nextPlayer.socketId).emit('yourTurn');
	});

	// Called whenever a player requests a new roll from the server
	socket.on('roll', function() {
		io.to(socket.id).emit('returnRoll', game.rollDice()); // Format is '56'
	});

	// Called whenever a player decides to lift on the former player
	socket.on('lift', function() {
		const gameState = game.endRound();

		const nextPlayer = game.getCurrentPlayer();

		socket.emit('newRound', gameState);
		io.to(nextPlayer.socketId).emit('yourTurn');
	});

	// Called whenever a player makes a new call
	// Game already knows from the previous roll, what was actually rolled
	socket.on('call', function(data) {
		const callingPlayer = game.players.filter(player => {
			return player.socketId === socket.id;
		});

		const nextPlayer = game.getCurrentPlayer();

		const newData = {
			lastRoll: data,
			playerName: callingPlayer.name
		};

		socket.emit('playerCalled', newData);
		io.to(nextPlayer.socketId).emit('yourTurn');
	});

	// Called whenever a player calls a lie
	socket.on('lie', function(data) {
		const callingPlayer = game.players.filter(player => {
			return player.socketId === socket.id;
		});

		const idiot = game.setLied(data);
		if (!idiot) {
			io.to(callingPlayer.socketId).emit('badLiar');
		} else {
			socket.emit('playerCalled', data);
			io.to(nextPlayer.socketId).emit('yourTurn');
		}
	});

	// Called whenever a player wishes to roll blindly and hope for a high enough roll
	socket.on('risk', function() {
		game.rollDice();
		game.nextPlayer();
		const nextPlayer = game.getCurrentPlayer();

		io.to(nextPlayer.socketId).emit('yourTurn', data);
	});
});
