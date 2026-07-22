import express from 'express';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/notifications?userId=X&role=Y
router.get('/', async (req, res) => {
  try {
    const { userId, role } = req.query;

    const conditions = [{ recipientRole: 'all' }];

    if (role) {
      conditions.push({ recipientRole: role });
    }

    let userIdsToMatch = [];
    if (userId) {
      userIdsToMatch.push(userId);
      conditions.push({ recipientId: userId });

      // Lookup user to resolve both user.id and user.name
      const userObj = await User.findOne({
        $or: [{ id: userId }, { name: userId }, { email: userId }],
      }).lean();

      if (userObj) {
        if (userObj.id && !userIdsToMatch.includes(userObj.id)) {
          userIdsToMatch.push(userObj.id);
          conditions.push({ recipientId: userObj.id });
        }
        if (userObj.name && !userIdsToMatch.includes(userObj.name)) {
          userIdsToMatch.push(userObj.name);
          conditions.push({ recipientId: userObj.name });
        }
      }
    }

    const queryFilter = {
      $and: [
        { $or: conditions },
        { clearedBy: { $nin: userIdsToMatch } },
      ],
    };

    const notifications = await Notification.find(queryFilter)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', async (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const conditions = [{ recipientRole: 'all' }];
    if (role) conditions.push({ recipientRole: role });
    conditions.push({ recipientId: userId });

    const userObj = await User.findOne({
      $or: [{ id: userId }, { name: userId }],
    }).lean();

    if (userObj) {
      conditions.push({ recipientId: userObj.id });
      conditions.push({ recipientId: userObj.name });
    }

    await Notification.updateMany(
      { $or: conditions },
      { $addToSet: { readBy: userId } }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    await Notification.updateOne(
      { id },
      { $addToSet: { readBy: userId } }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/notifications/clear
router.delete('/clear', async (req, res) => {
  try {
    const { userId, role } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const conditions = [{ recipientRole: 'all' }];
    if (role) conditions.push({ recipientRole: role });
    conditions.push({ recipientId: userId });

    const userObj = await User.findOne({
      $or: [{ id: userId }, { name: userId }],
    }).lean();

    if (userObj) {
      conditions.push({ recipientId: userObj.id });
      conditions.push({ recipientId: userObj.name });
    }

    // Add userId to clearedBy so cleared items are hidden for this user
    await Notification.updateMany(
      { $or: conditions },
      { $addToSet: { clearedBy: userId } }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
