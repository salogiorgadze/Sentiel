const Exam = require("../models/Exam.model");
const ExamResult = require("../models/ExamResult.model");

const getDeadline = (exam, result) =>
  new Date(
    Math.min(
      exam.endDate.getTime(),
      result.startedAt.getTime() + exam.duration * 60000
    )
  );

const gradeResult = async (exam, result, submitted = []) => {
  const byId = new Map(
    (Array.isArray(submitted) ? submitted : []).map((a) => [
      String(a.questionId),
      a.answer,
    ])
  );

  let score = 0;

  result.answers = exam.questions.map((q) => {
    const answer = String(byId.get(String(q._id)) ?? "").trim();
    const isCorrect =
      answer !== "" &&
      answer.toLowerCase() === String(q.correctAnswer ?? "").trim().toLowerCase();
    const pointsAwarded = isCorrect ? q.points : 0;
    score += pointsAwarded;

    return { questionId: q._id, answer, isCorrect, pointsAwarded };
  });

  result.score = score;
  result.status = "graded";
  result.submittedAt = new Date();
  await result.save();

  return result;
};

// ჩემი გამოცდების სია
const getMyExams = async (req, res) => {
  try {
    const exams = await Exam.find({
      students: req.user.id,
      isPublished: true,
    })
      .select("title description topics startDate endDate duration maxScore")
      .sort({ startDate: -1 });

    const results = await ExamResult.find({
      studentId: req.user.id,
      examId: { $in: exams.map((e) => e._id) },
    }).select("examId status score");

    const resultByExam = new Map(results.map((r) => [String(r.examId), r]));

    res.status(200).json(
      exams.map((exam) => {
        const r = resultByExam.get(String(exam._id));
        return {
          ...exam.toObject(),
          resultStatus: r ? r.status : "not-started",
          score: r && r.status === "graded" ? r.score : null,
        };
      })
    );
  } catch (err) {
    console.log("GET MY EXAMS ERROR:", err);
    res.status(500).json({ message: "Failed to get exams" });
  }
};

// გამოცდის დაწყება (correctAnswer არ იგზავნება)
const startExam = async (req, res) => {
  try {
    const exam = await Exam.findOne({
      _id: req.params.id,
      students: req.user.id,
      isPublished: true,
    });

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const now = new Date();

    if (now < exam.startDate) {
      return res.status(403).json({ message: "Exam has not started yet" });
    }
    if (now > exam.endDate) {
      return res.status(403).json({ message: "Exam is closed" });
    }

    let result = await ExamResult.findOne({
      examId: exam._id,
      studentId: req.user.id,
    });

    if (result && result.status === "graded") {
      return res.status(400).json({ message: "You already submitted this exam" });
    }

    if (!result) {
      result = await ExamResult.create({
        examId: exam._id,
        studentId: req.user.id,
      });
    }

    const deadline = getDeadline(exam, result);

    if (now > deadline) {
      await gradeResult(exam, result, []);
      return res.status(403).json({ message: "Time is up" });
    }

    res.status(200).json({
      examId: exam._id,
      title: exam.title,
      deadline,
      questions: exam.questions.map((q) => ({
        _id: q._id,
        question: q.question,
        type: q.type,
        options: q.options,
        points: q.points,
      })),
    });
  } catch (err) {
    console.log("START EXAM ERROR:", err);
    res.status(500).json({ message: "Failed to start exam" });
  }
};

// პასუხების გაგზავნა: body { answers: [{ questionId, answer }] }
const submitExam = async (req, res) => {
  try {
    const exam = await Exam.findOne({
      _id: req.params.id,
      students: req.user.id,
      isPublished: true,
    });

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const result = await ExamResult.findOne({
      examId: exam._id,
      studentId: req.user.id,
    });

    if (!result) {
      return res.status(400).json({ message: "Exam was not started" });
    }
    if (result.status === "graded") {
      return res.status(400).json({ message: "You already submitted this exam" });
    }

    const late =
      new Date() > new Date(getDeadline(exam, result).getTime() + 30000);

    await gradeResult(exam, result, late ? [] : req.body.answers);

    res.status(200).json({
      message: late ? "Time was up, answers not counted" : "Exam submitted",
      score: result.score,
      maxScore: exam.maxScore,
    });
  } catch (err) {
    console.log("SUBMIT EXAM ERROR:", err);
    res.status(500).json({ message: "Failed to submit exam" });
  }
};

module.exports = { getMyExams, startExam, submitExam };