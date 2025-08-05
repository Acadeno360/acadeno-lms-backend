// models/Counter.js
import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  model: { type: String, required: true, unique: true },
  count: { type: Number, default: 1000 },
});

export default mongoose.models.Counter || mongoose.model('Counter', counterSchema);
