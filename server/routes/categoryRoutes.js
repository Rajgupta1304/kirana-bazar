import express from 'express';
import Category from '../models/Category.js';
import { isMongoConnected } from '../db/connect.js';

const router = express.Router();

let memoryCategories = [
  { id: 'cat_1', name: 'Dairy, Bread & Egg', icon: '🥛', color: 'bg-blue-50 text-blue-700' },
  { id: 'cat_2', name: 'Fruits & Vegetables', icon: '🥦', color: 'bg-green-50 text-green-700' },
  { id: 'cat_3', name: 'Munchies & Snacks', icon: '🍿', color: 'bg-yellow-50 text-yellow-700' },
  { id: 'cat_4', name: 'Cold Drinks & Juices', icon: '🥤', color: 'bg-red-50 text-red-700' }
];

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const { shopkeeperId } = req.query;
    if (isMongoConnected) {
      const query = shopkeeperId ? { $or: [{ shopkeeperId }, { shopkeeperId: '' }, { shopkeeperId: { $exists: false } }] } : {};
      const categories = await Category.find(query);
      res.json(categories);
    } else {
      if (shopkeeperId) {
        return res.json(memoryCategories.filter(c => !c.shopkeeperId || c.shopkeeperId === shopkeeperId));
      }
      res.json(memoryCategories);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/categories
router.post('/', async (req, res) => {
  try {
    const { name, icon, shopkeeperId } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const newCat = {
      id: 'cat_' + Date.now(),
      name,
      icon: icon || '🛍️',
      color: 'bg-emerald-50 text-emerald-700',
      shopkeeperId: shopkeeperId || ''
    };

    if (isMongoConnected) {
      const created = await Category.create(newCat);
      res.status(201).json(created);
    } else {
      memoryCategories.push(newCat);
      res.status(201).json(newCat);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    if (isMongoConnected) {
      await Category.deleteOne({ id: req.params.id });
    } else {
      memoryCategories = memoryCategories.filter(c => c.id !== req.params.id);
    }
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
