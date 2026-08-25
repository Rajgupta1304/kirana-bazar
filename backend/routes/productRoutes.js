import express from 'express';
import Product from '../models/Product.js';
import StoreInventory from '../models/StoreInventory.js';
import StoreStaff from '../models/StoreStaff.js';
import { isMongoConnected } from '../db/connect.js';
import { authMiddleware, requireShopkeeper } from '../middleware/authMiddleware.js';

const router = express.Router();

let memoryProducts = []; // Deprecated

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
          
          // Return the master product structure, augmented with store data if it exists
          return {
            id: prod.id,
            name: prod.name,
            categoryId: prod.categoryId,
            categoryName: prod.categoryName,
            unit: prod.unit,
            price: inv ? (inv.price || inv.sellingPrice) : null,
            mrp: inv ? (inv.mrp || prod.mrp) : prod.mrp,
            stock: inv ? inv.stock : null,
            rating: prod.rating,
            deliveryTime: prod.deliveryTime,
            image: prod.image,
            description: prod.description,
            storeId: targetStoreId,
            inStore: !!inv
          };
        });

        return res.json(merged);
      } else {
        // Return master catalog
        const products = await Product.find().sort({ createdAt: -1 });
        return res.json(products);
      }
    } else {
      res.json(memoryProducts);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products
// Master catalog creation
router.post('/', async (req, res) => {
  try {
    const { name, categoryId, categoryName, unit, mrp, image, description } = req.body;
    if (!name || !mrp) {
      return res.status(400).json({ error: 'Name and MRP are required.' });
    }

    const newProd = {
      id: 'prod_' + Date.now(),
      name,
      categoryId: categoryId || 'cat_1',
      categoryName: categoryName || 'General',
      unit: unit || '500 g',
      price: parseFloat(mrp), // default master price = mrp
      mrp: parseFloat(mrp),
      rating: 4.8,
      deliveryTime: '8-10 MINS',
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
