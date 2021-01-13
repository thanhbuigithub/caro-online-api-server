const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    playerX: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    playerO: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    history: [
      {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        chess: { type: Number, required: true },
      },
    ],
    chatHistory: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        message: { type: String, required: true },
      },
    ],
    winLine: [
      {
        x: { type: Number },
        y: { type: Number },
        chess: { type: Number },
      },
    ],
    winner: { type: Number },
  },
  { timeStamp: true }
);

module.exports = mongoose.model("Game", gameSchema);
