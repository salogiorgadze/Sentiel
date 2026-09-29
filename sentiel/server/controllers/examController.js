const Exam = require("../models/Exam.model");
const ExamResult = require("../models/ExamResult.model");

// CREATE EXAM
const createExam = async (req, res) => {
  try {
    const {
      title,
      description,
      topics,
      date,
      students,
    } = req.body;

    if (!title || !date) {
      return res.status(400).json({
        message: "Title and date are required",
      });
    }

    const exam = await Exam.create({
      title,
      description,
      topics,
      date,
      students,
    });

    res.status(201).json({
      message: "Exam created successfully",
      exam,
    });
  } catch (err) {
    console.log("CREATE EXAM ERROR:", err);

    res.status(500).json({
      message: "Failed to create exam",
    });
  }
};

// GET ALL EXAMS
const getExams = async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate("students", "fullname email")
      .sort({ date: 1 });

    res.status(200).json(exams);
  } catch (err) {
    console.log("GET EXAMS ERROR:", err);

    res.status(500).json({
      message: "Failed to get exams",
    });
  }
};

// GET ONE EXAM
const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate("students", "fullname email");

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    res.status(200).json(exam);
  } catch (err) {
    console.log("GET EXAM ERROR:", err);

    res.status(500).json({
      message: "Failed to get exam",
    });
  }
};

// UPDATE EXAM
const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    res.status(200).json({
      message: "Exam updated successfully",
      exam,
    });
  } catch (err) {
    console.log("UPDATE EXAM ERROR:", err);

    res.status(500).json({
      message: "Failed to update exam",
    });
  }
};

// DELETE EXAM
const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    // გამოცდასთან დაკავშირებული შედეგებიც წავშალოთ
    await ExamResult.deleteMany({
      examId: req.params.id,
    });

    res.status(200).json({
      message: "Exam deleted successfully",
    });
  } catch (err) {
    console.log("DELETE EXAM ERROR:", err);

    res.status(500).json({
      message: "Failed to delete exam",
    });
  }
};

module.exports = {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
};