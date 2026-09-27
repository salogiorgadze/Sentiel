const express = require('express');
const { createProject, getProjects, addMember } = require('../controllers/projectController');
const protect = require('../middlewares/authMiddleware');

const projectRouter = express.Router();

projectRouter.post('/create-project', protect, createProject);
projectRouter.get('/', protect, getProjects);
projectRouter.post('/:projectId/add-member', protect, addMember);

module.exports = projectRouter;