class Timer {
  constructor(game) {
    this.currentTick = 0;
    this.interval = null;
    this.game = game;
  }

  start() {
    this.currentTick = 0;
    this.interval = setInterval(() => {
      this.currentTick++;
      this.game.doTick();
    }, 1000);
  }

  getCurrentTick() {
    return this.currentTick;
  }

  stop() {
    clearInterval(this.interval);
  }

  restart() {
    this.currentTick = 0;
  }
}

module.exports = Timer;
