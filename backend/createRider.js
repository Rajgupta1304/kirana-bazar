import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import { connectDB } from './db/connect.js';

dotenv.config();

async function run() {
  await connectDB();
  const exists = await User.findOne({ phone: '+91 88888 77777' });
  if (!exists) {
    await User.create({
      id: 'usr_rider_1',
      name: 'Ramu Rider',
      email: 'rider@kiranabazar.com',
      phone: '+91 88888 77777',
      password: 'rider', // simple password for testing
      role: 'Delivery Partner',
      status: 'Active'
    });
    console.log('Created test rider user.');
  } else {
    console.log('Rider user already exists.');
  }
  process.exit(0);
}
run();
