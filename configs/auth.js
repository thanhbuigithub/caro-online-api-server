module.exports = {
    'facebookAuth': {
        'clientID': '1003935410014964',
        'clientSecret': '43a4059c887c83114295229f470f4849',
        'callbackURL': `${process.env.CLIENT_URL}/auth/facebook/callback`
    },
    'googleAuth': {
        'clientID': '680152273728-k1h9qm9j2edslqr406k3pnglmb1f27ko.apps.googleusercontent.com',
        'clientSecret': '7bg9yyMgOvr_Z8Ucu_-zfFl5',
        'callbackURL': `${process.env.SERVER_URL}/api/user/auth/google/callback`
    }
};