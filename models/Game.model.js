const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    playerX: { type: String, required: true },
    playerO: { type: String, required: true },
    winner: { type: String, required: true },
    history: { type: Array, required: true },
    chat: { type: Array, required: true },
  },
  { timeStamp: true }
);

module.exports = mongoose.model("Game", gameSchema);
