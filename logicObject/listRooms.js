let list_rooms = [];

module.exports.createRoom = (idUser) => {
  var room = {
    id: idUser + Date.now().toString(),
    playerX: idUser,
    playerO: null,
  };
  list_rooms.push(room);
  return room;
};

module.exports.remove = (id) => {
  const index = list_rooms.findIndex((room) => room.id === id);

  if (index !== -1) {
    list_rooms.splice(index, 1);
  }
};

module.exports.getAll = () => {
  return list_rooms;
};

module.exports.getById = (id) => {
  const index = list_rooms.findIndex((room) => room.id === id);

  if (index !== -1) {
    return list_rooms[index];
  }
  return null;
};

module.exports.addUser = (idRoom, idUser) => {
  let room = this.getById(idRoom);
  console.log(room);
  if (room !== null && room.playerO === null) {
    room.playerO = idUser;
    return room;
  }
  return false;
};
