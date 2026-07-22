import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';

import authRoutes from './routes/auth.js';
import leadRoutes from './routes/leads.js';
import employeeRoutes from './routes/employees.js';
import productRoutes from './routes/products.js';
import notificationRoutes from './routes/notifications.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/notifications', notificationRoutes);


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Start Server & Connect MongoDB
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`[Express Server] Server running on http://localhost:${PORT}`);
  });
};

startServer();
