const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET_KEY;

module.exports = new JwtStrategy(opts, function (jwt_payload, done) {
    try {
        console.log('JwtStrategy', jwt_payload);
        return done(null, jwt_payload);
    } catch (error) {
        return done(error);
    }
});

