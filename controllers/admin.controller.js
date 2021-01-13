const User = require("../models/User.model");
const Game = require("../models/Game.model");
const { validationResult } = require("express-validator");

exports.readController = async (req, res) => {
  const id = req.user.id || req.user._id;
  const userFind = await User.findOne({ _id: id });
  const { _id, name, username, message, email, date } = userFind;
  const sender = {
    _id: _id,
    name: name,
    email: email,
    username: username,
    message: message,
    date: date,
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

exports.updateAvatarController = async (req, res) => {};

exports.getAllUsersController = async (req, res) => {
  try {
    const listUsers = await User.find(
      { isAdmin: false },
      {
        _id: 1,
        username: 1,
        isActive: 1,
        isAdmin: 1,
        username: 1,
        name: 1,
        email: 1,
        date: 1,
        isUploadAvatar: 1,
        numOfMatches: 1,
        winMatches: 1,
        elo: 1,
      }
    );
    res.status(200).send(listUsers);
  } catch (error) {
    res.status(400).send("Something is error !");
  }
};

exports.disableUsersController = async (req, res) => {
  try {
    const updateUser = await User.findOneAndUpdate(
      { _id: req.body._id },
      { isActive: false },
      {
        new: true,
      }
    );
    const modifyUser = {
      _id: updateUser._id,
      username: updateUser.username,
      isActive: updateUser.isActive,
      isAdmin: updateUser.isAdmin,
      name: updateUser.name,
      email: updateUser.email,
      date: updateUser.date,
      isUploadAvatar: updateUser.isUploadAvatar,
    };
    res.status(200).send(modifyUser);
  } catch (error) {
    res.status(400).send("Can not disable user!");
  }
};

exports.enableUsersController = async (req, res) => {
  try {
    const updateUser = await User.findOneAndUpdate(
      { _id: req.body._id },
      { isActive: true },
      {
        new: true,
      }
    );
    const modifyUser = {
      _id: updateUser._id,
      username: updateUser.username,
      isActive: updateUser.isActive,
      isAdmin: updateUser.isAdmin,
      name: updateUser.name,
      email: updateUser.email,
      date: updateUser.date,
      isUploadAvatar: updateUser.isUploadAvatar,
    };
    res.status(200).send(modifyUser);
  } catch (error) {
    res.status(400).send("Can not enable user!");
  }
};

exports.getAllGamesController = async (req, res) => {
  try {
    const games = await Game.find().sort({ _id: -1 }).populate("");
    res.status(200).send(games);
  } catch (error) {
    res.status(400).send("Something is error !");
  }
};

exports.getAllGamesOfUserController = async (req, res) => {
  try {
    const { userId } = req.body;
    const games = await Game.find({
      $or: [{ "playerX.id": userId }, { "playerO.id": userId }],
    }).sort({ _id: -1 });
    res.status(200).send(games);
  } catch (error) {
    res.status(400).send("Something is error !");
  }
};
