import Player = require("./Player");
class Game {
  players: Player[] = [];//cant be private because it is used by server2.ts
  private currentPlayer: number;
  dice: string;//cant be private because it is used by server2.ts
  private previousDice: string;
  private liedDice: string;
  private playerLied: boolean;
  private rules: string[];
  constructor(players: Player[]) {
    this.players = players;
    this.currentPlayer = 0;
    this.dice = '32';
    this.previousDice = '32';
    this.liedDice = '32';
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
    this.liedDice = '00';
    this.dice = this.sortDices(this.Random(), this.Random());
    return this.dice;
  }

  sortDices(d1: number, d2: number) {
    if (d1 === d2) return '' + d1 + d2;
    if ((d1 === 2 || d1 === 3) && d2 === 1) return '' + d2 + d1;
    if (d1 === 1 && (d2 === 2 || d2 === 3)) return '' + d1 + d2;
    if (d2 > d1) return '' + d2 + d1;
    return '' + d1 + d2;
  }

  Random() {
    return Math.floor(Math.random() * 6) + 1;
  }

  isHigher(dice: string) {
    return this.rules.indexOf(dice) <= this.rules.indexOf(this.previousDice);
  }

  lift() {
    let lastPlayer =
      this.currentPlayer === 0
        ? this.players.length - 1
        : this.currentPlayer - 1;
    if (this.playerLied) {
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
    this.resetForNextRound();
    return this.getGameState();//Returns players that are still alive.
  }
  resetForNextRound() {
    this.previousDice = '32';
    this.liedDice = '32';
    this.dice = '32';
    this.playerLied = false;
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

  removePlayer(player: Player) {
    const toRmv = this.players.findIndex(
      _player => _player.socketId === player.socketId
    );
    this.players[toRmv].lost = true;
    this.nextPlayer();
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

  setLied(liedDice: string) {
    if (!this.isHigher(liedDice)) {
      return false;
    }
    this.playerLied = true;
    this.liedDice = liedDice;
    this.nextPlayer();
    return true;
  }
  getGameState() {
    let activePlayers = this.players.filter(player => player.lost == false);
    return activePlayers;
  }
};
export = Game;