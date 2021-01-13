const Room = require("./Room");

class RoomManager {
  constructor() {
    if (!RoomManager.instance) {
      this.rooms = [];
      RoomManager.instance = this;
    }

    return RoomManager.instance;
  }

  createRoom() {
    let room = new Room(this.idGenerator());
    this.rooms.push(room);

    return room;
  }

  remove(roomId) {
    const index = this.rooms.indexOf(this.find(roomId));
    if (index > -1) {
      this.rooms.splice(index, 1)[0];
    }
  }

  find(roomId) {
    return this.rooms.find((room) => room.id === roomId);
  }

  idGenerator() {
    return Math.random().toString(36).substr(2, 9);
  }

  getAll() {
    return this.rooms.map((room) => room.toSimplePacket());
  }
}

const instance = new RoomManager();
Object.freeze(instance);

module.exports = instance;
