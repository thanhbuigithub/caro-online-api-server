const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    playerX: {
      id: { type: String, required: true },
      username: { type: String, required: true },
    },
    playerO: {
      id: { type: String, required: true },
      username: { type: String, required: true },
    },
    history: [
      {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        chess: { type: Number, required: true },
      },
    ],
    chatHistory: [
      {
        sender: {
          id: { type: String, required: true },
          username: { type: String, required: true },
        },
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
