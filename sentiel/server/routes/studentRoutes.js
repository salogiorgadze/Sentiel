const express = require('express');

const studentTask = require('../models/StudentTask.model');
const protect = require('../middlewares/authMiddleware');

const studentRouter = express.Router();

studentRouter.get('/tasks', protect, async (req, res) => {
    try {
        const tasks = await studentTask.find({
            studentId: req.user.id
        }).sort({createdAt: -1});

        res.status(200).json(tasks);
    } catch(err) {
        console.error(err);
        res.status(500).json({
            message: 'Internal server error'
        });
    };
});

// studentRouter.patch('/tasks/:taskId/complete', protect, async (req, res) => {
//     try {
//         const task = await studentTask.findOne({
//             _id: req.params.taskId,
//             studentId: req.user.id
//         });

//         if(!task){
//             return res.status(404).json({
//                 message: 'Task not found'
//             });
//         };

//         task.status = 'completed';

//         await task.save();

//         res.status(200).json({
//             message: 'Task completed successfully',
//             task
//         });
//     } catch(err) {
//         console.error('PATCH ERROR:', err);
//         res.status(500).json({
//             message: 'Internal server error'
//         })
//     }
// })

module.exports = studentRouter;