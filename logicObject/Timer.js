class Timer {
  constructor(game) {
    this.currentTick = game.room.turnTimeLimit;
    this.interval = null;
    this.game = game;
  }

  start() {
    this.currentTick = this.game.room.turnTimeLimit;
    this.interval = setInterval(() => {
      this.game.doTick();
      this.currentTick--;
    }, 1000);
  }

  getCurrentTick() {
    return this.currentTick;
  }

  stop() {
    clearInterval(this.interval);
  }

  restart() {
    this.currentTick = this.game.room.turnTimeLimit;
  }
}

module.exports = Timer;
