var socket = io('http://localhost:5000');
var logTextarea = document.getElementById('logTextarea');
var liftButton = document.getElementById('liftButton');
var rollButton = document.getElementById('rollButton');
var callButton = document.getElementById('callButton');
var lieButton = document.getElementById('lieButton');
var die1Field = document.getElementById('1stDie');
var die2Field = document.getElementById('2ndDie');
var lie1Field = document.getElementById('1stLie');
var lie2Field = document.getElementById('2ndLie');
var lieButton = document.getElementById('lieButton');
var logTextArea = document.getElementById('log');
var startButton = document.getElementById('startButton');
var joinButton = document.getElementById('joinButton');
var nameField = document.getElementById('nameField');
var scoreBoard = document.getElementById('scoreBoard');
var playControls = Array.from(document.getElementsByClassName('playControls'));
disablePlayControls();
socket.on('connect', function () {
    console.log('connected to server');
});
socket.on('playerCalled', function (data) {
    console.log({ data: data });
    var lastRoll = data.lastRoll, playerName = data.playerName;
    log(playerName + ' says ' + lastRoll[0] + ' and ' + lastRoll[1]);
});
socket.on('returnRoll', function (data) {
    console.log(data);
    die1Field.value = parseInt(data.charAt(0));
    die2Field.value = parseInt(data.charAt(1));
    log('You rolled ' + die1Field.value + ' ' + die2Field.value);
});
socket.on('playerJoined', function (data) {
    log(data.name + ' joined the game');
    console.log(data);
});
socket.on('gameStarting', function () {
    console.log('The game is starting');
    startButton.hidden = true;
    playControls.map(function (el) {
        el.hidden = false;
    });
    scoreBoard.hidden = false;
});
socket.on('yourTurn', function (data) {
    log('Your turn');
    enablePlayControls();
});
socket.on('gameEnded', function (data) {
    disablePlayControls();
    console.log("Game ended");
    alert('Game is over!\n' + data.name + " has won!");
});
socket.on('newRound', function (data) {
    scoreBoard.value = 'The score is \n';
    for (var _i = 0, _a = data.players; _i < _a.length; _i++) {
        var player = _a[_i];
        scoreBoard.value += player.name + " " + player.score + "\n";
    }
});
socket.on('invalidCall', function (data) {
    alert("Invalid call. If the roll you've made is lower than the previous roll, you'll have to lie." +
        "\nThis is because the developer didn't implement the risk-it feature yet.");
    lie1Field.disabled = false;
    lie2Field.disabled = false;
    lieButton.disabled = false;
});
socket.on('badLiar', function () {
});
socket.on('gameReady', function () {
    log('Game ready');
    console.log(startButton);
    startButton.hidden = false;
});
function endTurn() {
    playControls.map(function (el) { return el.setAttribute('disabled', true); });
}
function log(logString) {
    logTextArea.value += logString + '\n';
}
function disablePlayControls() {
    playControls.map(function (el) { return (el.disabled = true); });
}
function enablePlayControls() {
    playControls.map(function (el) { return (el.disabled = false); });
}
callButton.addEventListener('click', function () {
    var die1 = die1Field.value;
    var die2 = die2Field.value;
    disablePlayControls();
    socket.emit('call', [die1, die2]);
});
joinButton.addEventListener('click', function () {
    joinGame({ name: nameField.value });
    var startControls = Array.from(document.getElementsByClassName('startControls'));
    startControls.map(function (el) { return (el.style.visibility = 'hidden'); });
});
startButton.addEventListener('click', function () {
    socket.emit('start');
    var playcontrols = Array.from(document.getElementsByClassName('playControls'));
    playcontrols.map(function (el) { return (el.style.visbility = 'visible'); });
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
    rollButton.disabled = true;
    liftButton.disabled = true;
    getRoll();
});
lieButton.addEventListener('click', function () {
    var lie1 = Math.floor(lie1Field.value);
    var lie2 = Math.floor(lie2Field.value);
    if (lie1 <= 6 && lie1 >= 1 && lie2 <= 6 && lie2 >= 1) {
        sendLie(lie1, lie2);
        endTurn();
    }
    else {
        alert('The values for the dices must be from 1 to 6');
    }
});
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
