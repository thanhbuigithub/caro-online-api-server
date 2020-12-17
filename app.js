const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./configs/database");
const mongoose = require("mongoose");
const path = require("path");

// CONFIG .env
require("dotenv").config();

// Import Routers
const authRouter = require("./routers/auth.router");
const adminRouter = require("./routers/admin.router");

// Connect to mongo DB
connectDB();

//Middleware
app.use(bodyParser.json());
app.use(cors());

if (process.env.NODE_ENV === "development") {
  app.use(cors({ origin: process.env.CLIENT_URL }));
  app.use(morgan("dev"));
}

app.get("/", (req, res) => {
  res.send("Repo for Caro Online Web App");
});

// Route Middleware
app.use("/api/user", authRouter);
app.use("/api/admin", adminRouter);

//Page not found
app.use((req, res) => {
  res.status(404).json({ message: "Page Not Found" });
});

// Run app
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log("Server is running!");
});

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

//Socket IO
const listUserOnline = require("./object/listUserOnline");
const listRooms = require("./object/listRooms");

io.on("connection", (socket) => {
  socket.on("join", (username) => {
    socket.username = username;
    listUserOnline.push(socket.id, username);
    io.emit("new_connect", listUserOnline.getAll());
  });

  socket.on("disconnect", () => {
    listUserOnline.remove(socket.id);
    io.emit("new_connect", listUserOnline.getAll());
  });

  socket.on("join-room", (roomId) => {
    console.log(`Room: ${socket.username} Join Room ${roomId}`);
    let room = listRooms.addUser(roomId, socket.id);
    if (room) {
      console.log(`Room: ${socket.username} has joined to room ${roomId} `);
      socket.roomId = room.id;
      socket.join(room.id);
      socket.emit("join-room-successful", room.id);
      socket.to(socket.roomId).emit("new-player-join-room", socket.username);
    } else {
      socket.emit("join-room-failed");
    }
  });

  socket.on("create-room", () => {
    console.log(`Room: ${socket.username} Create Room...`);
    let room = listRooms.createRoom(socket.id);
    if (room) {
      socket.roomId = room.id;
      socket.join(room.id);
      socket.emit("create-room-successful", room.id);
    } else {
      socket.emit("create-room-failed");
    }
  });

  socket.on("move", (payload) => {
    console.log(`Move: ${socket.username} move...`);
    socket.to(socket.roomId).emit("move", payload);
  });
});
