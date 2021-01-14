const express = require("express");
const router = express.Router();

const {
  readController,
  updateController,
  changePasswordController,
  updateAvatarController,
  getAllGamesController,
  getAllGamesOfUserController,
} = require("../controllers/user.controller");

const {
  validatorChangePassword
} = require("../helpers/validator");

router.get("/profile", readController);
router.put("/update", updateController);
router.put("/change_password", validatorChangePassword, changePasswordController);
router.put("/updateAvatar", updateAvatarController);
// router.get("/games", getAllGamesController);
router.post("/games", getAllGamesOfUserController);
module.exports = router;
