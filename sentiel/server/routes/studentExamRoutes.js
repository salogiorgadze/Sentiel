const express = require('express');

const protect = require('../middlewares/authMiddleware');

const {
  getMyExams,
  getMyExamResult,
} = require('../controllers/studentExamController');

const studentExamRouter = express.Router();

studentExamRouter.get('/', protect, getMyExams);

studentExamRouter.get('/:id/result', protect, getMyExamResult);

module.exports = studentExamRouter;