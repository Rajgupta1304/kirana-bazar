import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'kirana_bazar_secret_key_123';

export const generateToken = (user) => {
  return jwt.sign({
    id: user.id || user._id,
    role: user.role,
    storeId: user.storeId || null
  }, JWT_SECRET, { expiresIn: '7d' });
};

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role, storeId }
    
    // Auto-resolve storeId if missing from token
    if (!req.user.storeId && (req.user.role === 'Shopkeeper' || req.user.role === 'Store Manager')) {
      try {
        const StoreStaff = (await import('../models/StoreStaff.js')).default;
        const staff = await StoreStaff.findOne({ userId: req.user.id, status: 'ACTIVE' });
        if (staff && staff.storeId) {
          req.user.storeId = staff.storeId;
        } else {
          req.user.storeId = 'store_1';
        }
      } catch (_) {
        req.user.storeId = 'store_1';
      }
    }
    
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Forbidden. Invalid token.' });
  }
};

export const requireShopkeeper = (req, res, next) => {
  if (req.user && (req.user.role === 'Shopkeeper' || req.user.role === 'Admin')) {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden. Shopkeeper access required.' });
  }
};
