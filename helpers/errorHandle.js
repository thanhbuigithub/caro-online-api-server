"use strict"

const uniqueMessages = error => {
    let messages;
    try {
        let fieldName = error.message.split('.$')[1];
        field = field.split(" dub key")[0];
        field = field.substring(0, field.lastIndexOf('_'));
        req.flash('errors', [{
            message: "Tài khoản " + field + 'đã tồn tại',
        }])
        messages = fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' đã tồn tại';

    } catch (err) {
        messages = ' đã tồn tại';
    }
    return messages;
}

exports.errorHandler = error => {
    let message = '';
    if (error.code) {
        switch (error.code) {
            case 11000:
            case 11001:
                message = uniqueMessages(error);
                break;
            default:
                message = 'Liên kết đã được kích hoạt hoặc hết hạn'
        }
    } else {
        for (let errorName in error.errorors) {
            if (error.errorors[errorName].message) {
                message = error.errorors[errorName].message;
            }
        }
    }
    return message;
}