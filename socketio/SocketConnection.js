const socketConnection = function socketConnection() {
  let io = null;

  this.init = function (server) {
    io = require("socket.io")(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
  };

  this.io = function () {
    return io;
  };
};

socketConnection._instance = null;

socketConnection.getInstance = function () {
  if (this._instance === null) {
    this._instance = new socketConnection();
  }
  return this._instance;
};

module.exports = socketConnection.getInstance();
