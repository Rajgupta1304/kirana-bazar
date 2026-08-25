import mongoose from 'mongoose';

const storeStaffSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  storeId: { type: String, required: true },
  role: { type: String, enum: ['STORE_MANAGER', 'PICKER', 'PACKER', 'Shopkeeper'], required: true },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.StoreStaff || mongoose.model('StoreStaff', storeStaffSchema);
