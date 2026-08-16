import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './db/connect.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const DEFAULT_PORT = parseInt(process.env.PORT || '5000', 10);

// Disable HTTP 304 Caching so all API responses return HTTP 200 OK
app.set('etag', false);

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Prevent API HTTP 304 caching
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Kirana Bazar Express REST API (MongoDB)',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/notifications', notificationRoutes);

// Static Hosting for Compiled Frontend Web App (dist/)
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Single Page Application wildcard fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start Server with dynamic port scanning (5000 -> 5010)
function listenOnAvailablePort(portAttempt) {
  const server = app.listen(portAttempt, () => {
    console.log(`🚀 Kirana Bazar Unified Full-Stack Server running on http://localhost:${portAttempt}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${portAttempt} in use, trying next port...`);
      listenOnAvailablePort(portAttempt + 1);
    } else {
      console.error('Server launch error:', err);
    }
  });
}

async function startServer() {
  await connectDB();
  listenOnAvailablePort(DEFAULT_PORT);
}

startServer();
