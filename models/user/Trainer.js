import User from './index.js';
import mongoose from 'mongoose';

const TrainerSchema = new mongoose.Schema({
  expertise: [String],
  availability: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  position: { type: String, enum: [], default: 'other' },
  bio: { type: String },
  isActive: { type: Boolean, default: true }
});

export default User.discriminator('trainer', TrainerSchema);
