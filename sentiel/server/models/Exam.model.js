const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    topics: {
      type: [String],
      default: [],
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    duration: {
      type: Number,
      required: true,
    },

    maxScore: {
      type: Number,
      default: 100,
    },

    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    questions: [
      {
        question: {
          type: String,
          required: true,
        },

        type: {
          type: String,
          enum: ["multiple-choice", "text"],
          default: "text",
        },

        options: {
          type: [String],
          default: [],
        },

        correctAnswer: {
          type: String,
        },

        points: {
          type: Number,
          default: 1,
        },
      },
    ],

    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Exam", examSchema);