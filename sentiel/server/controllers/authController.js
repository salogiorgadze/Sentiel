const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const disposableDomains = require("disposable-email-domains");
const passport = require("passport");


const sendMail = require("../utils/mailer");


const registerUser = async (req, res) => {

    try {
        const { fullname, email, password } = req.body;


        const isExist = await User.findOne({ email });

        if (isExist) {
            return res.status(400).json({
                message: "user already exists"
            });
        }

        const emailDomain = email.split("@")[1].toLowerCase();

        const isDisponsable = disposableDomains.some(
            (domain) =>
                emailDomain === domain ||
                emailDomain.endsWith("." + domain)
        );

        if (isDisponsable) {
            return res.status(400).json({
                message: "email can't be used"
            });
        }

        const verificationCode =
            Math.floor(100000 + Math.random() * 900000);

        const newUser = new User({
            fullname,
            email,
            password,
            isVerified: false,
            verificationCode,
            verificationCodeExpires: Date.now() + 15 * 60 * 1000,
        });

        await newUser.save();
        try {
            await sendMail({
                to: email,
                subject: "Verification code",
                html: `
                    <h3>Hello ${fullname},</h3>
                    <p>Your Verification code: <b>${verificationCode}</b></p>
                `,
            });
        } catch (err) {
            console.error(err.message);
            await User.deleteOne({ _id: newUser._id });

            return res.status(500).json({
                message: "email sending failed"
            });
        }

return res.status(201).json({
    message: "User registered successfully",
});

    } catch (err) {
        return res.status(500).json({
            message: "invalid server"
        });
    }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "user not found",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email" });
    }

    // თუ user არსებობს ვადარებთ პაროლებს
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: "invalid email or password",
      });
    }

    // ვქმნით ტოკენს, რომელშიც ვფარავთ userის idს და როლს ბაზიდან
    const accessToken = jwt.sign(
      { id: user._id, role: user.role }, // payload რა მონაცემები ჩაიმალოს tokenში
      process.env.JWT_SECRET, // საიდუმლო გასაღები envდან
      { expiresIn: "15m" }, // ტოკენის არსებობის ხანგრძლივობა
    );

    res.cookie("token", accessToken, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 15 * 60 * 1000,
});

    return res.status(200).json({
      message: "login successfully",
      user: {
        id: user._id,
        role: user.role,
        fullname: user.fullname,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
});

  return res.status(200).json({ message: "logged out successfully" });
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    return res.status(200).json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "invalid server" });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }
    console.log("EMAIL:", email);
    console.log("DB CODE:", user.verificationCode);
    console.log("ENTERED CODE:", code);
    console.log("DB CODE TYPE:", typeof user.verificationCode);
    console.log("ENTERED CODE TYPE:", typeof code);
    console.log("EXPIRES:", user.verificationCodeExpires);
    console.log("NOW:", Date.now());
    if (
      user.verificationCode !== code ||
      user.verificationCodeExpires < Date.now()
    ) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification code" });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    return res.status(200).json({
      message: "Email verified successfully. You can now log in.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "invalid server" });
  }
};

const googleLogin = passport.authenticate("google", {
  scope: ["profile", "email"],
});

const googleAuthCallback = (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication failed"
            });
        }

        const accessToken = jwt.sign(
            {
                id: req.user._id,
                role: req.user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "15m"
            }
        );

        res.cookie("token", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 15 * 60 * 1000
        });

        if (req.user.role === "admin") {
            return res.redirect(
                `${process.env.FRONTEND_URL}/admin`
            );
        }

        return res.redirect(
            `${process.env.FRONTEND_URL}/dashboard`
        );

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: "invalid server"
        });
    }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  verifyEmail,
  googleLogin,
  googleAuthCallback,
};
