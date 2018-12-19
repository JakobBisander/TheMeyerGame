"use strict";
exports.__esModule = true;
var express = require("express");
var http = require("http");
var path = require("path");
var socketIO = require("socket.io");
var Player = require("./Player");
var Game = require("./Game");
var app = express();
var server = new http.Server(app);
var io = socketIO(server);
app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));
app.get('/', function (request, response) {
    response.sendFile(path.join(__dirname, '/index.html'));
});
server.listen(5000, function () {
    console.log('Starting server on port 5000 at ' + new Date().toLocaleString());
});
var players = [];
var game;
io.on('connection', function (socket) {
    socket.on('addPlayer', function (data) {
        var player = new Player(data.name, socket.id);
        console.log(player);
        players.push(player);
        io.emit('playerJoined', player);
        if (players.length >= 2) {
            io.emit('gameReady');
        }
    });
    socket.on('leave', function () {
        var leavingPlayer = game.players.find(function (player) {
            return player.socketId === socket.id;
        });
        game.removePlayer(leavingPlayer);
    });
    socket.on('disconnect', function () {
        if (game === undefined) {
            if (players.length !== 0) {
                for (var index = 0; index < players.length; index++) {
                    if (players[index].socketId === socket.id) {
                        players.splice(index, 1);
                    }
                }
            }
            socket.disconnect(true);
        }
        else {
            var disconnectingPlayer = game.players.find(function (player) {
                return player.socketId === socket.id;
            });
            game.removePlayer(disconnectingPlayer);
        }
    });
    socket.on('start', function () {
        game = new Game(players);
        var nextPlayer = game.getCurrentPlayer();
        io.emit('newRound', game.getGameState());
        io.emit('gameStarting');
        io.to(nextPlayer.socketId).emit('yourTurn');
    });
    socket.on('roll', function () {
        io.to(socket.id).emit('returnRoll', game.rollDice());
    });
    socket.on('lift', function () {
        var gameState = game.endRound();
        var nextPlayer = game.getCurrentPlayer();
        if (gameState.players.length == 1) {
            io.emit("gameEnded", gameState.players[0]);
        }
        else {
            io.emit('newRound', gameState);
            io.to(nextPlayer.socketId).emit('yourTurn');
        }
    });
    socket.on('call', function (data) {
        console.log(data);
        var callingPlayer = game.players.find(function (player) {
            return player.socketId === socket.id;
        });
        if (!game.isHigher(game.dice)) {
            io.to(callingPlayer.socketId).emit('invalidCall');
            return;
        }
        game.nextPlayer();
        var nextPlayer = game.getCurrentPlayer();
        var newData = {
            lastRoll: data,
            playerName: callingPlayer.name
        };
        io.emit('playerCalled', newData);
        console.log('Player called', newData);
        io.to(nextPlayer.socketId).emit('yourTurn');
    });
    socket.on('lie', function (data) {
        var callingPlayer = game.players.find(function (player) {
            return player.socketId === socket.id;
        });
        var idiot = game.setLied(data);
        console.log(idiot, data);
        if (!idiot) {
            io.to(callingPlayer.socketId).emit('badLiar');
        }
        else {
            var newData = {
                lastRoll: data,
                playerName: callingPlayer.name
            };
            io.emit('playerCalled', newData);
            var nextPlayer = game.getCurrentPlayer();
            io.to(nextPlayer.socketId).emit('yourTurn');
        }
    });
});
