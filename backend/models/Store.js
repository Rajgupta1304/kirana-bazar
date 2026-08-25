import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  managerId: { type: String, required: true }, // The shopkeeper user ID
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true, default: 0 },
    lng: { type: Number, required: true, default: 0 }
  },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Store || mongoose.model('Store', storeSchema);
