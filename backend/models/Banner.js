import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  image: { type: String, required: true },
  targetType: { 
    type: String, 
    enum: ['CATEGORY', 'PRODUCT', 'SEARCH', 'EXTERNAL'], 
    default: 'CATEGORY' 
  },
  targetValue: { type: String, default: '' }, // categoryId, query string, or URL
  displayOrder: { type: Number, default: 1 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Banner || mongoose.model('Banner', bannerSchema);
