const express = require('express');
const protect = require('../middlewares/authMiddleware');
const { createTask, getProjectTask, updateTaskStatus } = require('../controllers/taskController');

const taskRouter = express.Router();

taskRouter.post('/create-task', protect, createTask);
taskRouter.get('/:projectId', protect, getProjectTask);
taskRouter.patch('/:taskId/status', protect, updateTaskStatus);

module.exports = taskRouter;