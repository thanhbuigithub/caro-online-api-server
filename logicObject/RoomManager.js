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

  removeRoom(roomId) {
    this.rooms = this.rooms.filter((room) => room.id === roomId);
  }

  find(roomId) {
    return this.rooms.find((room) => room.id === roomId);
  }

  idGenerator() {
    return Math.random().toString(36).substr(2, 9);
  }
}

const instance = new RoomManager();
Object.freeze(instance);

module.exports = instance;
