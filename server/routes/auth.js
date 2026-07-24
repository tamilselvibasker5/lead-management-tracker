import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json({ user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/profile
router.put('/profile', async (req, res) => {
  try {
    const { userId, name, email, location, language, currentPassword, newPassword } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const queryConditions = [{ id: userId }];
    if (mongoose.Types.ObjectId.isValid(userId)) {
      queryConditions.push({ _id: new mongoose.Types.ObjectId(userId) });
    }

    let user = await User.findOne({ $or: queryConditions });
    if (!user && email) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (newPassword) {
      if (currentPassword && user.password !== currentPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      user.password = newPassword;
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email.toLowerCase().trim();
    if (location !== undefined) user.location = location;
    if (language !== undefined) user.language = String(language).trim();

    await user.save();

    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json({ user: userWithoutPassword, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
