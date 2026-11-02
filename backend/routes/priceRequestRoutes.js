import express from 'express';
import PriceChangeRequest from '../models/PriceChangeRequest.js';
import StoreInventory from '../models/StoreInventory.js';
import Store from '../models/Store.js';
import Product from '../models/Product.js';
import StoreStaff from '../models/StoreStaff.js';
import { isMongoConnected } from '../db/connect.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createNotification } from './notificationRoutes.js';

const router = express.Router();

let memoryRequests = [];

// GET /api/price-requests
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { storeId, status } = req.query;
    const isShopkeeper = req.user.role === 'Shopkeeper' || req.user.role === 'Store Manager';

    if (isMongoConnected) {
      let query = {};
      
      if (isShopkeeper) {
        let targetStoreId = req.user.storeId;
        if (!targetStoreId) {
          const staff = await StoreStaff.findOne({ userId: req.user.id, status: 'ACTIVE' });
          if (staff) targetStoreId = staff.storeId;
        }
        if (!targetStoreId && storeId) targetStoreId = storeId;
        if (targetStoreId) query.storeId = targetStoreId;
      } else if (storeId && storeId !== 'all') {
        query.storeId = storeId;
      }

      if (status && status !== 'ALL') {
        query.status = status;
      }

      const requests = await PriceChangeRequest.find(query).sort({ createdAt: -1 });
      return res.json(requests);
    }

    let filtered = [...memoryRequests];
    if (storeId && storeId !== 'all') filtered = filtered.filter(r => r.storeId === storeId);
    if (status && status !== 'ALL') filtered = filtered.filter(r => r.status === status);
    return res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/price-requests
