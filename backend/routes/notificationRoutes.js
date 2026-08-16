import express from 'express';
import Notification from '../models/Notification.js';
import { isMongoConnected } from '../db/connect.js';

const router = express.Router();
const memoryNotifications = [];

export const createNotification = async (userId, orderId, title, message) => {
  const notif = {
    userId,
    orderId,
    title,
    message,
    isRead: false,
    createdAt: new Date()
  };
  
  if (isMongoConnected) {
    try {
      await Notification.create(notif);
    } catch(err) {
      console.error('Failed to save notification', err);
    }
  } else {
    notif._id = Math.random().toString(36).substr(2, 9);
    memoryNotifications.unshift(notif);
  }
};

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    if (isMongoConnected) {
      const notifs = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
      return res.json(notifs);
    } else {
      const notifs = memoryNotifications.filter(n => n.userId === userId);
      return res.json(notifs);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', async (req, res) => {
  try {
    if (isMongoConnected) {
      const updated = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
      return res.json(updated);
    } else {
      const notif = memoryNotifications.find(n => n._id === req.params.id);
      if (notif) {
        notif.isRead = true;
        return res.json(notif);
      }
      return res.status(404).json({ error: 'Notification not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
