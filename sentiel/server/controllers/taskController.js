const Project = require('../models/Project.model');
const Task = require('../models/Task.model');

const createTask = async (req, res) => {
    try {
        const {title, description, project} = req.body;

        const projectExists = await Project.findById(project);

        if(!projectExists){
            return res.status(404).json({
                message: 'not found'
            });
        };

        if(!projectExists.members.includes(req.user.id)) {
            return res.status(403).json({message: 'you are not a member of this project'});
        };

        const newTask = new Task({title, description, project, assignedTo: req.user.id});

        await newTask.save();
        return res.status(201).json({
            message: 'task created successfully',
            task: newTask
        });
    } catch(err) {
        console.log(err);
        return res.status(500).json({message: 'invalid server'});
    };
};

const getProjectTask = async (req, res) => {
    try {
        const {projectId} = req.params;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'project not found' });
        };
        if (!project.members.includes(req.user.id)) {
            return res.status(403).json({ message: 'you are not a member of this project' });
        };
        const tasks = await Task.find({ project: projectId });

        return res.status(200).json(tasks);
    } catch(err) {
        console.log(err);
        return res.status(500).json({message: 'invalid server'});
    };
};

const updateTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;

        // სტატუსის ვალიდაცია
        const allowedStatuses = ['todo', 'in-progress', 'review', 'done'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const project = await Project.findById(task.project);
        if (!project || !project.members.includes(req.user.id)) {
            return res.status(403).json({ message: 'You do not have permission to update this task' });
        }

        task.status = status;
        await task.save();

        return res.status(200).json({ message: 'Task status updated successfully', task });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'invalid server' });
    }
};

module.exports = { createTask, getProjectTask, updateTaskStatus };
