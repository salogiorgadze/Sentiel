const express = require('express');

const Notification = require('../models/Notification.model');
const protect = require('../middlewares/authMiddleware');

const notificationRouter = express.Router();

notificationRouter.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (err) {
    console.error('GET NOTIFICATIONS ERROR:', err);

    res.status(500).json({
      message: 'Internal server error',
    });
  }
});

notificationRouter.patch('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
      },
      {
        isRead: true,
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found',
      });
    }

    res.status(200).json(notification);
  } catch (err) {
    console.error('READ NOTIFICATION ERROR:', err);

    res.status(500).json({
      message: 'Internal server error',
    });
  }
});

notificationRouter.patch('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      {
        userId: req.user.id,
        isRead: false,
      },
      {
        isRead: true,
      }
    );

    res.status(200).json({
      message: 'All notifications marked as read',
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: 'Internal server error',
    });
  }
});

module.exports = notificationRouter;