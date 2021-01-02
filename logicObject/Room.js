const config = require("./config");
const Game = require("./Game");

class Room {
  constructor(id) {
    this.id = id;
    this.players = [];
    this.playerX = null;
    this.playerO = null;
    this.playerXReady = false;
    this.playerOReady = false;
    this.game = null;
    this.state = config.GAME_STATE.UNREADY;
    this.chatHistory = [];
  }

  playerJoin(player) {
    if (!this.players.includes(player)) this.players.push(player);
  }

  playerSit(player) {
    if (this.playerX === null) {
      this.playerX = player;
      return config.PLAYER_X;
    }

    if (this.playerO === null) {
      this.playerO = player;
      return config.PLAYER_O;
    }

    return false;
  }

  playerReady(player) {
    if (this.playerX === player) {
      this.playerXReady = true;
      this.checkGameReady();
      return true;
    }

    if (this.playerO === player) {
      this.playerOReady = true;
      this.checkGameReady();
      return true;
    }

    return false;
  }

  startGame() {
    if (this.state === config.GAME_STATE.UNREADY) {
      this.state = config.GAME_STATE.STARTED;
      this.game = new Game(this);
      this.game.start();
    }
  }

  onGameOver() {
    this.state = config.GAME_STATE.UNREADY;
    this.playerXReady = false;
    this.playerOReady = false;
  }

  checkGameReady() {
    if (
      this.playerX !== null &&
      this.playerO !== null &&
      this.playerXReady &&
      this.playerOReady
    ) {
      this.startGame();
      console.log("SocketIO: GAME IS STARTED!");
    }
  }

  isStarted() {
    return this.state === config.GAME_STATE.STARTED;
  }

  toPacket() {
    return {
      id: this.id,
      players: this.players.map((player) => player.toPacket()),
      playerX: this.playerX !== null ? this.playerX.toPacket() : null,
      playerO: this.playerO !== null ? this.playerO.toPacket() : null,
      playerXReady: this.playerXReady,
      playerOReady: this.playerOReady,
      game: this.game !== null ? this.game.toPacket() : null,
      state: this.state,
      chatHistory: this.chatHistory,
    };
  }
}

module.exports = Room;
