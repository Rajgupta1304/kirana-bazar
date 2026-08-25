import mongoose from 'mongoose';

const deliveryTaskSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  storeId: { type: String, required: true },
  deliveryPartnerId: { type: String, default: null },
  pickupLocation: { type: String, default: '' },
  dropLocation: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['PENDING', 'ASSIGNED', 'ACCEPTED', 'ARRIVED_AT_STORE', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING'
  },
  assignedAt: { type: Date, default: null },
  pickedUpAt: { type: Date, default: null },
  deliveredAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.models.DeliveryTask || mongoose.model('DeliveryTask', deliveryTaskSchema);
