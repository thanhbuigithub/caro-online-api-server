const config = require("./config");
const Game = require("./Game");
const io = require("../socketio/SocketConnection").io();

class Room {
  constructor(id) {
    this.id = id;
    this.players = [];
    this.playerX = null;
    this.playerO = null;
    this.playerXReady = false;
    this.playerOReady = false;
    this.game = null;
    this.turnTimeLimit = config.TURN_TIME_LIMIT;
    this.state = config.GAME_STATE.UNREADY;
    this.chatHistory = [];
  }

  playerJoin(player) {
    if (!this.players.includes(player)) this.players.push(player);
  }

  playerSit(player) {
    if (this.playerX === null) {
      this.playerX = player;
      return {
        at: config.PLAYER_X,
        player: player.toPacket(),
      };
    }

    if (this.playerO === null) {
      this.playerO = player;
      return {
        at: config.PLAYER_O,
        player: player.toPacket(),
      };
    }

    return false;
  }

  playerStandUp(player) {
    if (this.playerX === player) {
      this.playerXReady = false;
      this.playerX = null;
      return player.toPacket();
    }

    if (this.playerO === player) {
      this.playerOReady = false;
      this.playerO = null;
      this.checkGameReady();
      return player.toPacket();
    }

    return false;
  }

  playerReady(player) {
    if (this.playerX === player) {
      this.playerXReady = true;
      this.checkGameReady();
      return player.toPacket();
    }

    if (this.playerO === player) {
      this.playerOReady = true;
      this.checkGameReady();
      return player.toPacket();
    }

    return false;
  }

  playerChat(player, message) {
    const chat = {
      sender: player.toPacket(),
      message: message,
    };
    this.chatHistory.push(chat);
    if (this.isStarted()) {
      this.game.chatHistory.push(chat);
    }
    return chat;
  }

  startGame() {
    if (this.state === config.GAME_STATE.UNREADY) {
      this.emitStartGame();
      this.state = config.GAME_STATE.STARTED;
      this.game = new Game(this);
      this.game.start();
    }
  }

  onGameOver() {
    this.state = config.GAME_STATE.UNREADY;
    this.playerXReady = false;
    this.playerOReady = false;
    if (!this.playerX.socket.connected) {
      this.remove(this.playerX.id);
      io.to(this.id).emit("new-player-stand-up", this.playerX.toPacket());
      this.playerX = null;
    }
    if (!this.playerO.socket.connected) {
      this.remove(this.playerO.id);
      io.to(this.id).emit("new-player-stand-up", this.playerO.toPacket());
      this.playerO = null;
    }
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
      turnTimeLimit: this.turnTimeLimit,
      chatHistory: this.chatHistory,
    };
  }

  remove(playerId) {
    const index = this.players.indexOf(this.find(playerId));
    if (index > -1) {
      const player = this.players.splice(index, 1);
    }
  }

  find(playerId) {
    return this.players.find((player) => player.id === playerId);
  }

  emitNewMove(move) {
    //console.log(`Game: ${this.user.username} move ${move.x}:${move.y}`);
    io.to(this.id).emit("new-move", move);
  }

  emitGameOver(winLine) {
    console.log(`Game: winLine: ${winLine}`);
    io.to(this.id).emit("game-over", winLine);
  }

  emitStartGame() {
    console.log(`Game: start-game`);
    io.to(this.id).emit("start-game");
  }
}

module.exports = Room;
