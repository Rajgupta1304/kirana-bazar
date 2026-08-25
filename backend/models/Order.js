import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true },
  unit: { type: String, default: '' },
  // Keeping id and price temporarily for backwards compatibility with Flutter models
  id: { type: String },
  price: { type: Number }
});

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, default: 'guest' },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  address: { type: String, required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  tip: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['UPI', 'Card', 'COD'], default: 'UPI' },
  paymentStatus: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'], default: 'PENDING' },
  orderStatus: { 
    type: String, 
    enum: ['PLACED', 'CONFIRMED', 'PICKING', 'PACKED', 'READY_FOR_PICKUP', 'ASSIGNED_TO_RIDER', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'], 
    default: 'PLACED' 
  },
  // Deprecated fields, keeping temporarily so existing app doesn't immediately crash
  status: { type: String, default: 'PENDING' },
  driverId: { type: String, default: null },
  driverName: { type: String, default: 'Assigning soon' },
  driverPhone: { type: String, default: '' },
  shopkeeperId: { type: String, default: '' },
  
  storeId: { type: String, required: true },
  deliveryTaskId: { type: String, default: null },
  deliveryPartnerId: { type: String, default: null },
  estimatedDeliveryMins: { type: Number, default: 10 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
