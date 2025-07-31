import User from './index.js';
import mongoose from 'mongoose';

const TrainerSchema = new mongoose.Schema({
  expertise: [String],
  courseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  availability: [{
    day: String, // e.g., "Monday"
    startTime: String,
    endTime: String
  }],
  bio: { type: String },
  isActive: { type: Boolean, default: true }
});

export default User.discriminator('trainer', TrainerSchema);
