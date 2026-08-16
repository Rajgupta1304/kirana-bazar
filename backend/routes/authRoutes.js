import express from 'express';
import User from '../models/User.js';
import { isMongoConnected } from '../db/connect.js';

const router = express.Router();

// Fallback memory store if MongoDB is offline
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

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) {
      return res.status(400).json({ error: 'Email/Phone and password are required.' });
    }

    let foundUser;
    if (isMongoConnected) {
      foundUser = await User.findOne({
        $or: [
          { email: emailOrPhone.toLowerCase() },
          { phone: emailOrPhone }
        ],
        password
      });
    } else {
      foundUser = memoryUsers.find(
        u => (u.email.toLowerCase() === emailOrPhone.toLowerCase() || u.phone.includes(emailOrPhone)) &&
             u.password === password
      );
    }

    if (!foundUser) {
      return res.status(401).json({ error: 'Invalid email/phone or password.' });
    }

    if (foundUser.status === 'Blocked') {
      return res.status(403).json({ error: 'Account suspended by Kirana Bazar administration.' });
    }

    res.json({ message: 'Login successful', user: foundUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, address, role, shopName } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Name, email, phone, and password are required.' });
    }

    const assignedRole = (role === 'Shopkeeper' || role === 'Admin') ? role : 'Customer';
    const newUserObj = {
      id: (assignedRole === 'Shopkeeper' ? 'shop_' : 'usr_') + Date.now(),
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role: assignedRole,
      status: 'Active',
      shopName: shopName || (assignedRole === 'Shopkeeper' ? `${name}'s Kirana Store` : ''),
      address: address || 'B-12, Sector 14, Metro Heights',
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
      return res.status(201).json({ message: 'Registration successful', user: created });
    } else {
      const existing = memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase() || u.phone === phone);
      if (existing) {
        return res.status(400).json({ error: 'User with this email or phone already exists.' });
      }
      memoryUsers.push(newUserObj);
      return res.status(201).json({ message: 'Registration successful', user: newUserObj });
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

    const searchKey = emailOrPhone.trim().toLowerCase();
    let foundUser;

    if (isMongoConnected) {
      foundUser = await User.findOne({
        $or: [
          { email: searchKey },
          { phone: { $regex: emailOrPhone.trim(), $options: 'i' } }
        ]
      });
    } else {
      foundUser = memoryUsers.find(
        u => u.email.toLowerCase() === searchKey || u.phone.includes(emailOrPhone.trim())
      );
    }

    if (!foundUser) {
      return res.status(404).json({ error: 'No account found matching this email or phone number.' });
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

    const searchKey = emailOrPhone.trim().toLowerCase();
    const cachedData = otpCache.get(searchKey);

    // Verify OTP (allow '123456' as universal test fallback or matching generated OTP)
    if (!cachedData || (cachedData.otp !== otp.trim() && otp.trim() !== '123456')) {
      return res.status(400).json({ error: 'Invalid 2-Step Verification Code. Please check the code and try again.' });
    }

    let updatedUser;
    if (isMongoConnected) {
      updatedUser = await User.findOneAndUpdate(
        { $or: [{ email: searchKey }, { phone: { $regex: emailOrPhone.trim(), $options: 'i' } }] },
        { password: newPassword },
        { new: true }
      );
    } else {
      updatedUser = memoryUsers.find(
        u => u.email.toLowerCase() === searchKey || u.phone.includes(emailOrPhone.trim())
      );
      if (updatedUser) {
        updatedUser.password = newPassword;
      }
    }

    if (!updatedUser) {
      return res.status(404).json({ error: 'User account not found.' });
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
