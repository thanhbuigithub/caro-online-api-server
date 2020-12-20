const LocalStrategy = require('passport-local').Strategy;
const User = require('../../models/User.model');
const SignupStrategy = new LocalStrategy({ passReqToCallback: true, session: false }, async (req, username, password, done) => {
    const { email, name } = req.body;
    const isUserEmailExist = await User.findOne({ email: email });
    if (isUserEmailExist) {
        return done(null, false, { message: "The Email already exists" })
    }

    const isUsernameExist = await User.findOne({ username: username });
    if (isUsernameExist) {
        return done(null, false, { message: "The Username already exists" })
    }
    else {
        const user = {
            username,
            email,
            name,
            password,
        };
        return done(null, user);
    }
});

module.exports = SignupStrategy
