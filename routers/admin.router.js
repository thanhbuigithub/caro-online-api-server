const express = require("express");
const router = express.Router();


const {
    requireAdmin,
} = require("../controllers/authUser.controller");

const { readController, updateController } = require("../controllers/user.controller");

const { loginController } = require("../controllers/authAdmin.controller");
const { validatorSignIn } = require("../helpers/validator");
const verifyToken = require("../helpers/verifyToken");

router.post("/login", validatorSignIn, loginController);

router.get("/profile",
    verifyToken,
    requireAdmin,
    readController
);


router.put(
    "/update",
    verifyToken,
    requireAdmin,
    updateController
);

module.exports = router;
