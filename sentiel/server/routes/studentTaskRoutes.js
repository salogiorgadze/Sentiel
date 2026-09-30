const express = require('express');
const protect = require('../middlewares/authMiddleware');
const adminOnly = require('../middlewares/adminMiddleware');
const { getStudentTasks, createStudentTask, updateStudentTask, deleteStudentTask } = require('../controllers/studentTaskController');

const studentTaskRouter = express.Router();


studentTaskRouter.get(
  '/student/:studentId',
  protect,
  adminOnly,
  getStudentTasks
);

studentTaskRouter.post(
  '/student/:studentId',
  protect,
  adminOnly,
  createStudentTask
);

studentTaskRouter.patch(
  '/:taskId',
  protect,
  adminOnly,
  updateStudentTask
);

studentTaskRouter.delete(
  '/:taskId',
  protect,
  adminOnly,
  deleteStudentTask
);

module.exports = studentTaskRouter;