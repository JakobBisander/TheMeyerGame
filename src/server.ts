// Dependencies
import express = require('express');
import http = require('http');
import path = require('path');
import socketIO = require('socket.io');
import Player = require("./Player");
import Game = require('./Game');
const app = express();
const server = new http.Server(app);
const io = socketIO(server);
app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));
// Routing
app.get('/', function (request, response) {
	response.sendFile(path.join(__dirname, '/index.html'));
});
// Starts the server.
server.listen(5000, function () {
	console.log('Starting server on port 5000 at ' + new Date().toLocaleString());
});

let players: Player[] = [];
let game: Game;

io.on('connection', function (socket) {
	socket.on('addPlayer', function (data) {
		const player = new Player(data.name, socket.id);
		console.log(player);


		players.push(player);
		io.emit('playerJoined', player);
		if (players.length >= 2) {
			io.emit('gameReady');
		}
	});

	// Called whenever a player willingly leaves
	socket.on('leave', function () {
		let leavingPlayer = game.players.find((player: Player) => {
			return player.socketId === socket.id;
		});

		game.removePlayer(leavingPlayer);
	});

	// Called whenever a player loses connection to the server
	socket.on('disconnect', function () {
		if (game === undefined) {
			// If the game has not yet started, the disconnecting player should only be removed from the players array
			if (players.length !== 0) {
				let index: number = game.players.findIndex((player: Player) => {
					return player.socketId === socket.id;
				});
				players.splice(index, 1);
			}
			socket.disconnect(true)
		} else {
			// If the game has started, the disconnecting player should be removed from the game instance
			const disconnectingPlayer = game.players.find((player: Player) => {
				return player.socketId === socket.id;
			});
			game.removePlayer(disconnectingPlayer);
		}
	});

	// Called whenever a player decides to start the game, with the currently connected players
	socket.on('start', function () {
		game = new Game(players);

		const nextPlayer = game.getCurrentPlayer();

		io.emit('newRound', game.getGameState());
		io.emit('gameStarting');
		// io.to(nextPlayer.socketId).emit('yourTurn');
		io.to(nextPlayer.socketId).emit('yourTurn');
	});

	// Called whenever a player requests a new roll from the server
	socket.on('roll', function () {
		io.to(socket.id).emit('returnRoll', game.rollDice()); // Format is '56'
	});

	// Called whenever a player decides to lift on the former player
	socket.on('lift', function () {
		let gameState: Player[];
		gameState = game.endRound();


		if (gameState.length === 1) {
			io.emit("gameEnded", gameState[0]);
		} else {
			let nextPlayer = game.getCurrentPlayer();
			io.emit('newRound', gameState);
			io.to(nextPlayer.socketId).emit('yourTurn');
		}
	});

	// Called whenever a player makes a new call
	// Game already knows from the previous roll, what was actually rolled
	socket.on('call', function (data) {
		let callingPlayer: Player = game.players.find((player: Player) => {
			return player.socketId === socket.id;
		});

		if (!game.isHigher(game.dice)) {
			io.to(callingPlayer.socketId).emit('invalidCall');
			return;
		}
		game.nextPlayer();
		let nextPlayer: Player = game.getCurrentPlayer();

		const newData = {
			lastRoll: data,
			playerName: callingPlayer.name
		};

		io.emit('playerCalled', newData);
		io.to(nextPlayer.socketId).emit('yourTurn');
	});

	// Called whenever a player calls a lie
	socket.on('lie', function (data) {
		let callingPlayer: Player = game.players.find((player: Player) => {
			return player.socketId === socket.id;
		});

		let idiot: boolean = game.setLied(data);//Checking for whether the lied value is higher than the previous dice.
		if (!idiot) {
			io.to(callingPlayer.socketId).emit('badLiar');
		} else {
			const newData = {
				lastRoll: data,
				playerName: callingPlayer.name
			};

			io.emit('playerCalled', newData);
			const nextPlayer = game.getCurrentPlayer();
			io.to(nextPlayer.socketId).emit('yourTurn');
		}
	});

	// Called whenever a player wishes to roll blindly and hope for a high enough roll
	// socket.on('risk', function() {
	// 	game.rollDice();
	// 	game.nextPlayer();
	// 	const nextPlayer = game.getCurrentPlayer();

	// 	io.to(nextPlayer.socketId).emit('yourTurn', data);
	// });
});
