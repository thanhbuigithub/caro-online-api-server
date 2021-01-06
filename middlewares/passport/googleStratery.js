const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const configAuth = require('../../configs/auth');
const User = require('../../models/User.model');

module.exports = new GoogleStrategy({
    clientID: configAuth.googleAuth.clientID,
    clientSecret: configAuth.googleAuth.clientSecret,
    callbackURL: configAuth.googleAuth.callbackURL,
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
    // const user = await User.findOne({ email: profile.emails[0].value }, function (err, user) {
    //     if (err)

    //     if (user) return done(null, user);
    //     const newUser = new User({
    //         username: profile.emails[0].value,
    //         name: profile.displayName,
    //         email: profile.emails[0].value,
    //         password: token,
    //     });
    //     newUser.save(function (err) {
    //         if (err)
    //             throw err;
    //         return done(null, newUser);
    //     });
    // });


});
