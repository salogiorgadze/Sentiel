const Project = require('../models/Project.model');
const User = require('../models/user.model');

const createProject = async (req, res) => {

    try {
        const {name, description} = req.body;

        const newProject = new Project({name, description, owner: req.user.id, members: [req.user.id]});
        await newProject.save();

        return res.status(201).json({message: 'project created', project: newProject});
    } catch(err) {
        console.log(err);
        return res.status(500).json({message: 'invalid server'});
    };
};

const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({members: req.user.id});

        return res.status(200).json(projects);
    } catch(err) {
        console.log(err);
        return res.status(500).json({message: 'invalid server'});
    };
};

const addMember = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { email } = req.body; // იუზერს ვეძებთ იმეილით

        // 1. მოვძებნოთ მომხმარებელი ამ იმეილით
        const userToAdd = await User.findOne({ email: email.toLowerCase().trim() });
        if (!userToAdd) {
            return res.status(404).json({ message: 'User with this email not found' });
        }

        // 2. მოვძებნოთ პროექტი
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // 🛡️ 3. უსაფრთხოება: წევრის დამატება შეუძლია მხოლოდ პროექტის პატრონს (owner)
        if (project.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the project owner can add members' });
        }

        // 4. შევამოწმოთ, ხომ არ არის უკვე ეს იუზერი პროექტის წევრი
        if (project.members.includes(userToAdd._id)) {
            return res.status(400).json({ message: 'User is already a member of this project' });
        }

        // 5. ჩავამატოთ მასივში და შევინახოთ
        project.members.push(userToAdd._id);
        await project.save();

        return res.status(200).json({ message: 'Member added successfully', project });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'invalid server' });
    }
};

module.exports = {createProject, getProjects, addMember};