const socket = io('http://localhost:5000');
//Variables
const logTextarea = document.getElementById('logTextarea');
const liftButton = document.getElementById('liftButton');
const rollButton = document.getElementById('rollButton');
const riskItButton = document.getElementById('riskItButton');
const lieButton = document.getElementById('lieButton');
const die1Field = document.getElementById('1stDie');
const die2Field = document.getElementById('2ndDie');
const lie1Field = document.getElementById('1stLie');
const lie2Field = document.getElementById('2ndLie');
const logTextArea = document.getElementById('log');
const startButton = document.getElementById('startButton'); 
const joinButton = document.getElementById('joinButton'); 
const nameField = document.getElementById('nameField');
const playControls = Array.from(document.getElementsByClassName('playControls')
);
socket.on('connect', () => {
  console.log('connected to server');
  //socket.emit('addPlayer', { name: 'Simon FizzKal Sinding' });
});
//  Listeners
socket.on('playerCalled', function(data) {
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
  die2Field.value = parseInt(data.charAt(0));
  logTextArea.value += 'You rolled ' + die1Field.value + ' ' + die2Field.value;
  // Display roll to player
});

socket.on('playerJoined', function(data) {
  log(data.name + ' joined the game');
  console.log(data);
  // Add data.name to log
});

socket.on('yourTurn', function(data) {
  const playcontrols = Array.from(
    document.getElementsByClassName('playControls')
  );
  playcontrols.map(function(el) {
    el.setAttribute('disabled', false);
  });
});

socket.on('newRound', function(data) {
  const scoreBoard = document.getElementById('scoreBoard');
  scoreBoard.value = 'The score is ';
  for (const player of data.players) {
    scoreBoard.value += `${player.name} ${player.score},`;
  }
  // A new round is starting, and someone just lost.
  // Data should contain the entire gamestate
  // Update scoreboard
});

socket.on('badLiar', function() {
  // The player tried to lie with a too low number
});
socket.on('gameReady',function(){
  startButton.style.visibility='visible';
});


function endTurn() {
  playControls.map(el => el.setAttribute('disabled', true));
}

function log(logString) {
logTextArea.value += logString + '\n';
}

joinButton.addEventListener('click', function() {
  joinGame({name: nameField.value});
  const startControls = Array.from(document.getElementsByClassName('startControls'));;
  startControls.map(el => el.style.visibility = 'hidden');
  
  
 });

 
startButton.addEventListener('click', function() {
 socket.emit('start');
 const playcontrols = Array.from(document.getElementsByClassName('playControls'));
  playcontrols.map(el => el.style.visbility = 'visible'); 
})

liftButton.addEventListener('click', function() {
  sendLift();
  endTurn();
});

joinButton.addEventListener('click', function() {
  if ( nameField.value === ""){
    alert("Name must be filled out");
    return false;
  }
});


rollButton.addEventListener('click', function() {
  getRoll();
});

riskItButton.addEventListener('click', function() {
  sendRisk();
  endTurn();
});

lieButton.addEventListener('click', function() {
  const lie1 = Math.floor(lie1Field.value);
  const lie2 = Math.floor(lie2Field.value);
  if (lie1 < 7 && lie1 > 0 && lie2 < 7 && lie2 > 0) {
    sendLie(lieField.value);
    endTurn();
  } else {
    logTextArea.value += 'The values for the dices must be from 1 to 6';
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
