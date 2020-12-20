const passport = require('passport');
const SigninStrategy = require('./signinStrategy');
const SignupStrategy = require('./signupStrategy');
const JwtStrategy = require('./jwtStrategy');

passport.use('signin-local', SigninStrategy);
passport.use('signup-local', SignupStrategy);
passport.use('jwt', JwtStrategy);

module.exports = passport;