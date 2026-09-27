const StudentTask = require("../models/StudentTask.model");
const User = require("../models/user.model");

const getStudentTasks = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const tasks = await StudentTask.find({
      studentId,
    }).sort({ createdAt: -1 });

    return res.status(200).json(tasks);
  } catch (err) {
    console.log("GET STUDENT TASKS ERROR:", err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const createStudentTask = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { title, description, priority, note } = req.body;

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
      note,
    });

    return res.status(201).json(task);
  } catch (err) {
    console.log("CREATE STUDENT TASK ERROR:", err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateStudentTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await StudentTask.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const { title, description, status, priority, note } = req.body;

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.status = status ?? task.status;
    task.priority = priority ?? task.priority;
    task.note = note ?? task.note;

    await task.save();

    return res.status(200).json(task);
  } catch (err) {
    console.log("UPDATE STUDENT TASK ERROR:", err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// DELETE task
const deleteStudentTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await StudentTask.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    await task.deleteOne();

    return res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (err) {
    console.log("DELETE STUDENT TASK ERROR:", err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  getStudentTasks,
  createStudentTask,
  updateStudentTask,
  deleteStudentTask,
};