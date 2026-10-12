import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import Driver from '../models/Driver.js';
import Store from '../models/Store.js';
import StoreStaff from '../models/StoreStaff.js';

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URL || process.env.MONGO_PRIVATE_URL || 'mongodb://127.0.0.1:27017/kiranabazar';

// Initial Seed Data
const SEED_USERS = [
  {
    id: 'usr_1',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    phone: '+91 98989 12345',
    password: 'user123',
    role: 'Customer',
    status: 'Active',
    address: 'B-12, Sector 14, Metro Heights'
  },
  {
    id: 'admin_1',
    name: 'Store Manager (Admin)',
    email: 'admin@kiranabazar.com',
    phone: '+91 99999 88888',
    password: 'admin123',
    role: 'Admin',
    status: 'Active',
    address: 'Kirana Bazar Warehouse Dark Store #402'
  },
  {
    id: 'shop_1',
    name: 'Sharma Kirana Store',
    email: 'shopkeeper@kiranabazar.com',
    phone: '+91 98765 43210',
    password: 'shop123',
    role: 'Shopkeeper',
    status: 'Active',
    shopName: 'Sharma General & Grocery Store',
    address: 'Shop 14, Main Market, Sector 15'
  },
  {
    id: 'rider_1',
    name: 'Ramesh Kumar (Rider)',
    email: 'rider@kiranabazar.com',
    phone: '+91 98123 45678',
    password: 'rider123',
    role: 'Delivery Partner',
    status: 'Available',
    vehicle: 'EV Scooter (DL-01-AB-1234)',
    rating: 4.9,
    totalDeliveries: 482,
    address: 'Hub #1, Sector 15 Dark Store'
  }
];

