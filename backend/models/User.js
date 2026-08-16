import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Customer', 'Admin', 'Shopkeeper'], default: 'Customer' },
  status: { type: String, enum: ['Active', 'Blocked'], default: 'Active' },
  shopName: { type: String, default: '' },
  address: { type: String, default: 'B-12, Sector 14, Metro Heights' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model('User', userSchema);
