class Player {
  //wont do getters and setters for this.
  name: string;
  socketId: string;
  score: number;
  lost: boolean;
  constructor(name: string, socketId: string) {
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
export = Player;