import mongoose from 'mongoose';

const subcategorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  categoryId: { type: String, required: true },
  name: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Subcategory || mongoose.model('Subcategory', subcategorySchema);
