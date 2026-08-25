import express from 'express';
import Order from '../models/Order.js';
import StoreInventory from '../models/StoreInventory.js';
import Store from '../models/Store.js';
import StoreStaff from '../models/StoreStaff.js';
import DeliveryTask from '../models/DeliveryTask.js';
import { isMongoConnected } from '../db/connect.js';
import { createNotification } from './notificationRoutes.js';
import { authMiddleware, requireShopkeeper } from '../middleware/authMiddleware.js';

const router = express.Router();

let memoryOrders = []; // Deprecated fallback for memory

// GET /api/orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (!isMongoConnected) return res.json(memoryOrders);

    let query = {};
    if (req.user.role === 'Shopkeeper') {
      const staffs = await StoreStaff.find({ userId: req.user.id, status: 'ACTIVE' });
      const storeIds = staffs.map(s => s.storeId);
      query.storeId = { $in: storeIds };
    } else if (req.user.role === 'Customer') {
      query.userId = req.user.id;
    } else if (req.user.role === 'Delivery Partner') {
      // Find orders that have a delivery task assigned to this rider OR unassigned tasks
      // For MVP, we can just return all READY_FOR_PICKUP, OUT_FOR_DELIVERY, etc orders
      // that are either assigned to this rider or unassigned.
      const tasks = await DeliveryTask.find({
        $or: [
          { deliveryPartnerId: req.user.id },
          { deliveryPartnerId: null, status: 'PENDING' }
        ]
      });
      const orderIds = tasks.map(t => t.orderId);
      query.id = { $in: orderIds };
    }
    
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items, customerDetails, tip = 0, paymentMethod = 'UPI', storeId } = req.body;
    const userId = req.user.id; 
    
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain items' });
    }
    if (!storeId) {
      return res.status(400).json({ error: 'storeId is required' });
    }

    if (!isMongoConnected) return res.status(500).json({ error: 'MongoDB required for new architecture' });

    // Validate store exists
    const store = await Store.findOne({ id: storeId });
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Verify all items belong to this store and have stock
    let totalAmount = 0;
    const finalItems = [];

    const productIds = items.map(i => i.id || i.productId);
    const inventories = await StoreInventory.find({ storeId, productId: { $in: productIds } });

    for (const item of items) {
      const inventory = inventories.find(inv => inv.productId === (item.id || item.productId));
      if (!inventory) {
         return res.status(400).json({ error: `Product ${item.name} is not available at this store.` });
      }
      if (inventory.stock < item.quantity) {
         return res.status(400).json({ error: `Insufficient stock for ${item.name}.` });
      }
      
      const itemPrice = inventory.price || inventory.sellingPrice;
      const itemTotal = itemPrice * item.quantity;
      totalAmount += itemTotal;

      finalItems.push({
        productId: inventory.productId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: itemPrice,
        total: itemTotal,
        unit: item.unit,
        // Legacy compat
        id: inventory.productId,
        price: itemPrice
      });
    }

    const deliveryFee = totalAmount > 199 ? 0 : 15;
    const grandTotal = totalAmount + deliveryFee + tip;

    const newOrderObj = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      userId,
      storeId: storeId,
      customerName: customerDetails?.name || req.user.name || 'Rahul Sharma',
      customerPhone: customerDetails?.phone || '+91 98989 12345',
      address: customerDetails?.address || 'B-12, Sector 14, Metro Heights',
      items: finalItems,
      totalAmount,
      deliveryFee,
      tip,
      grandTotal,
      paymentMethod,
      orderStatus: 'PLACED',
      paymentStatus: 'PENDING',
      createdAt: new Date(),
      // Legacy compat
      status: 'PENDING',
      shopkeeperId: store.managerId
    };

    // Deduct Stock
    for (const item of finalItems) {
      await StoreInventory.updateOne(
        { storeId, productId: item.productId },
        { $inc: { stock: -item.quantity } }
      );
    }
    
    const createdOrder = await Order.create(newOrderObj);
    
    // Notify store manager
    if (store.managerId) {
      await createNotification(store.managerId, createdOrder.id, 'New Order Received', `Order ${createdOrder.id} for ₹${createdOrder.grandTotal}`);
    }
    return res.status(201).json(createdOrder);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status, orderStatus } = req.body;
    const targetStatus = orderStatus || status; // support both legacy and new

    if (!isMongoConnected) return res.status(500).json({ error: 'MongoDB required' });

    const existingOrder = await Order.findOne({ id: req.params.id });
    if (!existingOrder) return res.status(404).json({ error: 'Order not found' });
    
    if (!['Shopkeeper', 'Admin', 'Super Admin', 'Delivery Partner'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden. Invalid role for this action.' });
    }

      // Authorization: Check if shopkeeper manages this store
      if (req.user.role === 'Shopkeeper') {
        const staff = await StoreStaff.findOne({ userId: req.user.id, storeId: existingOrder.storeId, status: 'ACTIVE' });
        if (!staff) {
          return res.status(403).json({ error: 'Forbidden. You do not manage the store for this order.' });
        }
      }

      // Authorization: Check if Delivery Partner
      if (req.user.role === 'Delivery Partner') {
        const dTask = await DeliveryTask.findOne({ orderId: existingOrder.id });
        if (!dTask) return res.status(404).json({ error: 'Delivery task not found' });
        
        if (dTask.deliveryPartnerId && dTask.deliveryPartnerId !== req.user.id) {
          return res.status(403).json({ error: 'Forbidden. Task assigned to another rider.' });
        }
        
        // If rider accepts, assign them
        if (targetStatus === 'OUT_FOR_DELIVERY' && !dTask.deliveryPartnerId) {
          dTask.deliveryPartnerId = req.user.id;
          dTask.status = 'PICKED_UP';
          await dTask.save();
        } else if (targetStatus === 'DELIVERED') {
          dTask.status = 'DELIVERED';
          dTask.deliveredAt = new Date();
          await dTask.save();
        }
      }

      const updated = await Order.findOneAndUpdate(
        { id: req.params.id },
        { orderStatus: targetStatus, status: targetStatus }, // Update both for compat
        { new: true }
      );

      if (updated) {
        // If status becomes READY_FOR_PICKUP, we could create a DeliveryTask here
        if (targetStatus === 'READY_FOR_PICKUP' && !updated.deliveryTaskId) {
          const dTask = await DeliveryTask.create({
            id: 'DTK-' + Math.floor(1000 + Math.random() * 9000),
            orderId: updated.id,
            storeId: updated.storeId,
            status: 'PENDING'
          });
          await Order.updateOne({ id: updated.id }, { deliveryTaskId: dTask.id });
        }

      const msgs = {
        'CONFIRMED': 'Your order has been confirmed by the store.',
        'PICKING': 'Your order is being picked.',
        'PACKED': 'Your order is packed.',
        'READY_FOR_PICKUP': 'Your order is ready for rider pickup.',
        'OUT_FOR_DELIVERY': 'Your order is out for delivery.',
        'DELIVERED': 'Your order has been delivered successfully.',
        'CANCELLED': 'Your order has been cancelled.'
      };
      const msg = msgs[targetStatus] || `Your order status is now ${targetStatus}.`;
      await createNotification(updated.userId, updated.id, 'Order Status Updated', msg);
      
      return res.json(updated);
    }
    
    return res.status(404).json({ error: 'Order not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders/:id/assign (Manual Assignment)
router.post('/:id/assign', authMiddleware, requireShopkeeper, async (req, res) => {
  try {
    const { deliveryPartnerId } = req.body;
    if (!isMongoConnected) return res.status(500).json({ error: 'MongoDB required' });

    // Ensure we have User model to get rider details
    const User = (await import('../models/User.js')).default;
    
    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    let rider = await User.findOne({ id: deliveryPartnerId, role: 'Delivery Partner' });
    
    if (!rider) {
      const Driver = (await import('../models/Driver.js')).default;
      rider = await Driver.findOne({ id: deliveryPartnerId });
    }
    
    if (!rider) return res.status(404).json({ error: 'Rider not found' });

    let dTask = await DeliveryTask.findOne({ orderId: order.id });
    if (!dTask) {
      dTask = await DeliveryTask.create({
        id: 'DTK-' + Math.floor(1000 + Math.random() * 9000),
        orderId: order.id,
        storeId: order.storeId,
        status: 'ASSIGNED',
        deliveryPartnerId: rider.id
      });
      order.deliveryTaskId = dTask.id;
    } else {
      dTask.deliveryPartnerId = rider.id;
      dTask.status = 'ASSIGNED';
      await dTask.save();
    }

    order.orderStatus = 'ASSIGNED_TO_RIDER';
    order.status = 'ASSIGNED_TO_RIDER';
    order.driverId = rider.id;
    order.driverName = rider.name;
    order.driverPhone = rider.phone;
    await order.save();

    await createNotification(order.userId, order.id, 'Rider Assigned', `${rider.name} is heading to the store.`);
    await createNotification(rider.id, dTask.id, 'New Delivery Assigned', `You have been manually assigned to order ${order.id}.`);

    return res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
