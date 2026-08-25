import express from 'express';
import User from '../models/User.js';
import Store from '../models/Store.js';
import StoreStaff from '../models/StoreStaff.js';
import { isMongoConnected } from '../db/connect.js';

const router = express.Router();

let memoryUsers = [
  {
    id: 'usr_1',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    phone: '+91 98989 12345',
    password: 'user123',
    role: 'Customer',
    status: 'Active',
    shopName: '',
    address: 'B-12, Sector 14, Metro Heights'
  },
  {
    id: 'admin_1',
    name: 'Store Manager (Admin)',
    email: 'admin@kiranabazar.com',
    phone: '+91 99999 88888',
    password: 'admin123',
    role: 'Admin',
    status: 'Active',
    shopName: '',
    address: 'Kirana Bazar Warehouse Dark Store #402'
  },
  {
    id: 'shop_1',
    name: 'Sharma Kirana Store',
    email: 'shopkeeper@kiranabazar.com',
    phone: '+91 98765 43210',
    password: 'shop123',
    role: 'Shopkeeper',
    status: 'Active',
    shopName: 'Sharma General & Grocery Store',
    address: 'Shop 14, Main Market, Sector 15'
  }
];

// GET /api/users
router.get('/', async (req, res) => {
  try {
    if (isMongoConnected) {
      const users = await User.find().sort({ createdAt: -1 });
      res.json(users);
    } else {
      res.json(memoryUsers);
    }
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
      const existing = memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase() || u.phone === phone);
      if (existing) {
        return res.status(400).json({ error: 'User with this email or phone already exists.' });
      }
      memoryUsers.unshift(newUserObj);
      return res.status(201).json(newUserObj);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/users/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (isMongoConnected) {
      const updated = await User.findOneAndUpdate(
        { id: req.params.id },
        { status },
        { new: true }
      );
      return res.json(updated);
    } else {
      const user = memoryUsers.find(u => u.id === req.params.id);
      if (user) {
        user.status = status;
        return res.json(user);
      }
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/users/:id/role
router.patch('/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['Customer', 'Admin', 'Shopkeeper'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    if (isMongoConnected) {
      const updated = await User.findOneAndUpdate(
        { id: req.params.id },
        { role },
        { new: true }
      );
      return res.json(updated);
    } else {
      const user = memoryUsers.find(u => u.id === req.params.id);
      if (user) {
        user.role = role;
        return res.json(user);
      }
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
  try {
    if (isMongoConnected) {
      const deleted = await User.findOneAndDelete({ id: req.params.id });
      if (!deleted) return res.status(404).json({ error: 'User not found' });
      return res.json({ message: 'User deleted successfully' });
    } else {
      const index = memoryUsers.findIndex(u => u.id === req.params.id);
      if (index !== -1) {
        memoryUsers.splice(index, 1);
        return res.json({ message: 'User deleted successfully' });
      }
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
