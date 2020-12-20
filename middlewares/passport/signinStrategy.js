const LocalStrategy = require('passport-local').Strategy;
const User = require('../../models/User.model');
const SigninStrategy = new LocalStrategy({ session: false }, (username, password, done) => {
    User.findOne({ username: username }, function (err, user) {
        if (err) { return done(err); }
        if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
        }
        if (!user.authenticate(password)) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
    });
});

module.exports = SigninStrategy
