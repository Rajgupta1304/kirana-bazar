import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  categoryId: { type: String, required: true },
  categoryName: { type: String, required: true },
  brandId: { type: String, default: '' },
  subcategoryId: { type: String, default: '' },
  unit: { type: String, required: true }, // e.g. 500, or 500 ml
  unitType: { type: String, default: '' },
  ratingAverage: { type: Number, default: 4.8 },
  ratingCount: { type: Number, default: 0 },
  images: [{ type: String }],
  image: { type: String, required: true }, // Keep primary image for backwards compat
  description: { type: String, default: '' },
  barcode: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
  // Removed price, mrp, stock, shopkeeperId, deliveryTime as they belong to StoreInventory now
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', productSchema);
