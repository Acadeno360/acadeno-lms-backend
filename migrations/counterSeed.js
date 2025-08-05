// seedStudentCounter.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

// Define Counter schema (no need for separate file for a simple seed)
const counterSchema = new mongoose.Schema({
  model: { type: String, required: true, unique: true },
  count: { type: Number, default: 1000 },
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

export default async function  counterSeed(){
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');

    const existing = await Counter.findOne({ model: 'student' });

    if (existing) {
      console.log('⚠️ Student counter already exists:', existing.count);
    } else {
      const newCounter = await Counter.create({ model: 'student', count: 999 }); // So first becomes STD1000
      console.log('✅ Student counter created:', newCounter);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating student counter:', error);
    process.exit(1);
  }
};


