module.exports = (function () {
    function Game(players) {
        this.log = [];
        this.players = players;
        this.currentPlayer = 0;
        this.score = [];
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
    Game.prototype.rollDice = function () {
        this.previousDice = this.playerLied ? this.liedDice : this.dice;
        this.playerLied = false;
        this.liedDice = '00';
        this.dice = this.sortDices(this.Random(), this.Random());
        return this.dice;
    };
    Game.prototype.sortDices = function (d1, d2) {
        if (d1 === d2)
            return '' + d1 + d2;
        if ((d1 === 2 || d1 === 3) && d2 === 1)
            return '' + d2 + d1;
        if (d1 === 1 && (d2 === 2 || d2 === 3))
            return '' + d1 + d2;
        if (d2 > d1)
            return '' + d2 + d1;
        return '' + d1 + d2;
    };
    Game.prototype.Random = function () {
        return Math.floor(Math.random() * 6) + 1;
    };
    Game.prototype.isHigher = function (dice) {
        return this.rules.indexOf(dice) <= this.rules.indexOf(this.previousDice);
    };
    Game.prototype.lift = function () {
        var lastPlayer = this.currentPlayer === 0
            ? this.players.length - 1
            : this.currentPlayer - 1;
        if (this.playerLied) {
            this.players[lastPlayer].decrementScore();
            return this.players[lastPlayer];
        }
        this.players[this.currentPlayer].decrementScore();
        return this.players[this.currentPlayer];
    };
    Game.prototype.endRound = function () {
        var lastRoundLoser = this.lift();
        var lostPlayers = this.checkScore();
        this.nextPlayer();
        this.resetForNextRound();
        return this.getGameState();
    };
    Game.prototype.resetForNextRound = function () {
        this.previousDice = '32';
        this.liedDice = '32';
        this.dice = '32';
        this.playerLied = false;
    };
    Game.prototype.checkScore = function () {
        var _this = this;
        var lostPlayers = this.players.map(function (player) {
            if (player.getScore() === 0) {
                _this.removePlayer(player);
                return player;
            }
        });
        return lostPlayers;
    };
    Game.prototype.removePlayer = function (player) {
        var toRmv = this.players.findIndex(function (_player) { return _player.socketId === player.socketId; });
        this.players[toRmv].lost = true;
        this.nextPlayer();
    };
    Game.prototype.nextPlayer = function () {
        this.currentPlayer++;
        if (this.currentPlayer > this.players.length - 1) {
            this.currentPlayer = 0;
        }
        console.log(this.players);
        if (this.players[this.currentPlayer].lost)
            this.nextPlayer();
    };
    Game.prototype.getCurrentPlayer = function () {
        return this.players[this.currentPlayer];
    };
    Game.prototype.setLied = function (liedDice) {
        if (!this.isHigher(liedDice)) {
            return false;
        }
        this.playerLied = true;
        this.liedDice = liedDice;
        this.nextPlayer();
        return true;
    };
    Game.prototype.getGameState = function () {
        var activePlayers = this.players.filter(function (player) { return player.lost == false; });
        console.log({ activePlayers: activePlayers });
        return { players: activePlayers };
    };
    return Game;
}());
