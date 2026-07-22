import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// GET /api/employees
router.get('/', async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' }).sort({ createdAt: -1 });
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
      role: 'employee',
      phone: data.phone || '',
      location: data.location || '',
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
    const updates = req.body;

    const employee = await User.findOneAndUpdate({ id }, updates, { new: true });
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
    await User.deleteOne({ id });
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
