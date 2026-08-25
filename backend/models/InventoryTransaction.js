import mongoose from 'mongoose';

const inventoryTransactionSchema = new mongoose.Schema({
  storeId: { type: String, required: true },
  productId: { type: String, required: true },
  type: { type: String, enum: ['STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', 'ORDER_DEDUCT', 'ORDER_CANCEL'], required: true },
  quantity: { type: Number, required: true },
  previousStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  reason: { type: String, default: '' },
  createdBy: { type: String, default: 'system' }
}, { timestamps: true });

export default mongoose.models.InventoryTransaction || mongoose.model('InventoryTransaction', inventoryTransactionSchema);
