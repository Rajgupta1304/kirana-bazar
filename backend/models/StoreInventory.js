import mongoose from 'mongoose';

const storeInventorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  storeId: { type: String, required: true },
  productId: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  reservedStock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  sellingPrice: { type: Number }, // Keep for legacy migration compat temporarily
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.StoreInventory || mongoose.model('StoreInventory', storeInventorySchema);
