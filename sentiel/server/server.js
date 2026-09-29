const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

// გარემო ცვლადების ჩატვორთვა
dotenv.config();

const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const {Server} = require('socket.io');
const passport = require('passport');

// connectDB
const connectDB = require('./configs/mongo.config');
const authRouter = require('./routes/authRouter');
const projectRouter = require('./routes/projectRouter');
const taskRouter = require('./routes/taskRouter');
const adminRouter = require('./routes/adminRoutes');
const studentTaskRouter = require('./routes/studentTaskRoutes');
const studentRouter = require('./routes/studentRoutes');
const studentProjectRouter = require('./routes/studentProjectRoutes');
const notificationRouter = require('./routes/notificationRoutes');
const examRouter = require('./routes/examRoutes');
const studentExamRouter = require('./routes/studentExamRoutes');



const app = express();

require('./configs/passport.config');
app.use(passport.initialize());
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "https://sentiel-app.vercel.app",
        methods: ["GET", "POST", "PATCH"],
        credentials: true
    }
});

connectDB();

app.use(cors({
    origin: 'https://sentiel-app.vercel.app',
    credentials: true
}));

// JSON მონაცემების წაკითხვის middleware
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/admin', adminRouter);
app.use("/api/student-tasks", studentTaskRouter);
app.use('/api/student', studentRouter);
app.use('/api/student-projects', studentProjectRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/notifications', notificationRouter);
app.use("/api/exams", examRouter);
app.use('/api/student-exams', studentExamRouter);

app.get('/api/health', (req, res) => {
    res.json({status: 'ok', message: 'Santiel works'})
});

io.on('connection', (socket) => {
    console.log(`user connected in real time ${socket.id}`);

    socket.on('join_project', (projectId) => {
        socket.join(projectId);
        console.log(`socket ${socket.id} joined in room ${projectId}`)
    })

    socket.on('send_message', (data) => {
        // socket.broadcast.emit აგზავნის ყველასთან, გარდა თავად გამგზავნისა
        socket.to(data.projectId).emit('receive_message', {
            text: data.text,
            time: data.time,
            sender: 'Team Member'
        });
    });

    socket.on('disconnect', () => {
        console.log(`user disconnected ${socket.id}`);
    });
});

server.listen(PORT, () => {
    console.log(`Santiel core websocket on port ${PORT}`)
});