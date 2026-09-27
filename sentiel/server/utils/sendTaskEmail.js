const transporter = require('../configs/email.config');

const sendTaskEmail = async (student, task) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: student.email,
        subject: 'You have a new task',
        html: `
            <div style="font-family: Arial, sans-serif;">
        <h2>You have a new task</h2>

        <p>Hello ${student.fullname},</p>

        <p>A new task has been assigned to you.</p>

        <h3>${task.title}</h3>

        <p>
          ${task.description || "No description provided."}
        </p>

        <p>
          <strong>Priority:</strong> ${task.priority}
        </p>

        ${
          task.deadline
            ? `<p><strong>Deadline:</strong> ${new Date(
                task.deadline
              ).toLocaleDateString()}</p>`
            : ""
        }

        ${
          task.note
            ? `<p><strong>Note:</strong> ${task.note}</p>`
            : ""
        }

        <p>Good luck! 🩷</p>
      </div>
        `
    });
};

module.exports = sendTaskEmail;