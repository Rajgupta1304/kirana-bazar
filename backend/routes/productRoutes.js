import express from 'express';
import Product from '../models/Product.js';
import StoreInventory from '../models/StoreInventory.js';
import StoreStaff from '../models/StoreStaff.js';
import { isMongoConnected } from '../db/connect.js';
import { authMiddleware, requireShopkeeper } from '../middleware/authMiddleware.js';

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
    stock: 43,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80',
    description: 'Pasteurized toned milk packed with essentials calcium and protein.',
    inStore: true,
    storeId: 'store_1'
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
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
    description: 'Soft, freshly baked white bread slices.',
    inStore: true,
    storeId: 'store_1'
  },
  {
    id: 'prod_3',
    name: 'Farm Fresh Organic Eggs (6 Pcs)',
    categoryId: 'cat_1',
    categoryName: 'Dairy, Bread & Egg',
    unit: '6 units',
    price: 64,
    mrp: 75,
    stock: 22,
    image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=400&q=80',
    description: 'Rich in protein, farm fresh brown eggs.',
    inStore: true,
    storeId: 'store_1'
  },
  {
    id: 'prod_4',
    name: 'Fresh Hydroponic Tomatoes',
    categoryId: 'cat_2',
    categoryName: 'Fruits & Vegetables',
    unit: '500 g',
    price: 32,
    mrp: 40,
    stock: 17,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
    description: 'Juicy, plump red tomatoes directly sourced from local sustainable farms.',
    inStore: true,
    storeId: 'store_1'
  },
  {
    id: 'prod_5',
    name: 'Crisp Green Farm Broccoli',
    categoryId: 'cat_2',
    categoryName: 'Fruits & Vegetables',
    unit: '1 pc (approx 350g)',
    price: 79,
    mrp: 99,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=400&q=80',
    description: 'Nutrient-rich fresh green broccoli head.',
    inStore: true,
    storeId: 'store_1'
  },
  {
    id: 'prod_6',
    name: "Lay's India's Magic Masala Chips",
    categoryId: 'cat_3',
    categoryName: 'Munchies & Snacks',
    unit: '115 g',
    price: 50,
    mrp: 50,
    stock: 52,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80',
    description: 'Crunchy potato chips seasoned with aromatic Indian spices.',
    inStore: true,
    storeId: 'store_1'
  },
  {
    id: 'prod_7',
    name: 'Doritos Nacho Cheese Tortilla',
    categoryId: 'cat_3',
    categoryName: 'Munchies & Snacks',
    unit: '150 g',
    price: 85,
    mrp: 90,
    stock: 39,
    image: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=400&q=80',
    description: 'Bold cheesy crunch made from real corn.',
    inStore: true,
    storeId: 'store_1'
  },
  {
    id: 'prod_8',
    name: 'Coca-Cola Zero Sugar Can',
    categoryId: 'cat_4',
    categoryName: 'Cold Drinks & Juices',
    unit: '300 ml',
    price: 40,
    mrp: 40,
    stock: 55,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80',
    description: 'Chilled sparkling soft drink with zero sugar and maximum refreshment.',
    inStore: true,
    storeId: 'store_1'
  },
  {
    id: 'prod_1787675778746',
    name: 'Dal',
    categoryId: 'cat_7',
    categoryName: 'Atta, Rice & Dal',
    unit: '500 g',
    price: 100,
    mrp: 120,
    stock: 24,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
    description: 'Fresh organic yellow dal.',
    inStore: true,
    storeId: 'store_1'
  }
];

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { storeId, shopkeeperId } = req.query; // shopkeeperId legacy compat

    if (isMongoConnected) {
      const targetStoreId = storeId || shopkeeperId; // legacy compat

      if (targetStoreId) {
        const inventories = await StoreInventory.find({ storeId: targetStoreId, isAvailable: true });
        const products = await Product.find().sort({ createdAt: -1 });

        // Merge product data with store inventory data
        const merged = products.map(prod => {
          const inv = inventories.find(i => i.productId === prod.id);
          const price = inv ? (inv.price || inv.sellingPrice) : (prod.price || prod.mrp || 30);
          const mrp = inv ? (inv.mrp || prod.mrp) : (prod.mrp || price);
          const stock = inv ? inv.stock : (prod.stock !== undefined && prod.stock !== null ? prod.stock : 25);
          
          return {
            id: prod.id,
            name: prod.name,
            categoryId: prod.categoryId,
            categoryName: prod.categoryName,
            unit: prod.unit,
            price,
            mrp,
            stock,
            rating: prod.rating || 4.8,
            deliveryTime: prod.deliveryTime || '8 mins',
            image: prod.image,
            description: prod.description || '',
            storeId: targetStoreId,
            inStore: true
          };
        });

        if (merged.length > 0) {
          return res.json(merged);
        }
      }

      // Return master catalog augmented with inventory pricing
      const inventories = await StoreInventory.find({ isAvailable: true });
      const products = await Product.find().sort({ createdAt: -1 });

      if (products.length > 0) {
        const merged = products.map(prod => {
          const inv = inventories.find(i => i.productId === prod.id);
          const totalStock = inventories
            .filter(i => i.productId === prod.id)
            .reduce((sum, i) => sum + (i.stock || 0), 0);

          const prodObj = prod.toObject ? prod.toObject() : prod;
          const price = prodObj.price !== undefined && prodObj.price !== null ? prodObj.price : (inv ? (inv.price || inv.sellingPrice) : (prodObj.mrp || 30));
          const stock = prodObj.stock !== undefined && prodObj.stock !== null ? prodObj.stock : (totalStock > 0 ? totalStock : 25);

          return {
            ...prodObj,
            price,
            mrp: prodObj.mrp || (inv ? inv.mrp : price),
            stock,
            inStore: true
          };
        });

        return res.json(merged);
      }
    }

    res.json(memoryProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products
// Master catalog creation
router.post('/', async (req, res) => {
  try {
    const { name, categoryId, categoryName, unit, image, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required.' });
    }

    const newProd = {
      id: 'prod_' + Date.now(),
      name,
      categoryId: categoryId || 'cat_1',
      categoryName: categoryName || 'General',
      unit: unit || '500 g',
      ratingAverage: 4.8,
      ratingCount: 0,
      image: image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
      description: description || ''
    };

    if (isMongoConnected) {
      const created = await Product.create(newProd);
      return res.status(201).json(created);
    }
    return res.status(500).json({ error: 'MongoDB required' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    if (isMongoConnected) {
      await Product.deleteOne({ id: req.params.id });
      await StoreInventory.deleteMany({ productId: req.params.id });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products/inventory
// Add a master product to a specific store's inventory
router.post('/inventory', authMiddleware, requireShopkeeper, async (req, res) => {
  try {
    const { storeId, productId, price, mrp, stock } = req.body;
    let targetStoreId = storeId;

    if (isMongoConnected) {
      if (req.user.role === 'Shopkeeper') {
        const staff = await StoreStaff.findOne({ userId: req.user.id, status: 'ACTIVE' });
        if (!staff) return res.status(403).json({ error: 'Store not assigned' });
        targetStoreId = staff.storeId;
      }

      if (!targetStoreId || !productId || !price) {
        return res.status(400).json({ error: 'Store ID, Product ID, and Price are required.' });
      }

      // Check if already in inventory
      let inv = await StoreInventory.findOne({ storeId, productId });
      if (inv) {
        return res.status(400).json({ error: 'Product is already in your store inventory. Please update the stock instead.' });
      }

      const initialStock = stock || 0;
      inv = await StoreInventory.create({
        id: 'inv_' + Date.now() + Math.floor(Math.random() * 1000),
        storeId: targetStoreId,
        productId,
        price,
        mrp: mrp || price,
        stock: initialStock,
        isAvailable: true
      });

      // Import dynamically or ensure InventoryTransaction is available
      const InventoryTransaction = (await import('../models/InventoryTransaction.js')).default;
      await InventoryTransaction.create({
        storeId: targetStoreId,
        productId,
        type: 'STOCK_IN',
        quantity: initialStock,
        previousStock: 0,
        newStock: initialStock,
        reason: 'Added to Store Catalog',
        createdBy: targetStoreId // representing the shopkeeper
      });

      return res.status(201).json(inv);
    }
    return res.status(500).json({ error: 'MongoDB required' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/products/:id/stock
// Update stock in StoreInventory
router.patch('/:id/stock', authMiddleware, requireShopkeeper, async (req, res) => {
  try {
    const { stock, storeId } = req.body;
    let targetStoreId = storeId;

    if (isMongoConnected) {
      if (req.user.role === 'Shopkeeper') {
        const staff = await StoreStaff.findOne({ userId: req.user.id, status: 'ACTIVE' });
        if (!staff) return res.status(403).json({ error: 'Store not assigned' });
        targetStoreId = staff.storeId;
      }

      if (!targetStoreId) return res.status(400).json({ error: 'storeId required' });

      const inv = await StoreInventory.findOne({ productId: req.params.id, storeId: targetStoreId });
      if (!inv) return res.status(404).json({ error: 'Inventory not found' });

      // Import dynamically
      const InventoryTransaction = (await import('../models/InventoryTransaction.js')).default;
      
      const prevStock = inv.stock;
      inv.stock = stock;
      await inv.save();

      await InventoryTransaction.create({
        storeId: targetStoreId,
        productId: req.params.id,
        type: stock > prevStock ? 'STOCK_IN' : 'STOCK_OUT',
        quantity: Math.abs(stock - prevStock),
        previousStock: prevStock,
        newStock: stock,
        reason: 'Manual adjustment',
        createdBy: targetStoreId
      });

      return res.json(inv);
    }
    return res.status(500).json({ error: 'MongoDB required' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
