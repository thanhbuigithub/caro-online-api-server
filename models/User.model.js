const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    hashPassword: {
      type: String,
      required: true,
    },
    salt: String,
    resetPassWordLink: {
      data: String,
      default: "",
    },
    // avatarUrl: String,
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    elo: {
      type: Number,
      default: 1000,
    },
    numOfMatches: {
      type: Number,
      default: 0,
    },
    winMatches: {
      type: Number,
      default: 0,
    },
    isAdmin: {
      // False :User ; True : Admin
      type: Boolean,
      default: false,
    },
    isActive: {
      // False :Denied ; True : Access
      type: Boolean,
      default: true,
    },
    isUploadAvatar: {
      type: Boolean,
      default: false,
    },
  },
  { timeStamp: true }
);

userSchema
  .virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashPassword = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

userSchema.methods = {
  //Tao Salt
  makeSalt: () => {
    return Math.round(new Date().valueOf() * Math.random()) + "";
  },

  // Encypt mat khau
  encryptPassword: function (password) {
    if (!password) return "";
    try {
      return crypto
        .createHmac("sha1", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },

  //Compare password
  authenticate: function (authPassword) {
    return this.encryptPassword(authPassword) === this.hashPassword;
  },
};

module.exports = mongoose.model("User", userSchema);
