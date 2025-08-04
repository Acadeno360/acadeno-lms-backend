import mongoose from 'mongoose';


const options = { timestamps: true };

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['internship', 'course_project'], default: 'internship' },
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
