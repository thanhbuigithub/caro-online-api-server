module.exports = {
    'facebookAuth': {
        'clientID': process.env.FACEBOOK_CLIENT_ID,
        'clientSecret': process.env.FACEBOOK_CLIENT_SECRET,
        'callbackURL': `${process.env.SERVER_URL}/api/user/auth/facebook/callback`
    },
    'googleAuth': {
        'clientID': process.env.GOOGLE_CLIENT_ID,
        'clientSecret': process.env.GOOGLE_CLIENT_SECRET,
        'callbackURL': `${process.env.SERVER_URL}/api/user/auth/google/callback`
    }
};