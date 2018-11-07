module.exports = class Game {
  constructor(players) {
    this.log = [];
    this.players = players;
    this.currentPlayer = 0;
    this.score = [];
    this.dice = '11';
    this.previousDice = '00';
    this.liedDice = -1;
    this.playerLied = false;
    this.rules = [
      '12',
      '13',
      '66',
      '55',
      '44',
      '33',
      '22',
      '11',
      '65',
      '64',
      '63',
      '62',
      '61',
      '54',
      '53',
      '52',
      '51',
      '43',
      '42',
      '41',
      '32'
    ];
  }

  rollDice() {
    this.previousDice = this.playerLied ? this.liedDice : this.dice;
    this.playerLied = false;
    this.dice = '' + this.Random() + this.Random();
    return this.dice;
  }
  Random() {
    return Math.floor(Math.random() * 6) + 1;
  }
  isHigher(dice) {
    return this.rules.indexOf(dice) < this.rules.indexOf(this.previousDice);
  }

  lift() {
    if (this.playerLied) {
      let lastPlayer =
        this.currentPlayer === 0
          ? this.players.length - 1
          : this.currentPlayer - 1;
      this.players[lastPlayer].decrementScore();
      return this.players[lastPlayer];
    }
    this.players[this.currentPlayer].decrementScore();
    return this.players[this.currentPlayer];
  }

  endRound() {
    const lastRoundLoser = this.lift();
    const lostPlayers = this.checkScore();
    this.nextPlayer();

    return { lostPlayers, lastRoundLoser };
  }

  checkScore() {
    const lostPlayers = this.players.map(player => {
      if (player.getScore() === 0) {
        this.removePlayer(player);
        return player;
      }
    });
    return lostPlayers;
  }

  removePlayer(player) {
    const toRmv = this.players.findIndex(
      _player => _player.socketId === player.socketId
    );
    this.players[toRmv].lost = true;
    this.currentPlayer =
      this.currentPlayer === 0 ? players.length - 1 : this.currentPlayer - 1;
  }

  nextPlayer() {
    this.currentPlayer++;
    if (this.currentPlayer > this.players.length - 1) {
      this.currentPlayer = 0;
    }
    if (this.players[this.currentPlayer].lost) this.nextPlayer();
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayer];
  }

  setLied(playerLied, liedDice) {
    this.playerLied = playerLied;
    this.liedDice = liedDice;
  }
};
