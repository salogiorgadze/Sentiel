const express = require('express');
const { registerUser, loginUser, logoutUser, getMe, verifyEmail, googleAuthCallback } = require('../controllers/authController');
const protect = require('../middlewares/authMiddleware');
const passport = require('passport');
const upload = require('../configs/upload.config');
const User = require('../models/user.model');

const authRouter = express.Router();


authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.post('/logout', logoutUser);
authRouter.get('/me', protect, getMe);
authRouter.post('/verify-email', verifyEmail);
authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
authRouter.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate(
      'google',
      { session: false },
      (err, user, info) => {

        console.log("GOOGLE ERROR:", err);
        console.log("GOOGLE USER:", user);
        console.log("GOOGLE INFO:", info);

        if (err) {
          return next(err);
        }

        if (!user) {
          return res.status(401).json({
            message: "Google authentication failed",
            info
          });
        }

        req.user = user;
        next();
      }
    )(req, res, next);
  },
  googleAuthCallback
);
authRouter.patch(
  '/api/profile-picture',
  protect,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Profile picture is required",
        });
      }

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      user.profilePicture = `/uploads/profile/${req.file.filename}`;

      await user.save();

      res.status(200).json({
        message: "Profile picture updated",
        profilePicture: user.profilePicture,
      });
    } catch (err) {
      console.error("PROFILE PICTURE ERROR:", err);

      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);

module.exports = authRouter;
