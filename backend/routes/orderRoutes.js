import express from 'express';
import Order from '../models/Order.js';
import StoreInventory from '../models/StoreInventory.js';
import Store from '../models/Store.js';
import StoreStaff from '../models/StoreStaff.js';
import DeliveryTask from '../models/DeliveryTask.js';
import Product from '../models/Product.js';
import { isMongoConnected } from '../db/connect.js';
import { createNotification } from './notificationRoutes.js';
import { authMiddleware, requireShopkeeper } from '../middleware/authMiddleware.js';

const router = express.Router();

let memoryOrders = []; // Deprecated fallback for memory

import jwt from 'jsonwebtoken';

const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'kirana_bazar_secret_key_123');
      req.user = decoded;
    } catch (err) {
      // Invalid token, proceed without user
    }
  }
  next();
};

// GET /api/orders
router.get('/', optionalAuthMiddleware, async (req, res) => {
  try {
    if (!isMongoConnected) return res.json(memoryOrders);

    let query = {};
    const { userId, storeId, shopkeeperId } = req.query;

    if (userId) {
      query.userId = userId;
    } else if (req.user) {
      if (req.user.role === 'Shopkeeper') {
        const staffs = await StoreStaff.find({ userId: req.user.id, status: 'ACTIVE' });
        const storeIds = staffs.map(s => s.storeId);
        query.storeId = { $in: storeIds };
      } else if (req.user.role === 'Customer') {
        query.userId = req.user.id;
      } else if (req.user.role === 'Delivery Partner') {
        const tasks = await DeliveryTask.find({
          $or: [
            { deliveryPartnerId: req.user.id },
            { deliveryPartnerId: null, status: 'PENDING' }
          ]
        });
        const orderIds = tasks.map(t => t.orderId);
        query.id = { $in: orderIds };
      }
    } else if (storeId || shopkeeperId) {
      query.storeId = storeId || shopkeeperId;
    }
    
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders
router.post('/', optionalAuthMiddleware, async (req, res) => {
  try {
    const { items, customerDetails, tip = 0, paymentMethod = 'UPI', storeId, userId: bodyUserId } = req.body;
    const userId = req.user?.id || bodyUserId || 'usr_1'; 
    
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
      const pId = item.id || item.productId;
      let inventory = inventories.find(inv => inv.productId === pId);
      if (!inventory) {
        // Look up master catalog and auto-link store inventory
        const masterProd = await Product.findOne({ id: pId });
        if (masterProd) {
          inventory = await StoreInventory.create({
            id: 'inv_' + Date.now() + Math.floor(Math.random() * 1000),
            storeId,
            productId: masterProd.id,
            stock: 35,
            sellingPrice: item.price || masterProd.price || 30,
            price: item.price || masterProd.price || 30,
            mrp: item.mrp || masterProd.mrp || 35,
            isAvailable: true,
            lowStockThreshold: 10,
            reservedStock: 0
          });
        }
      }

      if (!inventory) {
        return res.status(400).json({ error: `Product ${item.name} is not available at this store.` });
      }

      if (inventory.stock < item.quantity) {
        // Auto-replenish depleted stock so checkout never blocks sales
        const restockAmount = Math.max(35, item.quantity * 5);
        inventory.stock += restockAmount;
        await StoreInventory.updateOne({ _id: inventory._id }, { $set: { stock: inventory.stock } });
      }
      
      const itemPrice = inventory.price || inventory.sellingPrice || item.price || 30;
      const itemTotal = itemPrice * item.quantity;
      totalAmount += itemTotal;

      finalItems.push({
        productId: inventory.productId,
        name: item.name || 'Grocery Item',
        quantity: item.quantity,
        unitPrice: itemPrice,
        total: itemTotal,
        unit: item.unit || '1 unit',
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
      customerName: customerDetails?.name || req.user?.name || 'Rahul Sharma',
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
        let dTask = await DeliveryTask.findOne({ orderId: existingOrder.id });
        if (!dTask) {
          dTask = new DeliveryTask({
            id: 'DTK-' + Math.floor(1000 + Math.random() * 9000),
            orderId: existingOrder.id,
            storeId: existingOrder.storeId || 'store_1',
            deliveryPartnerId: req.user.id,
            status: targetStatus === 'DELIVERED' ? 'DELIVERED' : 'PICKED_UP'
          });
          await dTask.save();
        } else {
          if (dTask.deliveryPartnerId && dTask.deliveryPartnerId !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden. Task assigned to another rider.' });
          }
          
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
      }

      const updateFields = {
        orderStatus: targetStatus,
        status: targetStatus
      };
      if (req.user.role === 'Delivery Partner') {
        updateFields.driverId = req.user.id;
        updateFields.driverName = req.user.name || 'Rider';
        updateFields.driverPhone = req.user.phone || '';
      }

      const updated = await Order.findOneAndUpdate(
        { id: req.params.id },
        updateFields,
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
