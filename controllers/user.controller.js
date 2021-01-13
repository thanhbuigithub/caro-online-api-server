const User = require("../models/User.model");
const { validationResult } = require("express-validator");

exports.readController = async (req, res) => {
  const id = req.user.id || req.user._id;
  const userFind = await User.findOne({ _id: id });
  const {
    _id,
    name,
    username,
    message,
    email,
    elo,
    numOfMatches,
    winMatches,
    date,
    isAdmin,
    isUploadAvatar
  } = userFind;
  const sender = {
    _id: _id,
    name: name,
    email: email,
    username: username,
    message: message,
    date: date,
    elo: elo,
    numOfMatches: numOfMatches,
    winMatches: winMatches,
    isAdmin: isAdmin,
    isUploadAvatar: isUploadAvatar
  };
  return res.status(200).send(sender);
};

exports.updateController = async (req, res) => {
  const { newName, newEmail, newUserName } = req.body;
  const { username } = req.user;
  try {
    let userFind = await User.findOne({ username: username });
    if (!userFind) {
      return res.status(400).json({
        error: "Tài khoản không tìm thấy",
      });
    } else {
      userFind.username = newUserName;
      userFind.name = newName;
      userFind.email = newEmail;
      try {
        const saveUser = await userFind.save();
        return res.send(saveUser);
      } catch (err) {
        return res.status(400).json({
          error: err,
        });
      }
    }
  } catch (err) {
    return res.status(400).json({
      error: err,
    });
  }
};

exports.changePasswordController = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const id = req.user._id;
  const user = await User.findOne({ _id: id });

  const isPasswordValid = user.authenticate(oldPassword);
  if (!isPasswordValid) return res.status(400).send("Old password is wrong.");

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).send(firstError);
  } else {
    user.password = newPassword;
  }

  try {
    const response = await user.save();
    if (response) {
      console.log("Success");
      return res.status(200).send("Change password successfully");
    }
  } catch (error) {
    return res.status(400).send(error);
  }
  s;
};

exports.updateAvatarController = async (req, res) => { };
