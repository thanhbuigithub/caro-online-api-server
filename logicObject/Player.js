const User = require("../models/User.model");
const playerManager = require("./PlayerManager");
const roomManager = require("./RoomManager");
const io = require("../socketio/SocketConnection").io();

class Player {
  constructor(socket) {
    this.socket = socket;
    this.id = null;
    this.user = null;
    this.room = null;
    this.disconnectTimeout = null;
  }

  socketHandler() {
    this.joinHandler();
    this.disconnectHandler();
    this.createRoomHandler();
    this.joinRoomHandler();
    this.sitHandler();
    this.standUpHandler();
    this.readyHandler();
    this.moveHandler();
    this.chatHandler();
  }

  joinHandler() {
    this.socket.on("join", async (idUser) => {
      this.id = idUser;
      if (playerManager.add(this)) {
        this.user = await User.findOne({ _id: idUser });
        console.log(`SocketIO: (join) ${this.id} ${playerManager.getAll()}`);
      }
      io.emit("new-connect", playerManager.getAll());
    });
  }

  disconnectHandler() {
    this.socket.on("disconnect", (reason) => {
      clearTimeout(this.disconnectTimeout);
      this.disconnectTimeout = null;
      this.disconnectTimeout = setTimeout(() => {
        playerManager.remove(this.id);
        io.emit("new-connect", playerManager.getAll());
        console.log(
          `SocketIO: (disconnect) ${this.id} ${playerManager.getAll()}`
        );
      }, 5000);
      console.log(reason);
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
        //this.socket.emit("sit-successful", sit);
        console.log(`Room: ${this.user.username} sit in ${this.room.id}`);
        io.to(this.room.id).emit("new-player-sit", sit);
      }
    });
  }

  standUpHandler() {
    this.socket.on("stand-up", () => {
      let standUp = this.room.playerStandUp(this);
      if (standUp) {
        //this.socket.emit("sit-successful", sit);
        console.log(`Room: ${this.user.username} stand up in ${this.room.id}`);
        io.to(this.room.id).emit("new-player-stand-up", standUp);
      }
    });
  }

  readyHandler() {
    this.socket.on("ready", () => {
      let ready = this.room.playerReady(this);
      if (ready) {
        //this.socket.emit("ready-successful");
        console.log(`Room: ${this.user.username} ready in ${this.room.id}`);
        io.to(this.room.id).emit("new-player-ready", ready);
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

  chatHandler() {
    this.socket.on("chat", (message) => {
      let chat = this.room.playerChat(this, message);
      if (chat) {
        //this.socket.emit("ready-successful");
        console.log(`Room: ${this.user.username} chat in ${this.room.id}`);
        io.to(this.room.id).emit("new-chat", this.room.chatHistory);
      }
    });
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
