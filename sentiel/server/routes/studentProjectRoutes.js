const express = require('express');
const protect = require('../middlewares/authMiddleware');
const adminOnly = require('../middlewares/adminMiddleware');
const StudentProject = require('../models/studentProject.model');
const checkAchievements = require('../utils/checkAchievements');

const studentProjectRouter = express.Router();

studentProjectRouter.get(
  '/student/:studentId',
  protect,
  async (req, res) => {
    try {
      if (
        req.user.role !== 'admin' &&
        req.user.id !== req.params.studentId
      ) {
        return res.status(403).json({
          message: 'Access denied',
        });
      }

      const projects = await StudentProject.find({
        studentId: req.params.studentId,
      }).sort({ createdAt: -1 });

      res.status(200).json(projects);

    } catch (err) {
      console.error('GET PROJECTS ERROR:', err);

      res.status(500).json({
        message: 'Internal server error',
      });
    }
  }
);

studentProjectRouter.post('/student/:studentId', protect, adminOnly, async (req, res) => {
    try {
        const { studentId } = req.params;
      const { title, score } = req.body;

      const project = await StudentProject.create({
        studentId,
        title,
        score,
      });

      await checkAchievements(studentId);

      res.status(201).json({
        message: 'Project added successfully',
        project,
      });
    } catch(err) {
        console.error(err);
        res.status(500).json({
            message: 'Invalid server error'
        });
    };
});

studentProjectRouter.delete(
  '/:projectId',
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const project = await StudentProject.findById(
        req.params.projectId
      );

      if (!project) {
        return res.status(404).json({
          message: 'Project not found',
        });
      }

      await project.deleteOne();

      res.status(200).json({
        message: 'Project deleted successfully',
      });

    } catch (err) {
      console.error('DELETE PROJECT ERROR:', err);

      res.status(500).json({
        message: 'Internal server error',
      });
    }
  }
);

studentProjectRouter.get(
  '/ranking',
  protect,
  async (req, res) => {
    try {
      const ranking = await StudentProject.aggregate([
        {
          $group: {
            _id: '$studentId',
            xp: {
              $sum: '$score',
            },
          },
        },

        {
          $sort: {
            xp: -1,
          },
        },

        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'student',
          },
        },

        {
          $unwind: '$student',
        },

        {
          $match: {
            'student.role': 'student',
          },
        },

        {
          $project: {
            _id: '$student._id',
            fullname: '$student.fullname',
            email: '$student.email',
            xp: 1,
          },
        },
      ]);

      res.status(200).json(ranking);
    } catch (err) {
      console.error('GET RANKING ERROR:', err);

      res.status(500).json({
        message: 'Internal server error',
      });
    }
  }
);

module.exports = studentProjectRouter;