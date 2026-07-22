import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['admin', 'employee'] },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    avatar: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
