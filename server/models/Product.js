import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  categoryId: { type: String, required: true },
  categoryName: { type: String, required: true },
  unit: { type: String, required: true },
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  stock: { type: Number, required: true, default: 10 },
  rating: { type: Number, default: 4.8 },
  deliveryTime: { type: String, default: '8-10 MINS' },
  image: { type: String, required: true },
  description: { type: String, default: '' },
  shopkeeperId: { type: String, default: '' },
  shopkeeperName: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', productSchema);
