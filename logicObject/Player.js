const User = require("../models/user.model");
const playerManager = require("./PlayerManager");
const roomManager = require("./RoomManager");
const io = require("../socketio/SocketConnection").io();

class Player {
  constructor(socket) {
    this.socket = socket;
    this.id = null;
    this.user = null;
    this.room = null;
  }

  socketHandler() {
    this.joinHandler();
    this.disconnectHandler();
    this.createRoomHandler();
    this.joinRoomHandler();
    this.sitHandler();
    this.readyHandler();
    this.moveHandler();
  }

  joinHandler() {
    this.socket.on("join", async (idUser) => {
      this.id = idUser;
      this.user = await User.findOne({ _id: idUser });
      playerManager.add(this);
      io.emit("new-connect", playerManager.getAll());
      console.log(`SocketIO: (join) ${this.id} ${playerManager.getAll()}`);
    });
  }

  disconnectHandler() {
    this.socket.on("disconnect", () => {
      playerManager.remove(this.id);
      io.emit("new-connect", playerManager.getAll());
      console.log(
        `SocketIO: (disconnect) ${this.id} ${playerManager.getAll()}`
      );
    });
  }

  createRoomHandler() {
    this.socket.on("create-room", () => {
      console.log(`Room: ${this.user.username} Create Room...`);
      let room = roomManager.createRoom();
      if (room) {
        room.playerJoin(this);
        this.room = room;
        this.socket.join(room.id);
        this.socket.emit("create-room-successful", room.toPacket());
      } else {
        this.socket.emit("create-room-failed");
      }
    });
  }

  joinRoomHandler() {
    this.socket.on("join-room", (roomId) => {
      console.log(`Room: ${this.user.username} Join Room ${roomId}`);
      let room = roomManager.find(roomId);
      if (room) {
        room.playerJoin(this);
        console.log(
          `Room: ${this.user.username} has joined to room ${roomId} `
        );
        this.room = room;
        this.socket.join(room.id);
        this.socket.emit("join-room-successful", room.toPacket());
        this.socket
          .to(room.id)
          .emit("new-player-join-room", this.user.username);
      } else {
        this.socket.emit("join-room-failed");
      }
    });
  }

  sitHandler() {
    this.socket.on("sit", () => {
      let sit = this.room.playerSit(this);
      if (sit) {
        this.socket.emit("sit-successful", sit);
        console.log(`Room: ${this.user.username} sit in ${this.room.id}`);
        this.socket.to(this.room.id).emit("new-player-sit", this.user.username);
      }
    });
  }

  readyHandler() {
    this.socket.on("ready", () => {
      if (this.room.playerReady(this)) {
        this.socket.emit("ready-successful");
        console.log(`Room: ${this.user.username} ready in ${this.room.id}`);
        this.socket
          .to(this.room.id)
          .emit("new-player-ready", this.user.username);
      }
    });
  }

  moveHandler() {
    this.socket.on("move", ({ x, y }) => {
      const game = this.room.game;
      if (game !== null) {
        game.move(x, y, this);
      }
    });
  }

  emitNewMove(move) {
    console.log(`Game: ${this.user.username} move ${move.x}:${move.y}`);
    io.to(this.room.id).emit("new-move", move);
  }

  emitGameOver(winLine) {
    console.log(`Game: winLine: ${winLine}`);
    io.to(this.room.id).emit("game-over", winLine);
  }

  getUser() {
    return this.user;
  }

  toPacket() {
    return {
      id: this.id,
      username: this.user.username,
    };
  }
}

module.exports = Player;
