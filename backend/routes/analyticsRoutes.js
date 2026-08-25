import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Store from '../models/Store.js';
import StoreInventory from '../models/StoreInventory.js';
import DeliveryTask from '../models/DeliveryTask.js';
import { isMongoConnected } from '../db/connect.js';

const router = express.Router();

// GET /api/analytics
router.get('/', async (req, res) => {
  try {
    const { shopkeeperId } = req.query;
    if (isMongoConnected) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Aggregations based on store context
      let orderQuery = shopkeeperId ? { storeId: shopkeeperId } : {};
      const orders = await Order.find(orderQuery);
      
      const todaysOrders = orders.filter(o => new Date(o.createdAt) >= today);
      const todaysRevenue = todaysOrders.reduce((sum, o) => sum + (o.grandTotal || o.totalAmount || 0), 0);
      
      const pendingOrders = orders.filter(o => o.status === 'PLACED' || o.status === 'PENDING').length;
      const cancelledOrders = orders.filter(o => o.status === 'CANCELLED').length;
      
      // Stock
      let lowStockCount = 0;
      if (shopkeeperId) {
        lowStockCount = await StoreInventory.countDocuments({ storeId: shopkeeperId, stock: { $lte: 10 } });
      } else {
        lowStockCount = await StoreInventory.countDocuments({ stock: { $lte: 10 } });
      }

      // Users and Stores (Super Admin Metrics)
      let totalCustomers = 0;
      let totalStores = 0;
      let totalStoreManagers = 0;
      let totalDeliveryPartners = 0;
      let activeDeliveries = 0;

      if (!shopkeeperId) {
        totalCustomers = await User.countDocuments({ role: 'Customer' });
        totalStores = await Store.countDocuments({});
        totalStoreManagers = await User.countDocuments({ role: 'Shopkeeper' });
        totalDeliveryPartners = await User.countDocuments({ role: 'Delivery Partner' });
        activeDeliveries = await DeliveryTask.countDocuments({ status: { $in: ['ACCEPTED', 'ARRIVED_AT_STORE', 'PICKED_UP', 'OUT_FOR_DELIVERY'] } });
      }

      return res.json({
        totalCustomers,
        totalStores,
        totalStoreManagers,
        totalDeliveryPartners,
        todaysOrders: todaysOrders.length,
        todaysRevenue,
        pendingOrders,
        cancelledOrders,
        activeDeliveries,
        lowStockCount,
        // Legacy compat
        totalSales: todaysRevenue,
        totalOrders: orders.length,
        activeOrders: pendingOrders
      });
    } else {
      return res.json({
        totalCustomers: 15,
        totalStores: 2,
        totalStoreManagers: 2,
        totalDeliveryPartners: 5,
        todaysOrders: 10,
        todaysRevenue: 2500,
        pendingOrders: 3,
        cancelledOrders: 1,
        activeDeliveries: 2,
        lowStockCount: 4,
        // Legacy compat
        totalSales: 2500,
        totalOrders: 10,
        activeOrders: 3
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
