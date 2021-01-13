const config = require("./config");
const Game = require("./Game");
const io = require("../socketio/SocketConnection").io();
const playerManager = require("./PlayerManager");

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
    this.password = null;
  }

  playerJoin(player) {
    if (!this.players.includes(player)) this.players.push(player);
    if (this.removeTimeout) {
      clearTimeout(this.removeTimeout);
    }
    playerManager.removeFromQuickMatch(player.id);
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

  playerInvited(player) {
    this.playerJoin(player);
    this.playerSit(player);
  }

  playerLeave(player) {
    if (this.find(player.id)) {
      this.remove(player.id);
      if (this.state !== config.GAME_STATE.STARTED) this.playerStandUp(player);
      this.checkRoomEmpty();
      return {
        isStandUp: this.state !== config.GAME_STATE.STARTED,
      };
    }
    return false;
  }

  checkRoomEmpty() {
    if (this.players.length === 0) {
      this.removeTimeout = setTimeout(() => {
        console.log(`Room: ${this.id} be removed`);
        const roomManager = require("./RoomManager");
        roomManager.remove(this.id);
        this.emitNewRoom();
      }, 30 * 1000);
    }
  }

  startGame() {
    if (this.state === config.GAME_STATE.UNREADY) {
      this.emitStartGame();
      this.state = config.GAME_STATE.STARTED;
      this.game = new Game(this);
      this.game.start();

      this.emitNewRoom();
    }
  }

  onGameOver() {
    this.state = config.GAME_STATE.UNREADY;
    this.playerXReady = false;
    this.playerOReady = false;

    //Kiem tra mat ket noi
    if (!this.playerX.socket.connected || !this.find(this.playerX.id)) {
      this.remove(this.playerX.id);
      io.to(this.id).emit("new-player-stand-up", this.playerX.toPacket());
      this.playerX = null;
    }
    if (!this.playerO.socket.connected || !this.find(this.playerO.id)) {
      this.remove(this.playerO.id);
      io.to(this.id).emit("new-player-stand-up", this.playerO.toPacket());
      this.playerO = null;
    }

    this.emitNewRoom();
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

  playerSurrender(player) {
    if (this.isStarted()) {
      const chess = this.game.chess(player);
      if (chess !== null) {
        this.game.turn = chess.turn;
        this.game.onGameOver();
        return true;
      }
    }
    return false;
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

  emitGameOver(winner, winLine, playerX, playerO) {
    console.log(`Game: ${winner} ${playerX.elo} ${playerO.elo}`);
    io.to(this.id).emit("game-over", {
      winner: winner,
      winLine: winLine,
      playerX: playerX,
      playerO: playerO,
    });
  }

  emitStartGame() {
    console.log(`Game: start-game`);
    io.to(this.id).emit("start-game");
  }

  emitNewRoom() {
    const roomManager = require("./RoomManager");
    io.emit("new-room", roomManager.getAll());
  }

  toSimplePacket() {
    return {
      id: this.id,
      playerX: this.playerX !== null ? this.playerX.toPacket() : null,
      playerO: this.playerO !== null ? this.playerO.toPacket() : null,
      state: this.state,
      hasPassword: this.password !== null,
    };
  }
}

module.exports = Room;
