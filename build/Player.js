module.exports = (function () {
    function Player(name, socketId) {
        this.name = name;
        this.socketId = socketId;
        this.score = 6;
        this.lost = false;
    }
    Player.prototype.decrementScore = function () {
        this.score--;
    };
    Player.prototype.getScore = function () {
        return this.score;
    };
    return Player;
}());