// Shopkeeper submits a price change request
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { productId, requestedPrice, reason, storeId: bodyStoreId } = req.body;
    
    if (!productId || requestedPrice === undefined || requestedPrice === null) {
      return res.status(400).json({ error: 'Product ID and requested price are required.' });
    }

    const priceNum = Number(requestedPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({ error: 'Please enter a valid positive requested price.' });
    }

    let targetStoreId = req.user.storeId || bodyStoreId;
    if (!targetStoreId) {
      const staff = await StoreStaff.findOne({ userId: req.user.id, status: 'ACTIVE' });
      if (staff) targetStoreId = staff.storeId;
    }
    if (!targetStoreId) targetStoreId = 'store_1';

    if (isMongoConnected) {
      const store = await Store.findOne({ id: targetStoreId }) || { id: targetStoreId, name: 'Main Store' };
      const product = await Product.findOne({ id: productId });
      if (!product) return res.status(404).json({ error: 'Product not found in catalog.' });

      let inv = await StoreInventory.findOne({ storeId: targetStoreId, productId });
      const currentPrice = inv ? (inv.price || inv.sellingPrice || product.defaultPrice || 30) : (product.defaultPrice || 30);
      const defaultPrice = product.defaultPrice || product.price || currentPrice;

      // Check if there is already a PENDING request for this product in this store
      let existingPending = await PriceChangeRequest.findOne({
        storeId: targetStoreId,
        productId,
        status: 'PENDING'
      });

      if (existingPending) {
        existingPending.requestedPrice = priceNum;
        existingPending.reason = reason || existingPending.reason;
        existingPending.currentPrice = currentPrice;
        await existingPending.save();
        return res.json(existingPending);
      }

      const newRequest = await PriceChangeRequest.create({
        id: 'pcr_' + Date.now(),
        storeId: targetStoreId,
        storeName: store.name,
        shopkeeperId: req.user.id,
        shopkeeperName: req.user.name || 'Store Manager',
        productId: product.id,
        productName: product.name,
        productImage: product.image || '',
        currentPrice,
        defaultPrice,
        requestedPrice: priceNum,
        reason: reason || '',
        status: 'PENDING'
      });

      createNotification({
        title: 'New Branch Price Request',
        message: `${store.name} requested price change for ${product.name} to ₹${priceNum}`,
        type: 'PRICE_REQUEST',
        recipientRole: 'Admin'
      });

      return res.status(201).json(newRequest);
    }

    const mockRequest = {
      id: 'pcr_' + Date.now(),
      storeId: targetStoreId,
      storeName: 'Main Store',
      shopkeeperId: req.user.id,
      shopkeeperName: req.user.name || 'Store Manager',
      productId,
      productName: 'Product',
      productImage: '',
      currentPrice: 30,
      defaultPrice: 30,
      requestedPrice: priceNum,
      reason: reason || '',
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    memoryRequests.unshift(mockRequest);
    return res.status(201).json(mockRequest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/price-requests/:id/action
// Admin accepts, rejects, or counters a price request
router.patch('/:id/action', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'Admin' && req.user.role !== 'Super Admin') {
      return res.status(403).json({ error: 'Only administrators can approve or reject price requests.' });
    }

    const { action, counterPrice, adminNote } = req.body;
    if (!['ACCEPT', 'REJECT', 'COUNTER'].includes(action)) {
      return res.status(400).json({ error: 'Action must be ACCEPT, REJECT, or COUNTER.' });
    }

    if (isMongoConnected) {
      const pcr = await PriceChangeRequest.findOne({ id: req.params.id });
      if (!pcr) return res.status(404).json({ error: 'Price request not found.' });

      if (action === 'ACCEPT') {
        pcr.status = 'APPROVED';
        pcr.adminNote = adminNote || 'Approved by Admin';
        pcr.reviewedBy = req.user.id;
        pcr.reviewedAt = new Date();
        await pcr.save();

        // Update StoreInventory strictly for this branch only!
        await StoreInventory.findOneAndUpdate(
          { storeId: pcr.storeId, productId: pcr.productId },
          { $set: { price: pcr.requestedPrice, sellingPrice: pcr.requestedPrice } },
          { upsert: false }
        );

        createNotification({
          title: 'Price Request Approved! ✅',
          message: `Your price request for ${pcr.productName} has been approved at ₹${pcr.requestedPrice}.`,
          type: 'PRICE_APPROVED',
          recipientId: pcr.shopkeeperId
        });

        return res.json({ message: 'Price request accepted successfully.', request: pcr });
      }

      if (action === 'REJECT') {
        pcr.status = 'REJECTED';
        pcr.adminNote = adminNote || 'Rejected by Admin. Retaining current branch price.';
        pcr.reviewedBy = req.user.id;
        pcr.reviewedAt = new Date();
        await pcr.save();

        createNotification({
          title: 'Price Request Rejected',
          message: `Your price request for ${pcr.productName} (₹${pcr.requestedPrice}) was rejected. Current price retained.`,
          type: 'PRICE_REJECTED',
          recipientId: pcr.shopkeeperId
        });

        return res.json({ message: 'Price request rejected.', request: pcr });
      }

      if (action === 'COUNTER') {
        const approvedPrice = Number(counterPrice);
        if (isNaN(approvedPrice) || approvedPrice <= 0) {
          return res.status(400).json({ error: 'Please enter a valid counter price.' });
        }

        pcr.status = 'APPROVED';
        pcr.counterPrice = approvedPrice;
        pcr.adminNote = adminNote || `Approved at counter price ₹${approvedPrice}`;
        pcr.reviewedBy = req.user.id;
        pcr.reviewedAt = new Date();
        await pcr.save();

        // Update StoreInventory to counter price for this branch only!
        await StoreInventory.findOneAndUpdate(
          { storeId: pcr.storeId, productId: pcr.productId },
          { $set: { price: approvedPrice, sellingPrice: approvedPrice } },
          { upsert: false }
        );

        createNotification({
          title: 'Price Request Counter-Approved',
          message: `Admin approved a custom counter-price of ₹${approvedPrice} for ${pcr.productName}.`,
          type: 'PRICE_APPROVED',
          recipientId: pcr.shopkeeperId
        });

        return res.json({ message: `Price request approved at counter price ₹${approvedPrice}.`, request: pcr });
      }
    }

    return res.status(500).json({ error: 'MongoDB required for price management' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
