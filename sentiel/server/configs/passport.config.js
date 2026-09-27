const passport = require('passport');
const User = require('../models/user.model');
const GoogleStrategy = require('passport-google-oauth20');
const crypto = require('crypto');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`

},
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value;

            let user = await User.findOne({ email });

            if (!user) {
                user = await User.create({
                    fullname: profile.displayName,
                    email: email,
                    password: crypto.randomBytes(32).toString('hex')
                });
            }

            return done(null, user);

        } catch (err) {
            return done(err, null);
        }
    }
));

module.exports = passport;