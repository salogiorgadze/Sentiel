const express = require("express");
const User = require("../models/user.model");
const protect = require("../middlewares/authMiddleware");
const adminOnly = require("../middlewares/adminMiddleware");
const StudentTask = require("../models/StudentTask.model");
const checkAchievements = require("../utils/checkAchievements");
const sendTaskEmail = require("../utils/sendTaskEmail");
const Notification = require("../models/Notification.model");

const adminRouter = express.Router();

adminRouter.get("/students", protect, adminOnly, async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
    }).select("-password");

    res.status(200).json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

adminRouter.get(
  "/students/:studentId",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const student = await User.findById(req.params.studentId).select(
        "-password",
      );

      if (!student) {
        return res.status(404).json({
          message: "Student not found",
        });
      }

      const tasks = await StudentTask.find({
        studentId: student._id,
      }).sort({ createdAt: -1 });

      res.status(200).json({
        student,
        tasks,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
);

adminRouter.post(
  "/students/:studentId/tasks",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const { studentId } = req.params;

      const { title, description, priority, deadline, note } = req.body;

      const student = await User.findById(studentId);

      if (!student) {
        return res.status(404).json({
          message: "Student not found",
        });
      }

      const task = await StudentTask.create({
        studentId,
        title,
        description,
        priority,
        deadline,
        note,
      });

      await Notification.create({
        userId: studentId,
        title: "New task assigned",
        message: `You have a new task: ${title}`,
        type: "task",
      });

      await sendTaskEmail(student, task);

      res.status(201).json({
        message: "Task created successfully",
        task,
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
);

adminRouter.patch(
  "/tasks/:taskId/complete",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const task = await StudentTask.findById(req.params.taskId);

      if (!task) {
        return res.status(404).json({
          message: "Task not found",
        });
      }

      task.status = "completed";

      await task.save();

      await checkAchievements(task.studentId);

      res.status(200).json({
        message: "Task marked as completed",
        task,
      });
    } catch (err) {
      console.error("COMPLETE TASK ERROR:", err);

      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
);

module.exports = adminRouter;
