const User = require("../models/User.model");
const expressJwt = require("express-jwt");
const fetch = require("node-fetch");
const _ = require("lodash");
const { OAuth2Client } = require("google-auth-library");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { errorHandler } = require("../helpers/errorHandle");
const sgMail = require("@sendgrid/mail");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT);
const passport = require('passport');


exports.registerController = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).send(firstError);
  } else {
    passport.authenticate('signup-local-admin', {
      session: false
    }, (err, user, info) => {
      if (err) {
        return res.status(400).send(err);
      };
      if (!user) {
        return res.status(400).send(info.message)
      }
      else {
        const token = jwt.sign(user, process.env.JWT_USER_ACTIVE,
          { expiresIn: 3600 });

        const emailMessage = {
          from: process.env.MAIL_FROM,
          to: user.email,
          subject: "Email kích hoạt tài khoản",
          html: `<h1>Nhấn vào link bên dưới để kích hoạt tài khoản !!!</h1>
                  <p>${process.env.CLIENT_URL}/active/${token}</p>
                  <hr />`,
        };

        sgMail
          .send(emailMessage)
          .then((sent, error) => {
            if (sent) {
              return res.json({
                message: `Email kích hoạt tài khoản đã được gửi tới ${user.email}`,
              });
            } else {
              return res.status(400).json({
                success: false,
                error: errorHandler(error),
              });
            }
          })
      }
    })(req, res, next);
  };
};


exports.loginController = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).send(firstError);
  } else {
    passport.authenticate('signin-local-admin', {
      session: false
    }, (err, user, info) => {
      if (err) {
        return res.status(400).send(err)
      };
      if (!user) {
        return res.status(400).send(info.message)
      }
      const payload = {
        _id: user._id,
        isAdmin: user.isAdmin,
        name: user.name,
        username: user.username,
        message: info.message,
        email: user.email,
        date: user.date,
      };
      const token = jwt.sign(payload, process.env.SECRET_KEY);
      res.send(token);

    })(req, res, next);
  };
};

exports.requireAdmin = async (req, res, next) => {
  const user = await User.findById({ _id: req.user._id });
  if (user) {
    if (user.isAdmin === false) {
      return res.status(400).json({
        error: "Admin access denied.",
      });
    }
    req.profile = user;
    next();
  } else {
    return res.status(400).json({
      error: "User not found !",
    });
  }
};
