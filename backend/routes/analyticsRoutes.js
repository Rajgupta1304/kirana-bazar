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
    const targetStoreId = (req.query.storeId && req.query.storeId !== 'all') ? req.query.storeId : (req.query.shopkeeperId || null);
    if (isMongoConnected) {
      const now = new Date();
      const isDateToday = (dVal) => {
        if (!dVal) return false;
        const d = new Date(dVal);
        if (isNaN(d.getTime())) return false;
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth() &&
          d.getDate() === now.getDate()
        );
      };

      // Aggregations based on store context
      let orderQuery = targetStoreId ? { $or: [{ storeId: targetStoreId }, { shopkeeperId: targetStoreId }] } : {};
      const orders = await Order.find(orderQuery);
      
      const todaysOrders = orders.filter(o => isDateToday(o.createdAt));
      const todaysRevenue = todaysOrders.reduce((sum, o) => sum + (Number(o.grandTotal) || Number(o.totalAmount) || 0), 0);
      const totalLifetimeSales = orders.reduce((sum, o) => sum + (Number(o.grandTotal) || Number(o.totalAmount) || 0), 0);
      
      const pendingOrders = orders.filter(o => ['PLACED', 'PENDING', 'ACCEPTED', 'CONFIRMED', 'PICKING', 'PREPARING'].includes(o.status)).length;
      const cancelledOrders = orders.filter(o => o.status === 'CANCELLED').length;
      
      // Stock
      let lowStockCount = 0;
      if (targetStoreId) {
        lowStockCount = await StoreInventory.countDocuments({ storeId: targetStoreId, stock: { $lte: 10 } });
      } else {
        lowStockCount = await StoreInventory.countDocuments({ stock: { $lte: 10 } });
      }

      // Users and Stores (Super Admin Metrics)
      let totalCustomers = 0;
      let totalStores = 0;
      let totalStoreManagers = 0;
      let totalDeliveryPartners = 0;
      let activeDeliveries = 0;

      if (!targetStoreId) {
        totalCustomers = await User.countDocuments({ role: 'Customer' });
        totalStores = await Store.countDocuments({});
        totalStoreManagers = await User.countDocuments({ role: 'Shopkeeper' });
        totalDeliveryPartners = await User.countDocuments({ role: 'Delivery Partner' });
        activeDeliveries = await DeliveryTask.countDocuments({ status: { $in: ['ACCEPTED', 'ARRIVED_AT_STORE', 'PICKED_UP', 'OUT_FOR_DELIVERY'] } });
      }

      // Compute Branch-wise Breakdown for All Stores
      const stores = await Store.find().sort({ createdAt: 1 });
      const allOrders = targetStoreId ? await Order.find({}) : orders;
      const storeStaffUsers = await User.find({ role: { $in: ['Shopkeeper', 'Store Manager'] } });

      const branchBreakdown = await Promise.all(stores.map(async (st) => {
        const storeOrders = allOrders.filter(o => o.storeId === st.id || o.shopkeeperId === st.id || o.shopkeeperId === st.managerId);
        const storeTodaysOrders = storeOrders.filter(o => isDateToday(o.createdAt));
        const storeTodaysRevenue = storeTodaysOrders.reduce((sum, o) => sum + (Number(o.grandTotal) || Number(o.totalAmount) || 0), 0);
        const storeRevenue = storeOrders.reduce((sum, o) => sum + (Number(o.grandTotal) || Number(o.totalAmount) || 0), 0);
        const storePending = storeOrders.filter(o => ['PLACED', 'PENDING', 'ACCEPTED', 'CONFIRMED', 'PICKING', 'PREPARING'].includes(o.status)).length;
        const storeDelivered = storeOrders.filter(o => o.status === 'DELIVERED').length;
        const storeLowStock = await StoreInventory.countDocuments({ storeId: st.id, stock: { $lte: 10 } });
        const storeTotalProducts = await StoreInventory.countDocuments({ storeId: st.id });
        const manager = storeStaffUsers.find(u => u.id === st.managerId || u.storeId === st.id);

        return {
          id: st.id,
          name: st.name,
          address: st.address?.line1 || st.address || 'Local Market',
          active: st.active !== false,
          managerId: st.managerId,
          managerName: manager?.name || 'Assigned Manager',
          managerPhone: manager?.phone || '',
          managerEmail: manager?.email || '',
          totalOrders: storeOrders.length,
          todaysOrders: storeTodaysOrders.length,
          todaysRevenue: storeTodaysRevenue,
          totalRevenue: storeRevenue,
          pendingOrders: storePending,
          deliveredOrders: storeDelivered,
          lowStockCount: storeLowStock,
          totalProducts: storeTotalProducts
        };
      }));

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
        totalSales: totalLifetimeSales,
        totalOrders: orders.length,
        activeOrders: pendingOrders,
        branchBreakdown
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
