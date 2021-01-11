const passport = require('passport');
const SigninStrategy = require('./signinStrategy');
const SignupStrategy = require('./signupStrategy');
const JwtStrategy = require('./jwtStrategy');

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

passport.use('signin-local-admin', SigninStrategy);
passport.use('signup-local-admin', SignupStrategy);
passport.use('jwt-admin', JwtStrategy);
module.exports = passport;