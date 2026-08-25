import express from 'express';
import Store from '../models/Store.js';
import StoreStaff from '../models/StoreStaff.js';
import User from '../models/User.js';
import { isMongoConnected } from '../db/connect.js';

const router = express.Router();

// GET /api/stores (Get all stores)
router.get('/', async (req, res) => {
  try {
    if (!isMongoConnected) return res.json([]);
    const stores = await Store.find().sort({ createdAt: -1 });
    // Also fetch staff counts or managers if needed
    res.json(stores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/stores (Create a new store)
router.post('/', async (req, res) => {
  try {
    const { name, address, active } = req.body;
    if (!name || !address) return res.status(400).json({ error: 'Name and address required' });
    
    if (isMongoConnected) {
      const newStore = await Store.create({
        id: 'store_' + Date.now(),
        name,
        managerId: 'system', // Default until assigned
        address: address,
        active: active !== undefined ? active : true
      });
      res.status(201).json(newStore);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/stores/:id (Update store)
router.patch('/:id', async (req, res) => {
  try {
    const { name, address, active } = req.body;
    if (isMongoConnected) {
      const updated = await Store.findOneAndUpdate(
        { id: req.params.id },
        { name, address, active },
        { new: true }
      );
      res.json(updated);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stores/:id/staff (Get staff assigned to a store)
router.get('/:id/staff', async (req, res) => {
  try {
    if (isMongoConnected) {
      const staffMappings = await StoreStaff.find({ storeId: req.params.id, status: 'ACTIVE' });
      const userIds = staffMappings.map(s => s.userId);
      const users = await User.find({ id: { $in: userIds } }).select('id name email phone role status');
      
      const mapped = users.map(u => {
        const mapping = staffMappings.find(s => s.userId === u.id);
        return {
          ...u.toObject(),
          storeRole: mapping.role
        };
      });
      res.json(mapped);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
