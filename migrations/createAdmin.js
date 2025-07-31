import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/user/index.js'

// const User = require('')

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
console.log(MONGODB_URI, 'UTI')

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');

    const existingAdmin = await User.findOne({ role: 'admin' });

    if (existingAdmin) {
      console.log('⚠️ Super admin already exists:', existingAdmin.email);
    } else {
      const hashedPassword = await bcrypt.hash('Admin@123', 10); // You can change this

      const superAdmin = await User.create({
        name: 'Super Admin',
        email: 'sarath@maitexa.in',
        password: hashedPassword,
        role: 'admin',
        // Add other fields like mobile, isVerified, etc. if required
      });

      console.log('✅ Super admin created successfully:', superAdmin.email);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    process.exit(1);
  }
};

createSuperAdmin();
