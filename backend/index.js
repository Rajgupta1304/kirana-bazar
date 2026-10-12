import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
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
import storeRoutes from './routes/storeRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const DEFAULT_PORT = parseInt(process.env.PORT || '8080', 10);

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
app.use('/api/stores', storeRoutes);

// Customer Mobile App (Flutter Web PWA)
const customerAppPath = path.join(__dirname, '../customer_app/build/web');
app.use('/app', express.static(customerAppPath));
app.get('/app/*', (req, res) => {
  res.sendFile(path.join(customerAppPath, 'index.html'));
});

// Mobile App Download Route & Landing Page
const downloadsPath = path.join(__dirname, '../downloads');

app.get('/download/files/kirana-bazar.apk', (req, res) => {
  const apkPath = path.join(downloadsPath, 'kirana-bazar.apk');
  if (fs.existsSync(apkPath)) {
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    return res.download(apkPath, 'kirana-bazar.apk');
  }
  return res.status(404).send('APK file is currently being packaged. Please access the mobile web app at /app in the meantime!');
});

app.use('/download/files', express.static(downloadsPath));

app.get('/download', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Download Kirana Bazar Mobile App</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
</head>
<body class="bg-gray-900 text-white min-h-screen flex items-center justify-center p-4">
  <div class="max-w-md w-full bg-gray-800 rounded-3xl p-8 border border-gray-700 shadow-2xl text-center">
    <div class="w-20 h-20 bg-gradient-to-tr from-yellow-400 to-amber-500 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg mb-6">
      🛒
    </div>
    <h1 class="text-2xl font-bold text-white mb-2">Kirana Bazar App</h1>
    <p class="text-gray-400 text-sm mb-6">India's Quickest Grocery • Delivered in 8 Minutes</p>
    
    <div class="space-y-4">
      <a href="/app" class="block w-full py-3.5 px-6 rounded-xl font-bold text-gray-900 bg-yellow-400 hover:bg-yellow-300 transition shadow-lg">
        🚀 Launch Customer Mobile App
      </a>
      <a href="/download/files/kirana-bazar.apk" class="block w-full py-3.5 px-6 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 transition shadow-lg">
        📲 Download Android APK
      </a>
      <a href="/" class="block text-gray-400 hover:text-gray-200 text-sm pt-2">
        ← Open Admin & Rider Portal
      </a>
    </div>

    <div class="mt-8 pt-6 border-t border-gray-700 text-xs text-gray-500">
      <p>Works on all Android & iOS devices via PWA.</p>
      <p class="mt-1">Tap 'Add to Home Screen' in browser for full app experience.</p>
    </div>
  </div>
</body>
</html>`);
});

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

// Start Server with dynamic port scanning on 0.0.0.0
const HOST = '0.0.0.0';

function listenOnAvailablePort(portAttempt) {
  const server = app.listen(portAttempt, HOST, () => {
    console.log(`🚀 Kirana Bazar Unified Full-Stack Server running on http://${HOST}:${portAttempt}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && !process.env.PORT) {
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

