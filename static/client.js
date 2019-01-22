const socket = io('http://localhost:5000');
//Variables
const logTextarea = document.getElementById('logTextarea');
const die1Field = document.getElementById('1stDie');
const die2Field = document.getElementById('2ndDie');
const lie1Field = document.getElementById('1stLie');
const lie2Field = document.getElementById('2ndLie');
const logTextArea = document.getElementById('log');
const nameField = document.getElementById('nameField');
const playControls = Array.from(document.getElementsByClassName('playControls'));



socket.on('connect', () => {
	console.log('connected to server');
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
	$('#1stDie').show();
	$('#2ndDie').show();
	disablePlayControls();
	$('#startControls').hide();
});

socket.on('yourTurn', function(data) {
	log('Your turn');
	enablePlayControls();
	$('#1stDie').val('');
	$('#2ndDie').val('');
});

socket.on('newRound', function(data) {
	const scoreBoard = document.getElementById('scoreBoard');
	scoreBoard.value = 'The score is \n';
	for (const player of data.players) {
		scoreBoard.value += `${player.name} ${player.score}\n`;
	}
	// A new round is starting, and someone just lost.
	// Data should contain the entire gamestate
	// Update scoreboard
});

socket.on('badLiar', function() {
	log ('You lie must be larger than the score of the previous opponent')
	$('#lieButton').prop('disabled', false);
	$('#1stLie').prop('disabled', false);
	$('#2ndLie').prop('disabled', false);
	$('liftButton').prop('disabled', false);
});

socket.on('gameReady', function() {
	log('Game ready');
	console.log(startButton);
	$("#startButton").show();
});

socket.on('badCall', function() {
	log('You cannot call a score lower than the previous score');
	log('Lying or lifting are your only options');
	$('#lieButton').prop('disabled', false);
	$('#1stLie').prop('disabled', false);
	$('#2ndLie').prop('disabled', false);	
	$('#liftButton').prop('disabled', false);
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

$(document).ready(function() {
    $("#joinButton").click(function () {
        socket.emit('addPlayer', {name: $("#nameField").val()});
		$(".joinControls").hide();
	})
	
	$("#startButton").click (function (){
		socket.emit('start');
		//$(".playControls").style.visibility == 'visible';
	})
	
	$("#rollButton").click(function() {
        $("#rollButton").prop("disabled", true);
        $("liftButton").prop("disabled", true);
        socket.emit('roll');
	});

	$("#callButton").click(function() {
        const die1 = $("#1stDie").val();
        const die2 = $("#2ndDie").val();
        disablePlayControls();
        socket.emit('call', [die1, die2]);
	})
	
	$("#liftButton").click(function () {
        disablePlayControls();
        socket.emit('lift');
        endTurn();
	})
	
	$("#lieButton").click(function(){
		const lie1 = Math.floor($("#1stLie").val());
		const lie2 = Math.floor($("#2ndLie").val());
        if (lie1 <= 6 && lie1 >= 1 && lie2 <= 6 && lie2 >= 1) {
            socket.emit('lie', [lie1, lie2]);
            endTurn();
        } else {
            log('The values for the dice must be from 1 to 6');
        }
    })
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
