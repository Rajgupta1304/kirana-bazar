import mongoose from 'mongoose';
import Order from './models/Order.js';
import Product from './models/Product.js';
import Store from './models/Store.js';
import StoreStaff from './models/StoreStaff.js';
import StoreInventory from './models/StoreInventory.js';
import InventoryTransaction from './models/InventoryTransaction.js';
import DeliveryTask from './models/DeliveryTask.js';
import Brand from './models/Brand.js';
import Subcategory from './models/Subcategory.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kiranabazar';
import User from './models/User.js';

async function fixDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB. Running Migration to Blinkit Architecture...');
    
    // Create default store
    let defaultStore = await Store.findOne({ id: 'store_1' });
    if (!defaultStore) {
      defaultStore = await Store.create({
        id: 'store_1',
        name: 'Sharma Dark Store (Sector 14)',
        managerId: 'shop_1', // Assign to Sharma Kirana Store user
        address: 'Sector 14, Dark Store Facility',
        location: { lat: 28.4595, lng: 77.0266 }
      });
      console.log('Created Default Store:', defaultStore.name);
    }

    // Create a Delivery Partner
    let rider = await User.findOne({ id: 'rider_1' });
    if (!rider) {
      rider = await User.create({
        id: 'rider_1',
        name: 'Ramesh Kumar (Rider)',
        email: 'rider@kiranabazar.com',
        phone: '+91 99999 00000',
        password: 'rider123',
        role: 'Delivery Partner',
        status: 'Active'
      });
      console.log('Created Delivery Partner:', rider.name);
    }

    // Migrate old Users (Shopkeepers) to StoreStaff
    const shopkeepers = await User.find({ role: 'Shopkeeper' });
    let staffMigrated = 0;
    for (const shop of shopkeepers) {
      // Find a store managed by this user (legacy fallback)
      let store = await Store.findOne({ managerId: shop.id });
      // If no store exists, use defaultStore
      if (!store) {
        store = defaultStore;
      }

      const existingStaff = await StoreStaff.findOne({ userId: shop.id, storeId: store.id });
      if (!existingStaff) {
        await StoreStaff.create({
          id: 'staff_' + Date.now() + Math.floor(Math.random() * 1000),
          userId: shop.id,
          storeId: store.id,
          role: 'STORE_MANAGER'
        });
        staffMigrated++;
      }
    }
    console.log(`Migrated ${staffMigrated} old Shopkeepers to StoreStaff collection.`);

    // Migrate Products to StoreInventory
    const products = await Product.find({});
    for (const prod of products) {
      const invExists = await StoreInventory.findOne({ storeId: defaultStore.id, productId: prod.id });
      if (!invExists) {
        const newInv = await StoreInventory.create({
          id: 'inv_' + Date.now() + Math.floor(Math.random() * 1000),
          storeId: defaultStore.id,
          productId: prod.id,
          stock: prod.stock > 0 ? prod.stock : 50, // default stock
          price: prod.price || 27, // fallbacks
          mrp: prod.mrp || 30, // fallbacks
          sellingPrice: prod.price || 27, // backward compat
          isAvailable: true
        });
        
        await InventoryTransaction.create({
          storeId: defaultStore.id,
          productId: prod.id,
          type: 'STOCK_IN',
          quantity: newInv.stock,
          previousStock: 0,
          newStock: newInv.stock,
          reason: 'Initial setup migration',
          createdBy: 'system'
        });
      } else {
        // Update existing inventory with new schema fields
        invExists.price = invExists.price || invExists.sellingPrice || prod.price || 27;
        invExists.mrp = invExists.mrp || prod.mrp || 30;
        await invExists.save();
      }
    }
    console.log(`Migrated ${products.length} products to StoreInventory for store_1`);

    // Clean up Product collection (Master Catalog) by unsetting old fields
    const productCleanRes = await Product.updateMany(
      {},
      { 
        $unset: { 
          price: "", 
          mrp: "", 
          stock: "", 
          shopkeeperId: "", 
          shopkeeperName: "", 
          deliveryTime: "" 
        },
        $set: {
          brandId: 'brand_general',
          subcategoryId: 'subcat_general',
          isActive: true
        }
      },
      { strict: false }
    );
    console.log('Cleaned up deprecated fields from Products:', productCleanRes.modifiedCount);

    // Create basic brands and subcategories if missing
    await Brand.updateOne({ id: 'brand_general' }, { $set: { name: 'General Brand', isActive: true } }, { upsert: true });
    await Subcategory.updateOne({ id: 'subcat_general' }, { $set: { name: 'General', categoryId: 'cat_1', isActive: true } }, { upsert: true });

    // Migrate Orders to use storeId
    const oRes = await Order.updateMany(
      { storeId: { $exists: false } }, 
      { $set: { storeId: defaultStore.id, paymentStatus: 'SUCCESS', orderStatus: 'PLACED' } }
    );
    // Overwrite legacy shopkeeperId
    await Order.updateMany(
      { shopkeeperId: 'shop_1' }, 
      { $set: { storeId: defaultStore.id } }
    );
    console.log('Migrated orders to use storeId:', oRes.modifiedCount);

    console.log('Migration Done!');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

fixDB();
