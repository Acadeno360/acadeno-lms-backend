import User from './index.js';
import mongoose from 'mongoose';

const ParentSchema = new mongoose.Schema({
  studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // references student documents
  relationship: { type: String }, // e.g., father, mother, guardian
  address: { type: String },
  canLogin: { type: Boolean, default: false } // determines if parent has login access
});

export default User.discriminator('parent', ParentSchema);
