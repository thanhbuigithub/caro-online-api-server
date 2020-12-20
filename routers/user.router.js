const express = require("express");
const router = express.Router();
const passport = require('../middlewares/passport');
const jwt = require("jsonwebtoken");

const {
  requireAdmin,
} = require("../controllers/authUser.controller");
const {
  readController,
  updateController,
} = require("../controllers/user.controller");

router.get("/profile", readController);
router.put(
  "/update",
  updateController
);


module.exports = router;
