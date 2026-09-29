const Exam = require("../models/Exam.model");
const ExamResult = require("../models/ExamResult.model");

const validateExam = ({ startDate, endDate, questions }) => {
  if (new Date(endDate) <= new Date(startDate)) {
    return "End date must be after start date";
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    return "Add at least one question";
  }

  for (const [i, q] of questions.entries()) {
    if (q.type === "multiple-choice") {
      if (!q.options || q.options.length < 2) {
        return `Question ${i + 1}: add at least 2 options`;
      }
      if (!q.options.includes(q.correctAnswer)) {
        return `Question ${i + 1}: correct answer must be one of the options`;
      }
    }
  }

  return null;
};

const createExam = async (req, res) => {
  try {
    const {
      title, description, topics, startDate, endDate,
      duration, students, questions, isPublished,
    } = req.body;

    const validationError = validateExam({ startDate, endDate, questions });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    // maxScore სერვერზე ითვლება კითხვების ქულებიდან
    const maxScore = questions.reduce(
      (sum, q) => sum + (Number(q.points) || 0),
      0
    );

    const exam = await Exam.create({
      title, description, topics, startDate, endDate,
      duration, maxScore, students, questions,
      isPublished: Boolean(isPublished),
    });

    res.status(201).json({ message: "Exam created successfully", exam });
  } catch (err) {
    console.log("CREATE EXAM ERROR:", err);
    res.status(500).json({ message: "Failed to create exam" });
  }
};

// ადმინისთვის: გამოცდის შედეგები
const getExamResults = async (req, res) => {
  try {
    const results = await ExamResult.find({ examId: req.params.id })
      .populate("studentId", "fullname email")
      .sort({ score: -1 });

    res.status(200).json(results);
  } catch (err) {
    console.log("GET RESULTS ERROR:", err);
    res.status(500).json({ message: "Failed to get results" });
  }
};

// GET ALL EXAMS
const getExams = async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate("students", "fullname email");

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