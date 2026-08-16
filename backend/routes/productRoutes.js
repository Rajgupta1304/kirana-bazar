import express from 'express';
import Product from '../models/Product.js';
import { isMongoConnected } from '../db/connect.js';

const router = express.Router();

let memoryProducts = [
  {
    id: 'prod_1',
    name: 'Amul Taaza Toned Fresh Milk',
    categoryId: 'cat_1',
    categoryName: 'Dairy, Bread & Egg',
    unit: '500 ml',
    price: 27,
    mrp: 30,
    stock: 45,
    rating: 4.8,
    deliveryTime: '8 MINS',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80',
    description: 'Pasteurized toned milk packed with calcium and protein.'
  },
  {
    id: 'prod_2',
    name: 'Harvest Gold White Bread',
    categoryId: 'cat_1',
    categoryName: 'Dairy, Bread & Egg',
    unit: '400 g',
    price: 45,
    mrp: 50,
    stock: 30,
    rating: 4.6,
    deliveryTime: '10 MINS',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
    description: 'Soft freshly baked white bread slices.'
  },
  {
    id: 'prod_6',
    name: 'Lay\'s India\'s Magic Masala Chips',
    categoryId: 'cat_3',
    categoryName: 'Munchies & Snacks',
    unit: '115 g',
    price: 50,
    mrp: 50,
    stock: 55,
    rating: 4.9,
    deliveryTime: '7 MINS',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80',
    description: 'Crunchy potato chips.'
  }
];

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { shopkeeperId } = req.query;
    if (isMongoConnected) {
      const query = shopkeeperId ? { shopkeeperId } : {};
      const products = await Product.find(query).sort({ createdAt: -1 });
      res.json(products);
    } else {
      if (shopkeeperId) {
        return res.json(memoryProducts.filter(p => p.shopkeeperId === shopkeeperId));
      }
      res.json(memoryProducts);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products
router.post('/', async (req, res) => {
  try {
    const { name, categoryId, categoryName, unit, price, mrp, stock, image, description, shopkeeperId, shopkeeperName } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required.' });
    }

    const newProd = {
      id: 'prod_' + Date.now(),
      name,
      categoryId: categoryId || 'cat_1',
      categoryName: categoryName || 'General',
      unit: unit || '500 g',
      price: parseFloat(price),
      mrp: parseFloat(mrp || price),
      stock: parseInt(stock || 10, 10),
      rating: 4.8,
      deliveryTime: '8-10 MINS',
      image: image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
      description: description || '',
      shopkeeperId: shopkeeperId || '',
      shopkeeperName: shopkeeperName || ''
    };

    if (isMongoConnected) {
      const created = await Product.create(newProd);
      return res.status(201).json(created);
    } else {
      memoryProducts.unshift(newProd);
      return res.status(201).json(newProd);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/products/:id/stock
router.patch('/:id/stock', async (req, res) => {
  try {
    const { stock } = req.body;
    const newStock = Math.max(0, parseInt(stock, 10));

    if (isMongoConnected) {
      const updated = await Product.findOneAndUpdate(
        { id: req.params.id },
        { stock: newStock },
        { new: true }
      );
      return res.json(updated);
    } else {
      const item = memoryProducts.find(p => p.id === req.params.id);
      if (item) {
        item.stock = newStock;
        return res.json(item);
      }
      return res.status(404).json({ error: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    if (isMongoConnected) {
      await Product.deleteOne({ id: req.params.id });
    } else {
      memoryProducts = memoryProducts.filter(p => p.id !== req.params.id);
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
