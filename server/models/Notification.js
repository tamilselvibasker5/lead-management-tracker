import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['import', 'assignment', 'swap', 'general'],
      default: 'general',
    },
    // Scoping recipient
    recipientRole: { type: String, default: null }, // 'all', 'admin', 'employee', or null
    recipientId: { type: String, default: null },   // specific user ID or name, or null
    senderId: { type: String, default: null },
    senderName: { type: String, default: null },
    readBy: [{ type: String }],
    clearedBy: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
