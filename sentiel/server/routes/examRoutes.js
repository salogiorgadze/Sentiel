const express = require('express');

const protect = require('../middlewares/authMiddleware');
const adminOnly = require('../middlewares/adminMiddleware');

const {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
} = require('../controllers/examController');

const examRouter = express.Router();

examRouter.post('/', protect, adminOnly, createExam);
examRouter.get('/', protect, adminOnly, getExams);
examRouter.get('/:id', protect, adminOnly, getExamById);
examRouter.patch('/:id', protect, adminOnly, updateExam);
examRouter.delete('/:id', protect, adminOnly, deleteExam);

module.exports = examRouter;