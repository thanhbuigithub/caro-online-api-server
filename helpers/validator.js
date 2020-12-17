const { check } = require('express-validator');

exports.validatorSignUp = [
    check('name', 'Name không được rỗng !').notEmpty(),
    check('username', 'Username không được rỗng !').notEmpty(),
    check('email').isEmail().withMessage('Email phải hợp lệ !'),
    check('password', 'Mật khẩu không được rỗng !').notEmpty(),
    check('password').isLength({
        min: 8
    }).withMessage('Mật khẩu chứa ít nhất 8 kí tự').matches(/\d/).withMessage('Mật khẩu phải chứa ít nhất 1 số'),
    check('password').matches(/^(?=.*[a-z])/).withMessage('Mật khẩu phải chứa ít nhất 1 kí tự thường'),
    check('password').matches(/^(?=.*[A-Z])/).withMessage('Mật khẩu phải chứa ít nhất 1 kí tự hoa'),
    check('password').matches(/^(?=.*[@$!%*#?&]).*$/).withMessage('Mật khẩu phải chứa ít nhất 1 kí tự đặc biệt')
]

exports.validatorSignIn = [
    // check('email').isEmail().withMessage('Email phải hợp lệ !'),
    check('username', 'Username không được rỗng !').notEmpty(),
    check('password', 'Mật khẩu không được rỗng !').notEmpty(),
]

exports.validatorForgotPassword = [
    check('email').notEmpty().isEmail().withMessage('Email phải hợp lệ !')
];

exports.validatorResetPassword = [
    check('newPassWord').notEmpty().isLength({ min: 8 }).withMessage('Mật khẩu chứa ít nhất 8 kí tự'),
    check('newPassWord').matches(/\d/).withMessage('Mật khẩu phải chứa ít nhất 1 số'),
    check('newPassWord').matches(/^(?=.*[a-z])/).withMessage('Mật khẩu phải chứa ít nhất 1 kí tự thường'),
    check('newPassWord').matches(/^(?=.*[A-Z])/).withMessage('Mật khẩu phải chứa ít nhất 1 kí tự hoa'),
    check('newPassWord').matches(/^(?=.*[@$!%*#?&]).*$/).withMessage('Mật khẩu phải chứa ít nhất 1 kí tự đặc biệt')
];
