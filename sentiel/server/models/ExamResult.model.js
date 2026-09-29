const mongoose = require("mongoose");

const examResultSchema = new mongoose.Schema(
  {
    examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    answers: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        answer: { type: String, default: "" },
        isCorrect: { type: Boolean, default: false },
        pointsAwarded: { type: Number, default: 0 },
      },
    ],
    score: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["in-progress", "graded"],
      default: "in-progress",
    },
  },
  { timestamps: true }
);

// ერთ სტუდენტს ერთი გამოცდა მხოლოდ ერთხელ შეუძლია
examResultSchema.index({ examId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("ExamResult", examResultSchema);