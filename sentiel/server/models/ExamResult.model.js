const mongoose = require("mongoose");

const examResultSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    score: {
      type: Number,
      required: true,
    },

    maxScore: {
      type: Number,
      required: true,
    },

    feedback: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["passed", "failed"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

examResultSchema.index(
  { examId: 1, studentId: 1 },
  { unique: true }
);

module.exports = mongoose.model("ExamResult", examResultSchema);