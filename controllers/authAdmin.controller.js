const User = require("../models/user.model");
const expressJwt = require("express-jwt");
const fetch = require("node-fetch");
const _ = require("lodash");
const { OAuth2Client } = require("google-auth-library");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { errorHandler } = require("../helpers/errorHandle");
const sgMail = require("@sendgrid/mail");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT);

exports.loginController = (req, res) => {
  const { username, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).send(firstError);
  } else {
    User.findOne({
      username,
    }).exec((err, user) => {
      if (err || !user) {
        return res.status(400).send("Username is wrong");
      }
      if (!user.authenticate(password)) {
        return res.status(400).send("Password is wrong");
      }

      if (!user.isAdmin) {
        return res.status(400).send("You don't have permission to login");
      }

      const token = jwt.sign(
        {
          _id: user._id,
          username: user.username,
        },
        process.env.SECRET_KEY,
        {
          expiresIn: "30d", // Remember me
        }
      );

      //const { _id, username, name, email, isAdmin } = user;
      return res.send(token);
    });
  }
};
