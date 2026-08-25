import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'kirana_bazar_secret_key_123';

export const generateToken = (user) => {
  return jwt.sign({ id: user.id || user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
};

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role }
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
