import mongoose from 'mongoose';
import Order from './models/Order.js';
import Product from './models/Product.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kiranabazar';

async function fixDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');
    
    // Set all products to shop_1
    const pRes = await Product.updateMany({ shopkeeperId: { $exists: false } }, { $set: { shopkeeperId: 'shop_1' } });
    await Product.updateMany({ shopkeeperId: '' }, { $set: { shopkeeperId: 'shop_1' } });
    console.log('Updated products:', pRes.modifiedCount);

    // Set all orders to shop_1
    const oRes = await Order.updateMany({ shopkeeperId: { $exists: false } }, { $set: { shopkeeperId: 'shop_1' } });
    await Order.updateMany({ shopkeeperId: '' }, { $set: { shopkeeperId: 'shop_1' } });
    console.log('Updated orders:', oRes.modifiedCount);

    console.log('Done!');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

fixDB();
