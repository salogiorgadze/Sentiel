const User = require("../models/user.model");
const studentProject = require("../models/studentProject.model");

const checkAchievements = async (studentId) => {
  try {
    const user = await User.findById(studentId);

    if (!user) {
      return;
    }

    const projects = await studentProject.find({ studentId: studentId });

    const totalXP = projects.reduce((sum, project) => sum + project.score, 0);

    const newAchievements = [];

    if (projects.length >= 1 && !user.achievements.includes("first-project")) {
      newAchievements.push("first-project");
    }

    const hasCoolScore = projects.some((project) => project.score === 100);

    if (hasCoolScore && !user.achievements.includes("perfect-score")) {
      newAchievements.push("perfect-score");
    }

    // 500 XP
    if (totalXP >= 500 && !user.achievements.includes("500-xp")) {
      newAchievements.push("500-xp");
    }

    if (newAchievements.length > 0) {
      user.achievements.push(...newAchievements);

      await user.save();

      console.log(`New achievements for ${user.fullname}:`, newAchievements);
    }
  } catch (err) {
    console.error(err);
  }
};


module.exports = checkAchievements;