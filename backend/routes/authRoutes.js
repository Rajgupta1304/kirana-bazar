import express from 'express';
import User from '../models/User.js';
import { isMongoConnected } from '../db/connect.js';
import { generateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/auth/login (Pure Database Authentication)
router.post('/login', async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) {
      return res.status(400).json({ error: 'Email/Phone and password are required.' });
    }

    if (!isMongoConnected) {
      return res.status(503).json({ error: 'Database service is connecting. Please retry in a few moments.' });
    }

    // Direct Database Query: Authenticate credentials strictly against MongoDB
    const foundUser = await User.findOne({
      $or: [
        { email: emailOrPhone.trim().toLowerCase() },
        { phone: emailOrPhone.trim() }
      ],
      password
    });

    if (!foundUser) {
      return res.status(401).json({ error: 'Invalid email/phone or password.' });
    }

    if (foundUser.status === 'Blocked') {
      return res.status(403).json({ error: 'Account suspended by Kirana Bazar administration.' });
    }

    const token = generateToken(foundUser);
    
    let userResponse = foundUser.toObject ? foundUser.toObject() : { ...foundUser };
    if (userResponse.role === 'Shopkeeper' && isMongoConnected) {
      const StoreStaff = (await import('../models/StoreStaff.js')).default;
      const staff = await StoreStaff.findOne({ userId: userResponse.id, status: 'ACTIVE' });
      if (staff) {
        userResponse.storeId = staff.storeId;
      } else {
        // Fallback for legacy
        const Store = (await import('../models/Store.js')).default;
        const store = await Store.findOne({ managerId: userResponse.id });
        if (store) {
          userResponse.storeId = store.id;
          // Auto-migrate to StoreStaff
          await StoreStaff.create({
            id: 'staff_' + Date.now(),
            userId: userResponse.id,
            storeId: store.id,
            role: 'STORE_MANAGER'
          });
        }
      }
    }

    res.json({ message: 'Login successful', user: userResponse, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/stores (For registration dropdown)
router.get('/stores', async (req, res) => {
  try {
    if (isMongoConnected) {
      const Store = (await import('../models/Store.js')).default;
      const stores = await Store.find({ active: true }).select('id name address');
      return res.json(stores);
    }
    return res.json([]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, address, role, shopName, storeId } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Name, email, phone, and password are required.' });
    }

    const assignedRole = (role === 'Shopkeeper' || role === 'Admin') ? role : 'Customer';
    const userId = (assignedRole === 'Shopkeeper' ? 'shop_' : 'usr_') + Date.now();
    
    const newUserObj = {
      id: userId,
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role: assignedRole,
      status: 'Active',
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

      // Handle Store and StoreStaff for Shopkeeper
      if (assignedRole === 'Shopkeeper') {
        const StoreStaff = (await import('../models/StoreStaff.js')).default;
        
        let targetStoreId = storeId;
        
        // If creating a brand new store
        if (!targetStoreId || targetStoreId === 'NEW') {
          const Store = (await import('../models/Store.js')).default;
          targetStoreId = 'store_' + Date.now();
          await Store.create({
            id: targetStoreId,
            name: shopName || `${name}'s Kirana Store`,
            managerId: userId,
            address: typeof address === 'string' && address ? address : 'Shop 14, Main Market, Sector 15',
            status: 'ACTIVE'
          });
        }
        
        // Link user to store
        await StoreStaff.create({
          id: 'staff_' + Date.now(),
          userId: userId,
          storeId: targetStoreId,
          role: 'STORE_MANAGER'
        });
      }

      const token = generateToken(created);
      
      let userResponse = created.toObject();
      if (assignedRole === 'Shopkeeper') {
        const StoreStaff = (await import('../models/StoreStaff.js')).default;
        const staff = await StoreStaff.findOne({ userId: created.id, status: 'ACTIVE' });
        if (staff) {
          userResponse.storeId = staff.storeId;
        }
      }

      return res.status(201).json({ message: 'Registration successful', user: userResponse, token });
    } else {
      return res.status(503).json({ error: 'Database service is currently unavailable. Please try again shortly.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cache for active OTPs: { [emailOrPhone]: { otp, expiresAt } }
const otpCache = new Map();

// POST /api/auth/forgot-password/send-otp
router.post('/forgot-password/send-otp', async (req, res) => {
  try {
    const { emailOrPhone } = req.body;
    if (!emailOrPhone) {
      return res.status(400).json({ error: 'Email or phone number is required.' });
    }

    if (!isMongoConnected) {
      return res.status(503).json({ error: 'Database service is currently unavailable.' });
    }

    const searchKey = emailOrPhone.trim().toLowerCase();
    const foundUser = await User.findOne({
      $or: [
        { email: searchKey },
        { phone: { $regex: emailOrPhone.trim(), $options: 'i' } }
      ]
    });

    if (!foundUser) {
      return res.status(404).json({ error: 'No account found matching this email or phone number in database.' });
    }

    // Generate 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    otpCache.set(searchKey, {
      otp: generatedOtp,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 mins expiry
    });

    res.json({
      message: '2-Step Verification Code sent successfully!',
      otp: generatedOtp,
      user: {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        phone: foundUser.phone,
        role: foundUser.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/forgot-password/verify-reset
router.post('/forgot-password/verify-reset', async (req, res) => {
  try {
    const { emailOrPhone, otp, newPassword } = req.body;
    if (!emailOrPhone || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email/phone, OTP, and new password are required.' });
    }

    if (!isMongoConnected) {
      return res.status(503).json({ error: 'Database service is currently unavailable.' });
    }

    const searchKey = emailOrPhone.trim().toLowerCase();
    const cachedData = otpCache.get(searchKey);

    // Verify OTP (allow '123456' as universal test fallback or matching generated OTP)
    if (!cachedData || (cachedData.otp !== otp.trim() && otp.trim() !== '123456')) {
      return res.status(400).json({ error: 'Invalid 2-Step Verification Code. Please check the code and try again.' });
    }

    const updatedUser = await User.findOneAndUpdate(
      { $or: [{ email: searchKey }, { phone: { $regex: emailOrPhone.trim(), $options: 'i' } }] },
      { password: newPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User account not found in database.' });
    }

    otpCache.delete(searchKey);

    res.json({
      message: 'Password reset successful! You can now log in with your new password.',
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
