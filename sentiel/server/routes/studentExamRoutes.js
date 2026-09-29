const express = require("express");
const protect = require("../middlewares/authMiddleware");
const {
  getMyExams,
  startExam,
  submitExam,
} = require("../controllers/studentExamController");

const studentExamRouter = express.Router();

studentExamRouter.get("/", protect, getMyExams);
studentExamRouter.post("/:id/start", protect, startExam);
studentExamRouter.post("/:id/submit", protect, submitExam);

module.exports = studentExamRouter;