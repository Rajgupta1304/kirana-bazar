import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  rating: { type: Number, default: 4.9 },
  vehicle: { type: String, required: true },
  totalDeliveries: { type: Number, default: 100 },
  status: { type: String, enum: ['Available', 'On Delivery', 'Offline'], default: 'Available' },
  shopkeeperId: { type: String, default: '' },
  shopkeeperName: { type: String, default: '' }
});

export default mongoose.models.Driver || mongoose.model('Driver', driverSchema);
