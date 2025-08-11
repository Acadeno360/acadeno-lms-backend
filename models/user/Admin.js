import mongoose from 'mongoose';
import User from './index.js';

const AdminSchema = new mongoose.Schema({
  privileges: [{ type: String }], // e.g., ["full_access", "manage_courses", "manage_payments"]
  isSuperAdmin: { type: Boolean, default: false }
});

export default User.discriminator('admin', AdminSchema);
