const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadPath = path.join(__dirname, '../uploads/profile');

if(!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, {
        recursive: true
    });
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath)
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);

        cb(null, `${req.user.id}-${Date.now()}${extension}`);
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image/')) {
        cb(null, true)
    } else {
        cb(new Error('Only image files are allowed'))
    }
};

const upload = multer({
    storage, fileFilter, limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = upload;