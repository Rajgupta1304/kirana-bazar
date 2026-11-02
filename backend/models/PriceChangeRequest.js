import mongoose from 'mongoose';

const priceChangeRequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  storeId: { type: String, required: true },
  storeName: { type: String, required: true },
  shopkeeperId: { type: String, required: true },
  shopkeeperName: { type: String, required: true },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  productImage: { type: String, default: '' },
  currentPrice: { type: Number, required: true },
  defaultPrice: { type: Number, required: true },
  requestedPrice: { type: Number, required: true },
  reason: { type: String, default: '' },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'COUNTER_OFFER'],
    default: 'PENDING'
  },
  counterPrice: { type: Number, default: null }, // Admin's alternative approved price
  adminNote: { type: String, default: '' },
  reviewedBy: { type: String, default: null },
  reviewedAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.models.PriceChangeRequest || mongoose.model('PriceChangeRequest', priceChangeRequestSchema);
