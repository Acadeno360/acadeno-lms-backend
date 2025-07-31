import mongoose from 'mongoose';


const options = { timestamps: true };

const courseSchema = new mongoose.Schema({
  tile: { type: String, required: true },
  type: { type: String }, // Sparse allows null for some roles
  createdBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }, 
  duration: {
    years: { type: Number },
    months: { type: Number },
    days: { type: Number },
  },
  fees: { type: Number },
  level: { type: String, enum: ['short-term', 'beginner', 'intermediate', 'expert'], default: 'other' },
  courseHead: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }, 
  isDeleted: { type: Boolean, default: false },
  status: { type: String, enum: [ 'active', 'inactive' ], default: 'active'}
}, options);

export default mongoose.model('Course', courseSchema);
