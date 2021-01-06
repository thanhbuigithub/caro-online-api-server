const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require('mongoose');
const connectDB = require("./configs/database");
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const crypto = require('crypto');
const path = require("path");
// CONFIG .env
require("dotenv").config();
const passport = require('./middlewares/passport');

// Import Routers
const authRouter = require("./routers/auth.router");
const userRouter = require("./routers/user.router");
const imageRouter = require("./routers/image.router");
// Connect to mongo DB
connectDB();



//Passport initialize
app.use(passport.initialize());

//Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors());

// if (process.env.NODE_ENV === "development") {
//   app.use(cors({ origin: process.env.CLIENT_URL }));
//   app.use(morgan("dev"));
// }


const storage = new GridFsStorage({
  url: process.env.MONGODB_URL,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = req.body.caption + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  },
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
});

const upload = multer({ storage });
app.use('/api/image', imageRouter(upload));

app.get("/", (req, res) => {
  res.send("Repo for Caro Online Web App");
});


// Route Middleware

app.use("/api/user", authRouter);
app.use('/api/user', passport.authenticate('jwt', { session: false }), userRouter);

//Page not found
app.use((req, res) => {
  res.status(404).json({ message: "Page Not Found" });
});

// Run app
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server is running in port ${PORT}!`);
});

const socketConnection = require("./socketio/SocketConnection");
socketConnection.init(server);

const io = socketConnection.io();

const Player = require("./logicObject/Player");

io.on("connection", (socket) => {
  console.log("SocketIO: (connection)");
  const player = new Player(socket);
  player.socketHandler();

  // socket.on("join", async (idUser) => {
  //   socket.user = await User.findOne({ _id: idUser });
  //   listUserOnline.push(socket.id, socket.user.id);
  //   io.emit("new_connect", listUserOnline.getAll());
  // });

  // socket.on("disconnect", () => {
  //   listUserOnline.remove(socket.id);
  //   io.emit("new_connect", listUserOnline.getAll());
  // });

  // socket.on("join-room", (roomId) => {
  //   console.log(`Room: ${socket.username} Join Room ${roomId}`);
  //   let room = listRooms.addUser(roomId, socket.id);
  //   if (room) {
  //     console.log(`Room: ${socket.username} has joined to room ${roomId} `);
  //     socket.roomId = room.id;
  //     socket.join(room.id);
  //     socket.emit("join-room-successful", room.id);
  //     socket.to(socket.roomId).emit("new-player-join-room", socket.username);
  //   } else {
  //     socket.emit("join-room-failed");
  //   }
  // });

  // socket.on("create-room", () => {
  //   console.log(`Room: ${socket.username} Create Room...`);
  //   let room = listRooms.createRoom(socket.id);
  //   if (room) {
  //     socket.roomId = room.id;
  //     socket.join(room.id);
  //     socket.emit("create-room-successful", room.id);
  //   } else {
  //     socket.emit("create-room-failed");
  //   }
  // });

  // socket.on("move", (payload) => {
  //   console.log(`Move: ${socket.username} move...`);
  //   socket.to(socket.roomId).emit("move", payload);
  // });
});

