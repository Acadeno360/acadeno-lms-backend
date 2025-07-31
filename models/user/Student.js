import User from './index.js';
import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  isOffline: Boolean,
  guardian: {
    name: String,
    email: String,
    phone: String,
    relation: String
  },
  assignedTrainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  courseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  currentStatus: { type: String, enum: ['enrolled', 'paused', 'completed'] },
  resumeUrl: String
});

export default User.discriminator('student', StudentSchema);
