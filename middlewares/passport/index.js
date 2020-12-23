const passport = require('passport');
const SigninStrategy = require('./signinStrategy');
const SignupStrategy = require('./signupStrategy');
const JwtStrategy = require('./jwtStrategy');
const GoogleStrategy = require('./googleStratery');
const FacebookStrategy = require('./facebookStratery');

passport.use('signin-local', SigninStrategy);
passport.use('signup-local', SignupStrategy);
passport.use('jwt', JwtStrategy);
passport.use('google', GoogleStrategy);
passport.use('facebook', FacebookStrategy);
module.exports = passport;