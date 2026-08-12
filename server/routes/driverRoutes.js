import express from 'express';
import Driver from '../models/Driver.js';

const router = express.Router();

// GET all drivers (optional shopkeeperId query param)
router.get('/', async (req, res) => {
  try {
    const { shopkeeperId } = req.query;
    let query = {};
    if (shopkeeperId) {
      query = { $or: [{ shopkeeperId }, { shopkeeperId: '' }, { shopkeeperId: { $exists: false } }] };
    }
    const drivers = await Driver.find(query).sort({ createdAt: -1 });
    res.json(drivers);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST new driver
router.post('/', async (req, res) => {
  try {
    const { name, phone, vehicle, status, shopkeeperId, shopkeeperName } = req.body;
    const newDriver = new Driver({
      id: 'drv_' + Date.now(),
      name,
      phone,
      vehicle: vehicle || 'EV Scooter',
      rating: 4.9,
      totalDeliveries: 0,
      status: status || 'Available',
      shopkeeperId: shopkeeperId || '',
      shopkeeperName: shopkeeperName || ''
    });
    await newDriver.save();
    res.status(201).json(newDriver);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// PATCH update driver status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const driver = await Driver.findOneAndUpdate(
      { id: req.params.id },
      { status },
      { new: true }
    );
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    res.json(driver);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE driver
router.delete('/:id', async (req, res) => {
  try {
    const driver = await Driver.findOneAndDelete({ id: req.params.id });
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    res.json({ message: 'Driver deleted successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
