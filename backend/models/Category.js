import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  icon: { type: String, default: '🛍️' },
  image: { type: String, default: '' },
  color: { type: String, default: 'bg-emerald-50 text-emerald-700' }
});

export default mongoose.models.Category || mongoose.model('Category', categorySchema);
