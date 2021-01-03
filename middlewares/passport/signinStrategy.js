const LocalStrategy = require('passport-local').Strategy;
const User = require('../../models/User.model');
const SigninStrategy = new LocalStrategy({ session: false }, (username, password, done) => {
    User.findOne({ username: username }, function (err, user) {
        if (err) { return done(err); }
        if (!user) {
            return done(null, false, { message: 'User not found.' });
        }
        if (!user.authenticate(password)) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user, { message: 'Logging Successfully.' });
    });
});

module.exports = SigninStrategy
