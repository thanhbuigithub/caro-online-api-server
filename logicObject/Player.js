const User = require("../models/User.model");
const playerManager = require("./PlayerManager");
const roomManager = require("./RoomManager");
const io = require("../socketio/SocketConnection").io();
const bcrypt = require("bcrypt");

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
    this.inviteHandler();
    this.acceptInviteHandler();
    this.leaveRoomHandler();
    this.playNowHandler();
    this.surrenderHandler();
    this.toDrawHandler();
    this.acceptDrawHandler();
    this.getDetailInfoHandler();
  }

  joinHandler() {
    this.socket.on("join", async (idUser) => {
      this.id = idUser;
      if (playerManager.add(this)) {
        this.user = await User.findOne({ _id: idUser });
        console.log(`SocketIO: (join) ${this.id} ${playerManager.getAll()}`);
      }

      const rankList = await User.find().sort({ elo: -1 }).limit(100);

      io.emit("new-connect", playerManager.getAll());
      this.socket.emit("new-room", roomManager.getAll());
      this.socket.emit(
        "new-rank-list",
        rankList.map((player) => {
          return {
            id: player._id,
            username: player.username,
            elo: player.elo,
            isUploadAvatar: player.isUploadAvatar,
          };
        })
      );
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
    this.socket.on("create-room", (turnTimeLimit, password) => {
      console.log(
        `Room: ${this.user.username} Create Room... with turnTimeLimit: ${turnTimeLimit} and password: ${password}`
      );
      if (turnTimeLimit > 0) {
        let room = roomManager.createRoom();
        room.playerJoin(this);
        room.playerSit(this);
        room.turnTimeLimit = turnTimeLimit;
        this.room = room;
        this.socket.join(room.id);

        if (password && password !== "") {
          room.password = password;
          const hash = bcrypt.hashSync(password, 10);
          this.socket.emit("create-room-successful", room.id, hash);
        } else {
          this.socket.emit("create-room-successful", room.id);
        }
        io.emit("new-room", roomManager.getAll());
      } else {
        this.socket.emit("create-room-failed");
      }
    });
  }

  joinRoomHandler() {
    this.socket.on("join-room", (roomId, password) => {
      console.log(
        `Room: ${this.user.username} Join Room ${roomId} wih password: ${password}`
      );
      let room = roomManager.find(roomId);
      if (
        room &&
        (room.password === null ||
          bcrypt.compareSync(room.password, password ? password : ""))
      ) {
        room.playerJoin(this);
        console.log(
          `Room: ${this.user.username} has joined to room ${roomId} `
        );
        this.room = room;
        this.socket.join(room.id);
        this.socket.emit("join-room-successful", room.toPacket());
        this.socket.to(room.id).emit(
          "new-player-join-room",
          this.room.players.map((player) => player.toPacket())
        );
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

  inviteHandler() {
    this.socket.on("invite", (playerId) => {
      let player = playerManager.find(playerId);
      if (player && player.socket.connected) {
        //this.socket.emit("ready-successful");
        console.log(
          `Room: ${this.user.username} invite in ${player.user.username}`
        );

        player.socket.emit("new-invite", {
          sender: this.toPacket(),
          roomId: this.room.id,
          password: this.room.password
            ? bcrypt.hashSync(this.room.password, 10)
            : null,
        });
      }
    });
  }

  acceptInviteHandler() {
    this.socket.on("accept-invite", (roomId) => {
      let room = roomManager.find(roomId);
      if (room) {
        room.playerJoin(this);
        console.log(
          `Room: ${this.user.username} has joined to room ${roomId} `
        );
        this.room = room;
        this.socket.join(room.id);
        this.socket.emit("join-room-successful", room.toPacket());
        this.socket.to(room.id).emit(
          "new-player-join-room",
          this.room.players.map((player) => player.toPacket())
        );

        let sit = room.playerSit(this);
        if (sit) {
          //this.socket.emit("sit-successful", sit);
          console.log(`Room: ${this.user.username} sit in ${room.id}`);
          io.to(room.id).emit("new-player-sit", sit);
        }
      } else {
        this.socket.emit("join-room-failed");
      }
    });
  }

  leaveRoomHandler() {
    this.socket.on("leave-room", () => {
      if (this.room !== null) {
        let leave = this.room.playerLeave(this);
        if (leave) {
          this.socket.to(this.room.id).emit(
            "new-player-join-room",
            this.room.players.map((player) => player.toPacket())
          );
          if (leave.isStandUp)
            io.to(this.room.id).emit("new-player-stand-up", this.toPacket());
          this.socket.leave(this.room.id);
          this.room = null;
        }
      }
    });
  }

  playNowHandler() {
    this.socket.on("play-now", () => {
      console.log(`Play Now: ${this.user.username} start finding match `);
      if (this.room === null) {
        playerManager.addToQuickMatch(this);
        const competitor = playerManager.matchingPlayers(this);
        if (competitor) {
          console.log(
            `Play Now: ${this.user.username} match with ${competitor.user.username} `
          );
          let room = roomManager.createRoom();
          competitor.socket.emit("new-invite", {
            sender: this.toPacket(),
            roomId: room.id,
          });
          this.socket.emit("new-invite", {
            sender: competitor.toPacket(),
            roomId: room.id,
          });
        }
      }
    });
  }

  surrenderHandler() {
    this.socket.on("surrender", () => {
      if (this.room !== null) {
        if (this.room.playerSurrender(this)) {
          io.to(this.room.id).emit("new-surrender", this.toPacket());
        }
      }
    });
  }

  toDrawHandler() {
    this.socket.on("to-draw", () => {
      if (this.room !== null && this.room.isStarted()) {
        if (this === this.room.playerX && this.room.playerO.socket.connected) {
          this.room.playerO.socket.emit("draw-request", this.toPacket());
        } else if (
          this === this.room.playerO &&
          this.room.playerX.socket.connected
        ) {
          this.room.playerX.socket.emit("draw-request", this.toPacket());
        }
      }
    });
  }

  acceptDrawHandler() {
    this.socket.on("accept-draw", () => {
      if (this.room !== null && this.room.isStarted()) {
        if (this === this.room.playerX || this === this.room.playerO) {
          this.room.game.draw();
        }
      }
    });
  }

  getDetailInfoHandler() {
    this.socket.on("detail-player", async (id) => {
      const detailPlayer = await User.findById(id);
      const player = {
        id: detailPlayer._id,
        name: detailPlayer.name,
        username: detailPlayer.username,
        elo: detailPlayer.elo,
        numOfMatches: detailPlayer.numOfMatches,
        winMatches: detailPlayer.winMatches,
      };
      if (detailPlayer) {
        this.socket.emit("open-detail-dialog", player);
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
      elo: this.user.elo,
      numOfMatches: this.user.numOfMatches,
      winMatches: this.user.winMatches,
      isUploadAvatar: this.user.isUploadAvatar,
    };
  }

  async updateElo(elo, isWon) {
    this.user = await User.findOne({ _id: this.id });
    this.user.elo += elo;
    if (this.user.elo < 0) {
      this.user.elo = 0;
    }

    if (isWon) {
      this.user.winMatches += 1;
    }
    await this.user.save();
  }

  async updateMatch() {
    this.user = await User.findOne({ _id: this.id });
    this.user.numOfMatches += 1;
    await this.user.save();
  }
}

module.exports = Player;
