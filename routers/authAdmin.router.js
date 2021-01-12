const express = require("express");
const router = express.Router();

const {
  registerController,
  loginController,
  activeUserController,
  forgotPasswordController,
  resetPasswordController,
} = require("../controllers/authAdmin.controller");

const {
  validatorSignUp,
  validatorSignIn,
  validatorForgotPassword,
  validatorResetPassword,
} = require("../helpers/validator");

router.post("/register", validatorSignUp, registerController);
router.post("/active", activeUserController);
router.post("/login", validatorSignIn, loginController);
router.post(
  "/forgot_password",
  validatorForgotPassword,
  forgotPasswordController
);
router.put(
  "/reset_password",
  validatorResetPassword,
  resetPasswordController
);

module.exports = router;
