const express = require("express");
const router = express.Router();

const {
  readController,
  updateController,
  changePasswordController
} = require("../controllers/user.controller");

const {
  validatorChangePassword
} = require("../helpers/validator");

router.get("/profile", readController);
router.put("/update", updateController);
router.put("/change_password", validatorChangePassword, changePasswordController);

module.exports = router;
