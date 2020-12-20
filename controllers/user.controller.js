const User = require("../models/User.model");
const { validationResult } = require("express-validator");


exports.readController = async (req, res) => {
    const id = req.user.id || req.user._id;
    const user = await User.findOne({ _id: id });
    const sender = { id: id, name: user.name, email: user.email };
    return res.status(200).send(sender);
};

exports.updateController = async (req, res) => {
    const { newName, newEmail, newPassword } = req.body;

    User.findOne({ _id: req.user._id }, (err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'Tài khoản không tìm thấy'
            });
        }
        if (newEmail) {
            if (user.email == newEmail) {
                return res.status(400).json({
                    message: 'Email is already exists',
                })
            } else {
                user.email = newEmail;
            }
        }

        if (!newName) {
            return res.status(400).json({
                error: 'Name không được để trống'
            });
        } else {
            user.name = newName;
        }

        if (newPassword) {
            if (newPassword.length < 8) {
                return res.status(400).json({
                    error: 'Mật khẩu chứa ít nhất 8 kí tự'
                });
            } else if (!newPassword.match(/\d/)) {
                return res.status(400).json({
                    error: 'Mật khẩu phải chứa ít nhất 1 số'
                })
            } else if (!newPassword.match(/^(?=.*[a-z])/)) {
                return res.status(400).json({
                    error: 'Mật khẩu phải chứa ít nhất 1 kí tự thường'
                })
            } else if (!newPassword.match(/^(?=.*[A-Z])/)) {
                return res.status(400).json({
                    error: 'Mật khẩu phải chứa ít nhất 1 kí tự hoa'
                })
            } else if (!newPassword.match(/^(?=.*[@$!%*#?&]).*$/)) {
                return res.status(400).json({
                    error: 'Mật khẩu phải chứa ít nhất 1 kí tự đặc biệt'
                })
            } else {
                user.password = newPassword;
            }
        }

        user.save((err, updatedUser) => {
            if (err) {
                return res.status(400).json({
                    error: 'Cập nhật thông tin không thành công'
                });
            }
            updatedUser.hashPassword = undefined;
            updatedUser.salt = undefined;
            return res.json({
                updatedUser
            });
        });
    });
};

exports.changePasswordController = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const id = req.user._id;
    const user = await User.findOne({ _id: id });

    const isPasswordValid = await user.authenticate(oldPassword);
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
            console.log('Success')
            return res.status(200).send("Change password successfully");
        }
    } catch (error) {
        return res.status(400).send(error);
    }
    // //Hash password
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(newPassword, salt);

    // User.updateOne({ _id: id }, { $set: { password: hashedPassword } }, function (
    //     err
    // ) {
    //     if (err) return res.status(400).send(err);
    //     return res.status(200).send("Change password successfully");
    // });
};
