import express from 'express';
import Banner from '../models/Banner.js';
import { isMongoConnected } from '../db/connect.js';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// In-memory fallback sample banners
let memoryBanners = [
  {
    id: 'bnr_1',
    title: 'Fresh Farm Vegetables',
    subtitle: 'Flat 30% OFF on Organic Veggies & Greens',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
    targetType: 'CATEGORY',
    targetValue: 'cat_2',
    displayOrder: 1,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'bnr_2',
    title: 'Morning Dairy & Breads',
    subtitle: 'Delivered Fresh to your Doorstep in 8 Mins',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1200&q=80',
    targetType: 'CATEGORY',
    targetValue: 'cat_1',
    displayOrder: 2,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'bnr_3',
    title: 'Snacks & Munchies Hub',
    subtitle: 'Crunchy Chips, Nachos & Drinks at Best Prices',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=1200&q=80',
    targetType: 'CATEGORY',
    targetValue: 'cat_3',
    displayOrder: 3,
    active: true,
    createdAt: new Date().toISOString()
  }
];

// Helper to seed banners if MongoDB collection is empty
const seedInitialBanners = async () => {
  try {
    if (isMongoConnected) {
      const count = await Banner.countDocuments();
      if (count === 0) {
        await Banner.insertMany(memoryBanners);
      }
    }
  } catch (err) {
    console.warn('Banner seed error:', err.message);
  }
};

// GET /api/banners (Public: active banners sorted by displayOrder)
router.get('/', async (req, res) => {
  try {
    if (isMongoConnected) {
      await seedInitialBanners();
      const banners = await Banner.find({ active: true }).sort({ displayOrder: 1, createdAt: -1 });
      return res.json(banners);
    }
    return res.json(memoryBanners.filter(b => b.active));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/banners/all (Admin: all banners including inactive)
router.get('/all', async (req, res) => {
  try {
    if (isMongoConnected) {
      await seedInitialBanners();
      const banners = await Banner.find().sort({ displayOrder: 1, createdAt: -1 });
      return res.json(banners);
    }
    return res.json(memoryBanners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/banners (Admin: create new banner)
router.post('/', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { title, subtitle, image, targetType, targetValue, displayOrder, active } = req.body;

    if (!title || !image) {
      return res.status(400).json({ error: 'Title and image are required.' });
    }

    const newBanner = {
      id: 'bnr_' + Date.now(),
      title,
      subtitle: subtitle || '',
      image,
      targetType: targetType || 'CATEGORY',
      targetValue: targetValue || '',
      displayOrder: Number(displayOrder || 1),
      active: active !== undefined ? Boolean(active) : true,
      createdAt: new Date()
    };

    if (isMongoConnected) {
      const created = await Banner.create(newBanner);
      return res.status(201).json(created);
    }

    memoryBanners.push(newBanner);
    return res.status(201).json(newBanner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/banners/:id (Admin: update banner)
router.put('/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { title, subtitle, image, targetType, targetValue, displayOrder, active } = req.body;

    if (isMongoConnected) {
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (subtitle !== undefined) updateData.subtitle = subtitle;
      if (image !== undefined) updateData.image = image;
      if (targetType !== undefined) updateData.targetType = targetType;
      if (targetValue !== undefined) updateData.targetValue = targetValue;
      if (displayOrder !== undefined) updateData.displayOrder = Number(displayOrder);
      if (active !== undefined) updateData.active = Boolean(active);

      const updated = await Banner.findOneAndUpdate(
        { id: req.params.id },
        { $set: updateData },
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: 'Banner not found' });
      return res.json(updated);
    }

    const idx = memoryBanners.findIndex(b => b.id === req.params.id);
    if (idx !== -1) {
      memoryBanners[idx] = { ...memoryBanners[idx], ...req.body };
      return res.json(memoryBanners[idx]);
    }
    return res.status(404).json({ error: 'Banner not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/banners/:id (Admin: delete banner)
router.delete('/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    if (isMongoConnected) {
      await Banner.deleteOne({ id: req.params.id });
    } else {
      memoryBanners = memoryBanners.filter(b => b.id !== req.params.id);
    }
    res.json({ message: 'Banner deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
