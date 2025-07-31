import mongoose from 'mongoose';

const options = { discriminatorKey: 'role', timestamps: true };

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true }, // Sparse allows null for some roles
  password: { type: String }, // not required for parents without login
  phone: { type: String },
  profileImage: { type: String },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' }
}, options);

export default mongoose.model('User', UserSchema);
