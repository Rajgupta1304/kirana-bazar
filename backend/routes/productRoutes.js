import express from 'express';
import Product from '../models/Product.js';
import StoreInventory from '../models/StoreInventory.js';
import StoreStaff from '../models/StoreStaff.js';
import PriceChangeRequest from '../models/PriceChangeRequest.js';
import Store from '../models/Store.js';
import { isMongoConnected } from '../db/connect.js';
import { authMiddleware, requireShopkeeper, requireAdmin } from '../middleware/authMiddleware.js';

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
      let targetStoreId = storeId || shopkeeperId; // legacy compat

      if (targetStoreId) {
        // Resolve targetStoreId if it is a shopkeeper user ID (e.g. shop_1 or usr_...)
        let possibleStoreIds = [targetStoreId];
        if (targetStoreId.startsWith('shop_') || targetStoreId.startsWith('usr_')) {
          const staff = await StoreStaff.findOne({ userId: targetStoreId, status: 'ACTIVE' });
          if (staff && staff.storeId) {
            possibleStoreIds.push(staff.storeId);
            targetStoreId = staff.storeId;
          } else {
            const store = await Store.findOne({ managerId: targetStoreId });
            if (store && store.id) {
              possibleStoreIds.push(store.id);
              targetStoreId = store.id;
            }
          }
        } else if (targetStoreId.startsWith('store_')) {
          const staff = await StoreStaff.findOne({ storeId: targetStoreId, status: 'ACTIVE' });
          if (staff && staff.userId) {
            possibleStoreIds.push(staff.userId);
          }
        }

        const inventories = await StoreInventory.find({
          storeId: { $in: possibleStoreIds },
          isAvailable: { $ne: false }
        });

        // Also fetch approved price requests for this store to guarantee immediate price reflection
        const approvedPriceReqs = await PriceChangeRequest.find({
          storeId: { $in: possibleStoreIds },
          status: 'APPROVED'
        });

        const allProducts = await Product.find().sort({ createdAt: -1 });

        // Filter products visible to this store
        const visibleProducts = allProducts.filter(prod => {
          // If product was created specifically for a store, it must match targetStoreId
          if (prod.storeId && !possibleStoreIds.includes(prod.storeId)) return false;

          // Check visibleBranches
          const branches = prod.visibleBranches || [];
          if (branches.length === 0 || branches.includes('all') || possibleStoreIds.some(s => branches.includes(s))) {
            return true;
          }
          return false;
        });

        // Merge product data with store inventory data & approved price requests
        const merged = visibleProducts.map(prod => {
          const inv = inventories.find(i => i.productId === prod.id);

          // Priority 1: Approved Price Change Request for this branch
          const approvedReq = approvedPriceReqs.find(r => r.productId === prod.id);
          const approvedPrice = approvedReq ? Number(approvedReq.counterPrice || approvedReq.requestedPrice) : null;

          let price = prod.defaultPrice || prod.price || prod.mrp || 30;
          if (approvedPrice !== null && !isNaN(approvedPrice) && approvedPrice > 0) {
            price = approvedPrice;
          } else if (inv && inv.price !== undefined && inv.price !== null) {
            price = inv.price;
          } else if (inv && inv.sellingPrice !== undefined && inv.sellingPrice !== null) {
            price = inv.sellingPrice;
          }

          const mrp = inv ? (inv.mrp || prod.mrp) : (prod.mrp || price);
          const stock = inv ? inv.stock : (prod.stock !== undefined && prod.stock !== null ? prod.stock : 0);
          
          // Self-heal: If an approved price exists without a StoreInventory entry, create it in the background
          if (approvedPrice !== null && !inv) {
            StoreInventory.create({
              id: 'inv_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
              storeId: targetStoreId,
              productId: prod.id,
              price: approvedPrice,
              sellingPrice: approvedPrice,
              mrp: mrp || approvedPrice,
              stock: stock || 25,
              isAvailable: true
            }).catch(() => {});
          }

          return {
            id: prod.id,
            name: prod.name,
            categoryId: prod.categoryId,
            categoryName: prod.categoryName,
            unit: prod.unit,
            price: Number(price),
            mrp: Number(mrp),
            stock: Number(stock),
            isAnimation: Boolean(prod.isAnimation),
            visibleBranches: prod.visibleBranches || ['all'],
            storeId: targetStoreId,
            inStore: !!inv || !!approvedReq,
            rating: prod.rating || 4.8,
            deliveryTime: prod.deliveryTime || '8 mins',
            image: prod.image,
            description: prod.description || '',
            defaultPrice: prod.defaultPrice || prod.price || price
          };
        });

        return res.json(merged);
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
          const defaultPrice = prodObj.defaultPrice || prodObj.price || (inv ? (inv.price || inv.sellingPrice) : (prodObj.mrp || 30));
          const mrp = prodObj.mrp || (inv ? inv.mrp : defaultPrice);

          return {
            ...prodObj,
            price: defaultPrice,
            defaultPrice,
            mrp,
            stock: totalStock,
            isAnimation: Boolean(prodObj.isAnimation),
            visibleBranches: prodObj.visibleBranches || ['all'],
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
// Master catalog creation (Admin Only)
router.post('/', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      categoryId,
      categoryName,
      unit,
      image,
      description,
      isAnimation,
      visibleBranches,
      defaultPrice,
      price,
      mrp
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Product name is required.' });
    }

    let assignedVisibleBranches = visibleBranches;
    if (!assignedVisibleBranches || assignedVisibleBranches.length === 0) {
      assignedVisibleBranches = ['all'];
    }

    const priceVal = Number(defaultPrice || price || 0);
    const mrpVal = Number(mrp || priceVal || 0);

    const newProd = {
      id: 'prod_' + Date.now(),
      name,
      categoryId: categoryId || 'cat_1',
      categoryName: categoryName || 'General',
      unit: unit || '500 g',
      ratingAverage: 4.8,
      ratingCount: 0,
      image: image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
      description: description || '',
      isAnimation: Boolean(isAnimation),
      visibleBranches: assignedVisibleBranches,
      storeId: null, // Master catalog product
      defaultPrice: priceVal,
      price: priceVal,
      mrp: mrpVal
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

// PUT /api/products/:id
// Update product in master catalog (Admin Only)
router.put('/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      categoryId,
      categoryName,
      unit,
      image,
      description,
      isAnimation,
      visibleBranches,
      defaultPrice,
      price,
      mrp
    } = req.body;

    if (isMongoConnected) {
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (categoryId !== undefined) updateData.categoryId = categoryId;
      if (categoryName !== undefined) updateData.categoryName = categoryName;
      if (unit !== undefined) updateData.unit = unit;
      if (image !== undefined) updateData.image = image;
      if (description !== undefined) updateData.description = description;
      if (isAnimation !== undefined) updateData.isAnimation = Boolean(isAnimation);
      if (visibleBranches !== undefined) updateData.visibleBranches = visibleBranches;
      if (defaultPrice !== undefined) updateData.defaultPrice = Number(defaultPrice);
      if (price !== undefined) updateData.price = Number(price);
      if (mrp !== undefined) updateData.mrp = Number(mrp);

      const updated = await Product.findOneAndUpdate(
        { id: req.params.id },
        { $set: updateData },
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: 'Product not found' });
      return res.json(updated);
    }
    return res.status(500).json({ error: 'MongoDB required' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id
// Delete product from master catalog (Admin Only)
router.delete('/:id', authMiddleware, requireAdmin, async (req, res) => {
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
// Add a master product to a specific store's branch inventory (Shopkeeper)
router.post('/inventory', authMiddleware, requireShopkeeper, async (req, res) => {
  try {
    const { storeId, productId, price, mrp, stock } = req.body;
    let targetStoreId = req.user.storeId || storeId;

    if (isMongoConnected) {
      if (req.user.role === 'Shopkeeper' || req.user.role === 'Store Manager') {
        const staff = await StoreStaff.findOne({ userId: req.user.id, status: 'ACTIVE' });
        if (staff && staff.storeId) {
          targetStoreId = staff.storeId;
        }
      }

      if (!targetStoreId || !productId) {
        return res.status(400).json({ error: 'Store ID and Product ID are required.' });
      }

      const product = await Product.findOne({ id: productId });
      if (!product) {
        return res.status(404).json({ error: 'Master product not found' });
      }

      const initialStock = Number(stock !== undefined && stock !== null ? stock : 20);
      const sellingPrice = Number(price !== undefined && price !== null ? price : (product.defaultPrice || product.price || 0));
      const mrpVal = Number(mrp !== undefined && mrp !== null ? mrp : (product.mrp || sellingPrice));

      let inv = await StoreInventory.findOne({ storeId: targetStoreId, productId });
      if (inv) {
        inv.isAvailable = true;
        inv.stock = initialStock;
        if (price) inv.price = sellingPrice;
        if (mrpVal) inv.mrp = mrpVal;
        await inv.save();
      } else {
        inv = await StoreInventory.create({
          id: 'inv_' + Date.now() + Math.floor(Math.random() * 1000),
          storeId: targetStoreId,
          productId,
          price: sellingPrice,
          sellingPrice: sellingPrice,
          mrp: mrpVal,
          stock: initialStock,
          isAvailable: true
        });
      }

      // Record transaction
      try {
        const InventoryTransaction = (await import('../models/InventoryTransaction.js')).default;
        await InventoryTransaction.create({
          storeId: targetStoreId,
          productId,
          type: 'STOCK_IN',
          quantity: initialStock,
          previousStock: 0,
          newStock: initialStock,
          reason: 'Added from Master Catalog',
          createdBy: targetStoreId
        });
      } catch (_) {}

      return res.status(201).json(inv);
    }
    return res.status(500).json({ error: 'MongoDB required' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/inventory/:productId
// Remove a product from a specific store's inventory (Shopkeeper)
router.delete('/inventory/:productId', authMiddleware, requireShopkeeper, async (req, res) => {
  try {
    const { productId } = req.params;
    let targetStoreId = req.user.storeId || req.query.storeId;

    if (isMongoConnected) {
      if (req.user.role === 'Shopkeeper' || req.user.role === 'Store Manager') {
        const staff = await StoreStaff.findOne({ userId: req.user.id, status: 'ACTIVE' });
        if (staff && staff.storeId) {
          targetStoreId = staff.storeId;
        }
      }

      if (!targetStoreId) {
        return res.status(400).json({ error: 'Store ID required' });
      }

      // Mark inventory unavailable for this store
      await StoreInventory.findOneAndUpdate(
        { storeId: targetStoreId, productId },
        { $set: { isAvailable: false, stock: 0 } }
      );

      return res.json({ message: 'Product removed from store inventory' });
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

// POST /api/products/image-search (Visual / Image Search)
router.post('/image-search', async (req, res) => {
  try {
    const { image, storeId, visualHint } = req.body;
    let targetStoreId = storeId || 'store_1';

    let allProds = [];
    if (isMongoConnected) {
      const inventories = await StoreInventory.find({ storeId: targetStoreId, isAvailable: { $ne: false } });
      const products = await Product.find().sort({ createdAt: -1 });
      allProds = products.map(prod => {
        const inv = inventories.find(i => i.productId === prod.id);
        return {
          id: prod.id,
          name: prod.name,
          categoryId: prod.categoryId,
          categoryName: prod.categoryName,
          unit: prod.unit,
          price: Number(inv ? (inv.price || inv.sellingPrice) : (prod.defaultPrice || prod.price || 30)),
          mrp: Number(inv ? (inv.mrp || prod.mrp) : (prod.mrp || 35)),
          stock: Number(inv ? inv.stock : (prod.stock || 0)),
          image: prod.image,
          inStore: !!inv,
          isAnimation: Boolean(prod.isAnimation)
        };
      });
    } else {
      allProds = memoryProducts;
    }

    // Extract search keywords from visual hint or image filename
    let queryKeywords = [];
    if (visualHint && typeof visualHint === 'string') {
      queryKeywords = visualHint.toLowerCase().split(/\s+/).filter(Boolean);
    }

    // Keyword matching patterns for common grocery visual entities
    const VISUAL_ENTITY_MAP = {
      milk: ['milk', 'dairy', 'amul', 'curd', 'paneer'],
      bread: ['bread', 'bakery', 'toast', 'harvest'],
      egg: ['egg', 'eggs', 'poultry'],
      tomato: ['tomato', 'tomatoes', 'vegetables', 'red'],
      broccoli: ['broccoli', 'green', 'vegetable'],
      chips: ['chips', 'potato', 'masala', 'snacks', 'lay', 'kurkure', 'doritos'],
      coke: ['coca', 'cola', 'soda', 'drink', 'beverage', 'zero'],
      dal: ['dal', 'pulses', 'atta', 'rice', 'grains'],
      vegetable: ['vegetable', 'tomato', 'broccoli', 'potato', 'onion']
    };

    let matchedProducts = [];
    if (queryKeywords.length > 0) {
      matchedProducts = allProds.filter(prod => {
        const nameLower = (prod.name || '').toLowerCase();
        const catLower = (prod.categoryName || '').toLowerCase();
        return queryKeywords.some(kw => nameLower.includes(kw) || catLower.includes(kw));
      });
    }

    // If no direct keyword or generic visual search, match top relevant in-store items
    if (matchedProducts.length === 0) {
      matchedProducts = allProds.slice(0, 8);
    }

    return res.json({
      success: true,
      totalMatches: matchedProducts.length,
      products: matchedProducts
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
