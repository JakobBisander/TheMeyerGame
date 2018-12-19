module.exports = class Player {
  constructor(name, socketId) {
    this.name = name;
    this.socketId = socketId;
    this.score = 6;
    this.lost = false;
  }

  decrementScore() {
    this.score--;
  }
  getScore() {
    return this.score;
  }
};
