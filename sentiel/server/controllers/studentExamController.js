const Exam = require('../models/Exam.model');
const ExamResult = require('../models/ExamResult.model');


const getMyExams = async (req, res) => {
  try {
    const exams = await Exam.find({
      students: req.user.id,
    })
      .sort({ date: 1 })
      .lean();

    const results = await ExamResult.find({
      studentId: req.user.id,
    }).lean();

    const resultByExam = new Map(
      results.map((result) => [String(result.examId), result])
    );

    const examsWithResults = exams.map((exam) => {
      const result = resultByExam.get(String(exam._id));

      return {
        ...exam,

        result: result
          ? {
              score: result.score,
              maxScore: result.maxScore,
              feedback: result.feedback,
              status: result.status,
            }
          : null,
      };
    });

    res.status(200).json(examsWithResults);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Failed to get exams',
    });
  }
};

const getMyExamResult = async (req, res) => {
  try {
    const result = await ExamResult.findOne({
      examId: req.params.id,
      studentId: req.user.id,
    }).populate('examId', 'title date topics');

    if (!result) {
      return res.status(404).json({
        message: 'Result not found',
      });
    }

    res.status(200).json(result);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: 'Failed to get exam result',
    });
  }
};

module.exports = {
  getMyExams,
  getMyExamResult,
};