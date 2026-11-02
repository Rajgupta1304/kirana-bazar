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
  isActive: { type: Boolean, default: true },
  isAnimation: { type: Boolean, default: false }, // Flag for animation image (GIF/animated WebP)
  visibleBranches: [{ type: String }], // Array of store IDs or ['all']
  storeId: { type: String, default: null }, // Null for Global Master Catalog, or specific storeId for shopkeeper-scoped items
  defaultPrice: { type: Number, default: 0 }, // Admin defined default price
  mrp: { type: Number, default: 0 } // Admin defined MRP
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', productSchema);
