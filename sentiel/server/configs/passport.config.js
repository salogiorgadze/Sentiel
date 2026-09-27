const passport = require('passport');
const User = require('../models/user.model');
const GoogleStrategy = require('passport-google-oauth20');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback" // ბექენდის callback endpoint
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value;

            let user = await User.findOne({email});

            if(!user){
                user = await User.create({
                        fullname: profile.displayName,
                        email: email,
                    });
            };
            return done(null, user);
        } catch(err) {
            return done(err, null);
        };
    }
));

module.exports = passport;