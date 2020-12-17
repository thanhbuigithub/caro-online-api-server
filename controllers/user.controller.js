const User = require("../models/user.model");

exports.readController = async (req, res) => {
    const id = req.user.id || req.user._id;
    const user = await User.findOne({ _id: id });
    const sender = { id: id, name: user.name, email: user.email };
    return res.status(200).send(sender);
    // const userId = req.user.id;
    // const user = await User.findById({ _id: userId });
    // if (user) {
    //     const sender = {
    //         id: user._id,
    //         name: user.name,
    //         email: user.email
    //     };
    //     return res.status(200).send(sender);
    // } else {
    //     return res.status(400).json({
    //         error: 'User not found'
    //     });
    // }
    // User.findById(userId).exec((err, user) => {
    //     if (err || !user) {
    //         return res.status(400).json({
    //             error: 'User not found'
    //         });
    //     }
    //     user.hashPassword = undefined;
    //     user.salt = undefined;
    //     res.json(user);
    // });
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