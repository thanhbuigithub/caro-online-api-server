const FacebookStrategy = require('passport-facebook').Strategy;
const configAuth = require('../../configs/auth');
const User = require('../../models/User.model');

module.exports = new FacebookStrategy({
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL,
    profileFields: ['id', 'displayName', 'email', 'first_name', 'photos', 'last_name', 'middle_name']
}, async (token, refreshToken, profile, done) => {
    try {
        const user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
            return done(null, user);
        }
        const newUser = new User({
            username: profile.displayName,
            name: profile.displayName,
            email: profile.emails[0].value,
            password: token,
            avatarUrl: profile.photos[0].value
        });
        try {
            await newUser.save();
            return done(null, newUser);
        } catch (err) {
            return done(err);
        }
    } catch (error) {
        return done(error);
    }

});
