import mongoose from 'mongoose';
import User from './index.js'; // Base user schema
import Counter from '../Counter.js';

const StudentSchema = new mongoose.Schema({
  studentId: { type: String, unique: true },
  isOnline: { type: Boolean, default: false },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTrainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  currentStatus: {
    type: String,
    enum: ['enrolled', 'paused', 'completed'],
    default: 'enrolled',
  },
  progress: { type: Number, default: 0 },
  attendance: { type: Number, default: 0 },
  fee: {
    total: { type: Number, default: 0 },
    paid: { type: Number, default: 0 },
  },
  joinDate: { type: Date, default: new Date() },
  resumeUrl: { type: String, default: null },
  address: {
    addressLine: { type: String },
    pin: { type: Number },
  },
  lastLogin: { type: Date, default: null },
  batchCode: { type: String, default: null },
});

// Add virtual for fee.pending
StudentSchema.virtual('fee.pending').get(function () {
  return this.fee.total - this.fee.paid;
});
StudentSchema.set('toJSON', { virtuals: true });
StudentSchema.set('toObject', { virtuals: true });

// Auto-generate studentId
StudentSchema.pre('save', async function (next) {
  if (this.isNew && !this.studentId) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { model: 'student' },
        { $inc: { count: 1 } },
        { new: true, upsert: true }
      );
      this.studentId = `STD${counter.count}`;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});


export default User.discriminator('student', StudentSchema);
