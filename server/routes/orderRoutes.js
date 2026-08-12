import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Driver from '../models/Driver.js';
import { isMongoConnected } from '../db/connect.js';

const router = express.Router();

let memoryOrders = [
  {
    id: 'ORD-9821',
    userId: 'usr_1',
    customerName: 'Rahul Sharma',
    customerPhone: '+91 98989 12345',
    address: 'Flat 402, Green Valley Apts, Sector 62',
    items: [
      { id: 'prod_1', name: 'Amul Taaza Toned Fresh Milk', quantity: 2, price: 27, unit: '500 ml' },
      { id: 'prod_6', name: 'Lay\'s India\'s Magic Masala Chips', quantity: 1, price: 50, unit: '115 g' }
    ],
    totalAmount: 104,
    deliveryFee: 15,
    tip: 10,
    grandTotal: 129,
    paymentMethod: 'UPI',
    status: 'Out for Delivery',
    driverId: 'drv_1',
    driverName: 'Ramesh Kumar',
    driverPhone: '+91 98765 43210',
    createdAt: new Date().toISOString()
  }
];

// GET /api/orders
router.get('/', async (req, res) => {
  try {
    const { shopkeeperId } = req.query;
    if (isMongoConnected) {
      let query = {};
      if (shopkeeperId) {
        query = { shopkeeperId };
      }
      const orders = await Order.find(query).sort({ createdAt: -1 });
      res.json(orders);
    } else {
      if (shopkeeperId) {
        return res.json(memoryOrders.filter(o => o.shopkeeperId === shopkeeperId || !o.shopkeeperId));
      }
      res.json(memoryOrders);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders
router.post('/', async (req, res) => {
  try {
    const { items, customerDetails, tip = 0, paymentMethod = 'UPI', userId = 'guest' } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain items' });
    }

    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = totalAmount > 199 ? 0 : 15;
    const grandTotal = totalAmount + deliveryFee + tip;

    let shopkeeperId = items[0]?.shopkeeperId || '';
    if (!shopkeeperId && isMongoConnected) {
      const prod = await Product.findOne({ id: items[0]?.id });
      if (prod) shopkeeperId = prod.shopkeeperId || '';
    }

    let assignedDriver = null;
    if (isMongoConnected) {
      let driverQuery = { status: 'Available' };
      if (shopkeeperId) driverQuery.shopkeeperId = shopkeeperId;
      assignedDriver = await Driver.findOne(driverQuery);
    }

    const newOrderObj = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      userId,
      shopkeeperId,
      customerName: customerDetails?.name || 'Rahul Sharma',
      customerPhone: customerDetails?.phone || '+91 98989 12345',
      address: customerDetails?.address || 'B-12, Sector 14, Metro Heights',
      items: items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price, unit: i.unit, shopkeeperId: i.shopkeeperId || shopkeeperId })),
      totalAmount,
      deliveryFee,
      tip,
      grandTotal,
      paymentMethod,
      status: 'Received',
      driverId: assignedDriver ? assignedDriver.id : 'drv_1',
      driverName: assignedDriver ? assignedDriver.name : 'Ramesh Kumar',
      driverPhone: assignedDriver ? assignedDriver.phone : '+91 98765 43210',
      createdAt: new Date()
    };

    // Deduct Stock
    if (isMongoConnected) {
      for (const item of items) {
        await Product.updateOne({ id: item.id }, { $inc: { stock: -item.quantity } });
      }
      const createdOrder = await Order.create(newOrderObj);
      return res.status(201).json(createdOrder);
    } else {
      memoryOrders.unshift(newOrderObj);
      return res.status(201).json(newOrderObj);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (isMongoConnected) {
      const updated = await Order.findOneAndUpdate(
        { id: req.params.id },
        { status },
        { new: true }
      );
      return res.json(updated);
    } else {
      const ord = memoryOrders.find(o => o.id === req.params.id);
      if (ord) {
        ord.status = status;
        return res.json(ord);
      }
      return res.status(404).json({ error: 'Order not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
