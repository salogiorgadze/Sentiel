const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    profilePicture: {
      type: String,
      default: ''
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    password: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: "student",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationCode: {
      type: Number,
    },

    verificationCodeExpires: {
      type: Date,
    },
    achievements: {
      type: [String],
      default: []
    }
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return; // თუ არ შეცვლილა გადავიდეს შემდეგ ნაბიჯზე;

  try {
    this.password = await bcrypt.hash(this.password, 10);
    // hashირების შემდეგ გადავიდეს შენახვაზე
  } catch (err) {
    throw err;
  }
});

userSchema.methods.comparePassword = async function (candidatePass) {
  // candidatePass არის userის მიერ შეყვანილი pass loginის დროს, this.password hashed pass
  return await bcrypt.compare(candidatePass, this.password);
};

module.exports = mongoose.model("User", userSchema);
