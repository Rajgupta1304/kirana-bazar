import mongoose from 'mongoose';
import Order from './models/Order.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kiranabazar';

async function fixStatuses() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    const r1 = await Order.updateMany({ status: 'Received' }, { $set: { status: 'PENDING' } });
    const r2 = await Order.updateMany({ status: 'Packing' }, { $set: { status: 'PREPARING' } });
    const r3 = await Order.updateMany({ status: 'Out for Delivery' }, { $set: { status: 'OUT_FOR_DELIVERY' } });
    const r4 = await Order.updateMany({ status: 'Delivered' }, { $set: { status: 'DELIVERED' } });
    const r5 = await Order.updateMany({ status: 'Cancelled' }, { $set: { status: 'CANCELLED' } });
    
    console.log('Fixed old order statuses:', r1.modifiedCount + r2.modifiedCount + r3.modifiedCount + r4.modifiedCount + r5.modifiedCount);
    
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

fixStatuses();
