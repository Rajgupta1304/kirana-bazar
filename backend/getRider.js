import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import { connectDB } from './db/connect.js';

dotenv.config();

async function run() {
  await connectDB();
  const rider = await User.findOne({ email: 'rider@kiranabazar.com' });
  console.log('RIDER:', rider);
  process.exit(0);
}
run();
