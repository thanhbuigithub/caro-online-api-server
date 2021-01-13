const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./configs/database");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const crypto = require("crypto");
const path = require("path");
// CONFIG .env
require("dotenv").config();
const passport = require("./middlewares/passport");
const passportAdmin = require("./middlewares/passportAdmin");
// Import Routers
const authRouter = require("./routers/auth.router");
const userRouter = require("./routers/user.router");
const authAdminRouter = require("./routers/authAdmin.router");
const adminRouter = require("./routers/admin.router");
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

app.get("/", (req, res) => {
  res.send("Repo for Caro Online Web App");
});

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
          bucketName: "uploads",
        };
        resolve(fileInfo);
      });
    });
  },
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
});

const upload = multer({ storage });
app.use("/api/image", imageRouter(upload));

// Route Middleware

app.use("/api/user", authRouter);
app.use(
  "/api/user",
  passport.authenticate("jwt", { session: false }),
  userRouter
);

app.use("/api/admin", authAdminRouter);
app.use(
  "/api/admin",
  passportAdmin.authenticate("jwt-admin", { session: false }),
  adminRouter
);

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
});
