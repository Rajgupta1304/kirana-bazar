import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Store from '../models/Store.js';
import StoreStaff from '../models/StoreStaff.js';
import { isMongoConnected } from '../db/connect.js';

const router = express.Router();

// GET /api/users (Pure Database Query)
router.get('/', async (req, res) => {
  try {
    if (!isMongoConnected) {
      return res.status(503).json({ error: 'Database service is currently unavailable.' });
    }
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users (Create User / Shopkeeper directly by Admin)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, password, role, shopName, address, storeId, vehicle, status } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Name, email, phone, and password are required.' });
    }

    const assignedRole = ['Customer', 'Shopkeeper', 'Admin', 'Delivery Partner'].includes(role) ? role : 'Customer';
    const userId = (assignedRole === 'Shopkeeper' ? 'shop_' : 'usr_') + Date.now();
    
    // Note: shopName and address are omitted from User model in new architecture
    const newUserObj = {
      id: userId,
      name,
      email: email.toLowerCase(),
      phone,
      password, // Note: In production this must be hashed
      role: assignedRole,
      status: status || 'Active',
      vehicle: vehicle || 'EV Scooter',
      createdAt: new Date()
    };

    if (isMongoConnected) {
      const existing = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { phone }]
      });
      if (existing) {
        return res.status(400).json({ error: 'User with this email or phone already exists.' });
      }
      
      const created = await User.create(newUserObj);

      // If creating a Shopkeeper, also initialize their Store and StoreStaff mappings!
      if (assignedRole === 'Shopkeeper') {
        let targetStoreId = storeId;
        
        if (!targetStoreId || targetStoreId === 'NEW') {
          targetStoreId = 'store_' + Date.now();
          await Store.create({
            id: targetStoreId,
            name: shopName || `${name}'s Kirana Store`,
            managerId: userId, // legacy link
            address: {
              line1: address || 'Shop 14, Main Market',
              area: 'Sector 15',
              city: 'Gurgaon',
              state: 'Haryana',
              pincode: '122001'
            },
            status: 'ACTIVE'
          });
        }

        await StoreStaff.create({
          id: 'staff_' + Date.now(),
          userId: userId,
          storeId: targetStoreId,
          role: 'STORE_MANAGER'
        });
      }

      return res.status(201).json(created);
    } else {
      return res.status(503).json({ error: 'Database service is currently unavailable.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/users/:id (Profile update)
router.patch('/:id', async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;

    if (!isMongoConnected) {
      return res.status(503).json({ error: 'Database service is currently unavailable.' });
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isObjectId
      ? { $or: [{ id: req.params.id }, { _id: req.params.id }, { email: req.params.id }] }
      : { $or: [{ id: req.params.id }, { email: req.params.id }] };

    const updated = await User.findOneAndUpdate(
      query,
      { $set: updateData },
      { new: true }
    );
    if (updated) {
      return res.json(updated);
    }
    return res.status(404).json({ error: 'User not found in database' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/users/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!isMongoConnected) {
      return res.status(503).json({ error: 'Database service is currently unavailable.' });
    }

    const updated = await User.findOneAndUpdate(
      { id: req.params.id },
      { status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'User not found in database' });
    return res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/users/:id/role
router.patch('/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['Customer', 'Admin', 'Shopkeeper', 'Delivery Partner'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    if (!isMongoConnected) {
      return res.status(503).json({ error: 'Database service is currently unavailable.' });
    }

    const updated = await User.findOneAndUpdate(
      { id: req.params.id },
      { role },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'User not found in database' });
    return res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
  try {
    if (!isMongoConnected) {
      return res.status(503).json({ error: 'Database service is currently unavailable.' });
    }

    const deleted = await User.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'User not found in database' });
    return res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
