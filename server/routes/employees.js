import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';

const router = express.Router();

// GET /api/employees
router.get('/', async (req, res) => {
  try {
    const employees = await User.find({}).sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/employees (add employee)
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const newId = `emp_${Date.now()}`;

    const employee = new User({
      id: newId,
      name: data.name,
      email: data.email,
      password: data.password || 'emp123',
      role: data.role || 'employee',
      phone: data.phone || '',
      location: data.location || '',
      language: data.language !== undefined && data.language !== null && String(data.language).trim() !== '' ? String(data.language).trim() : 'English',
      avatar: data.avatar || null,
    });

    await employee.save();
    res.status(201).json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/employees/:id (update employee)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.language !== undefined) {
      updates.language = String(updates.language).trim();
    } else if (updates.languages !== undefined) {
      updates.language = String(updates.languages).trim();
    }

    const queryConditions = [{ id: id }];
    if (mongoose.Types.ObjectId.isValid(id)) {
      queryConditions.push({ _id: new mongoose.Types.ObjectId(id) });
    }

    let employee = await User.findOneAndUpdate({ $or: queryConditions }, updates, { returnDocument: 'after', runValidators: true });

    if (!employee && updates.email) {
      employee = await User.findOneAndUpdate({ email: updates.email.toLowerCase().trim() }, updates, { returnDocument: 'after', runValidators: true });
    }

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/employees/:id (delete employee)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const queryConditions = [{ id: id }];
    if (mongoose.Types.ObjectId.isValid(id)) {
      queryConditions.push({ _id: new mongoose.Types.ObjectId(id) });
    }

    await User.deleteOne({ $or: queryConditions });
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
