import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { isMongoConnected } from '../db/connect.js';

const router = express.Router();

// GET /api/analytics
router.get('/', async (req, res) => {
  try {
    const { shopkeeperId } = req.query;
    if (isMongoConnected) {
      let orders = await Order.find();
      let products = await Product.find();
      const users = await User.find();

      if (shopkeeperId) {
        products = products.filter(p => p.shopkeeperId === shopkeeperId);
        const shopProdIds = new Set(products.map(p => p.id));
        orders = orders.filter(o => o.shopkeeperId === shopkeeperId || o.items?.some(i => shopProdIds.has(i.id)));
      }

      const totalSales = orders.reduce((sum, o) => sum + o.grandTotal, 0);
      const totalOrders = orders.length;
      const activeOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
      const lowStockCount = products.filter(p => p.stock <= 10).length;

      return res.json({
        totalSales,
        totalOrders,
        activeOrders,
        lowStockCount,
        totalProducts: products.length,
        totalUsers: users.length
      });
    } else {
      return res.json({
        totalSales: 129,
        totalOrders: 1,
        activeOrders: 1,
        lowStockCount: 1,
        totalProducts: 12,
        totalUsers: 2
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
