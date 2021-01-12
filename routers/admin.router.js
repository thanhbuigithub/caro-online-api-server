const express = require("express");
const router = express.Router();

const {
  readController,
  updateController,
  changePasswordController,
  updateAvatarController,
  getAllUsersController,
  disableUsersController,
  enableUsersController
} = require("../controllers/admin.controller");

const {
  validatorChangePassword
} = require("../helpers/validator");

router.get("/profile", readController);
router.put("/update", updateController);
router.put("/change_password", validatorChangePassword, changePasswordController);
router.put("/updateAvatar", updateAvatarController);
router.get("/users", getAllUsersController);
router.put("/disable", disableUsersController);
router.put("/enable", enableUsersController);
module.exports = router;
