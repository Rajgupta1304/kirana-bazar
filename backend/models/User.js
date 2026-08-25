import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Customer', 'Admin', 'Super Admin', 'Shopkeeper', 'Store Manager', 'Delivery Partner'], default: 'Customer' },
  status: { type: String, enum: ['Active', 'Blocked', 'Available', 'On Delivery', 'Offline'], default: 'Active' },
  shopName: { type: String, default: '' },
  address: { type: String, default: 'B-12, Sector 14, Metro Heights' },
  vehicle: { type: String, default: 'EV Scooter' },
  rating: { type: Number, default: 4.9 },
  totalDeliveries: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model('User', userSchema);
