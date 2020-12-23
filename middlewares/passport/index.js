const passport = require('passport');
const SigninStrategy = require('./signinStrategy');
const SignupStrategy = require('./signupStrategy');
const JwtStrategy = require('./jwtStrategy');
const GoogleStrategy = require('./googleStratery');

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

passport.use('signin-local', SigninStrategy);
passport.use('signup-local', SignupStrategy);
passport.use('jwt', JwtStrategy);
passport.use('google', GoogleStrategy);

module.exports = passport;