const SEED_CATEGORIES = [
  { id: 'cat_1', name: 'Dairy, Bread & Egg', icon: '🥛', color: 'bg-blue-50 text-blue-700', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80' },
  { id: 'cat_2', name: 'Fruits & Vegetables', icon: '🥦', color: 'bg-green-50 text-green-700', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80' },
  { id: 'cat_3', name: 'Munchies & Snacks', icon: '🍿', color: 'bg-yellow-50 text-yellow-700', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80' },
  { id: 'cat_4', name: 'Cold Drinks & Juices', icon: '🥤', color: 'bg-red-50 text-red-700', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80' },
  { id: 'cat_5', name: 'Instant & Frozen Food', icon: '🍜', color: 'bg-purple-50 text-purple-700', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80' },
  { id: 'cat_6', name: 'Sweet Tooth & Bakery', icon: '🍩', color: 'bg-pink-50 text-pink-700', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80' },
  { id: 'cat_7', name: 'Atta, Rice & Dal', icon: '🌾', color: 'bg-amber-50 text-amber-700', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80' },
  { id: 'cat_8', name: 'Cleaning & Household', icon: '🧹', color: 'bg-teal-50 text-teal-700', image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=400&q=80' }
];

const SEED_PRODUCTS = [
  {
    id: 'prod_1',
    name: 'Amul Taaza Toned Fresh Milk',
    categoryId: 'cat_1',
    categoryName: 'Dairy, Bread & Egg',
    unit: '500 ml',
    price: 27,
    mrp: 30,
    stock: 45,
    rating: 4.8,
    deliveryTime: '8 MINS',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80',
    description: 'Pasteurized toned milk packed with essentials calcium and protein for everyday healthy lifestyle.'
  },
  {
    id: 'prod_2',
    name: 'Harvest Gold White Bread',
    categoryId: 'cat_1',
    categoryName: 'Dairy, Bread & Egg',
    unit: '400 g',
    price: 45,
    mrp: 50,
    stock: 30,
    rating: 4.6,
    deliveryTime: '10 MINS',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
    description: 'Soft, freshly baked white bread slices ideal for breakfast toast and sandwiches.'
  },
  {
    id: 'prod_3',
    name: 'Farm Fresh Organic Eggs (6 Pcs)',
    categoryId: 'cat_1',
    categoryName: 'Dairy, Bread & Egg',
    unit: '6 units',
    price: 64,
    mrp: 75,
    stock: 22,
    rating: 4.9,
    deliveryTime: '9 MINS',
    image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=400&q=80',
    description: 'Rich in protein, farm fresh brown eggs high in nutrients and clean packed.'
  },
  {
    id: 'prod_4',
    name: 'Fresh Hydroponic Tomatoes',
    categoryId: 'cat_2',
    categoryName: 'Fruits & Vegetables',
    unit: '500 g',
    price: 32,
    mrp: 40,
    stock: 18,
    rating: 4.5,
    deliveryTime: '10 MINS',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
    description: 'Juicy, plump red tomatoes directly sourced from local sustainable farms.'
  },
  {
    id: 'prod_5',
    name: 'Crisp Green Farm Broccoli',
    categoryId: 'cat_2',
    categoryName: 'Fruits & Vegetables',
    unit: '1 pc (approx 350g)',
    price: 79,
    mrp: 99,
    stock: 8,
    rating: 4.7,
    deliveryTime: '11 MINS',
    image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=400&q=80',
    description: 'Nutrient-rich fresh green broccoli head, packed with vitamins and antioxidants.'
  },
  {
    id: 'prod_6',
    name: 'Lay\'s India\'s Magic Masala Chips',
    categoryId: 'cat_3',
    categoryName: 'Munchies & Snacks',
    unit: '115 g',
    price: 50,
    mrp: 50,
    stock: 55,
    rating: 4.9,
    deliveryTime: '7 MINS',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80',
    description: 'Crunchy potato chips seasoned with aromatic Indian spices.'
  },
  {
    id: 'prod_7',
    name: 'Doritos Nacho Cheese Tortilla',
    categoryId: 'cat_3',
    categoryName: 'Munchies & Snacks',
    unit: '150 g',
    price: 85,
    mrp: 95,
    stock: 40,
    rating: 4.8,
    deliveryTime: '8 MINS',
    image: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=400&q=80',
    description: 'Bold cheesy crunch made from real corn, perfect snack for movie nights.'
  },
  {
    id: 'prod_8',
    name: 'Coca-Cola Zero Sugar Can',
    categoryId: 'cat_4',
    categoryName: 'Cold Drinks & Juices',
    unit: '300 ml',
    price: 40,
    mrp: 40,
    stock: 60,
    rating: 4.7,
    deliveryTime: '6 MINS',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80',
    description: 'Chilled sparkling soft drink with zero sugar and maximum refreshment.'
  }
];

const SEED_DRIVERS = [
  { id: 'drv_1', name: 'Ramesh Kumar', phone: '+91 98765 43210', rating: 4.9, vehicle: 'EV Scooter (DL-01-AB-1234)', totalDeliveries: 482, status: 'Available' },
  { id: 'drv_2', name: 'Suresh Verma', phone: '+91 98123 45678', rating: 4.8, vehicle: 'Bicycle Express', totalDeliveries: 310, status: 'Available' },
  { id: 'drv_3', name: 'Amit Singh', phone: '+91 99887 66554', rating: 4.95, vehicle: 'EV Bike (DL-02-XY-9876)', totalDeliveries: 740, status: 'On Delivery' }
];

const SEED_ORDERS = [
  {
    id: 'ORD-9821',
    userId: 'usr_1',
    customerName: 'Rahul Sharma',
    customerPhone: '+91 98989 12345',
    address: 'Flat 402, Green Valley Apts, Sector 62',
    storeId: 'store_1',
    orderStatus: 'OUT_FOR_DELIVERY',
    status: 'Out for Delivery',
    items: [
      { productId: 'prod_1', id: 'prod_1', name: 'Amul Taaza Toned Fresh Milk', quantity: 2, unitPrice: 27, price: 27, total: 54, unit: '500 ml' },
      { productId: 'prod_6', id: 'prod_6', name: 'Lay\'s India\'s Magic Masala Chips', quantity: 1, unitPrice: 50, price: 50, total: 50, unit: '115 g' }
    ],
    totalAmount: 104,
    deliveryFee: 15,
    tip: 10,
    grandTotal: 129,
    paymentMethod: 'UPI',
    paymentStatus: 'SUCCESS',
    driverId: 'rider_1',
    driverName: 'Ramesh Kumar (Rider)',
    driverPhone: '+91 98123 45678',
    deliveryPartnerId: 'rider_1'
  }
];

export let isMongoConnected = false;

export async function connectDB() {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 4000
    });
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB at', MONGODB_URI);
  } catch (err) {
    console.warn('⚠️ Could not connect to MongoDB server:', err.message);
    console.warn('⚡ Using memory/local storage fallback for Kirana Bazar API server.');
    isMongoConnected = false;
    return;
  }

  // Auto-seed initial data safely outside the connection try/catch
  try {
    await seedInitialData();
  } catch (seedErr) {
    console.warn('⚠️ Seeding warning:', seedErr.message);
  }
}

async function seedInitialData() {
  if (!isMongoConnected) return;

  // 1. Seed or Upsert Essential Users
  for (const user of SEED_USERS) {
    try {
      const exists = await User.findOne({ email: user.email.toLowerCase() });
      if (!exists) {
        await User.create(user);
        console.log(`👤 Seeded user: ${user.name} (${user.role})`);
      }
    } catch (e) {
      console.warn(`User seed warning for ${user.email}:`, e.message);
    }
  }

  // 2. Seed Stores
  try {
    const storeCount = await Store.countDocuments();
    if (storeCount === 0) {
      await Store.create({
        id: 'store_1',
        name: 'Sharma Kirana Store',
        managerId: 'shop_1',
        address: 'Shop 14, Main Market, Sector 15',
        location: { lat: 28.4595, lng: 77.0266 },
        active: true
      });
      console.log('🏪 Seeded default store: Sharma Kirana Store (store_1)');
    }
  } catch (e) {
    console.warn('Store seed warning:', e.message);
  }

  // 3. Seed StoreStaff
  try {
    const staffCount = await StoreStaff.countDocuments();
    if (staffCount === 0) {
      await StoreStaff.create({
        id: 'staff_1',
        userId: 'shop_1',
        storeId: 'store_1',
        role: 'STORE_MANAGER',
        status: 'ACTIVE'
      });
      console.log('👥 Seeded store staff: shop_1 -> store_1 (STORE_MANAGER)');
    }
  } catch (e) {
    console.warn('StoreStaff seed warning:', e.message);
  }

  // 4. Seed Categories
  try {
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      await Category.insertMany(SEED_CATEGORIES);
    } else {
      for (const cat of SEED_CATEGORIES) {
        await Category.updateOne(
          { id: cat.id, $or: [{ image: '' }, { image: null }, { image: { $exists: false } }] },
          { $set: { image: cat.image } }
        );
      }
    }
  } catch (e) {
    console.warn('Category seed warning:', e.message);
  }

  // 5. Seed Products
  try {
    const prodCount = await Product.countDocuments();
    if (prodCount === 0) {
      await Product.insertMany(SEED_PRODUCTS);
    }
  } catch (e) {
    console.warn('Product seed warning:', e.message);
  }

  // 6. Seed Drivers
  try {
    const driverCount = await Driver.countDocuments();
    if (driverCount === 0) {
      await Driver.insertMany(SEED_DRIVERS);
    }
  } catch (e) {
    console.warn('Driver seed warning:', e.message);
  }

  // 7. Seed Orders
  try {
    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      await Order.insertMany(SEED_ORDERS);
    }
  } catch (e) {
    console.warn('Order seed warning:', e.message);
  }
}
