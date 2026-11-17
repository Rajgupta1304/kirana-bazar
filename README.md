# Kirana Bazar (DMR Kirana)

A full-stack grocery ordering and management platform featuring an Admin/Shopkeeper React Web Dashboard, a Node.js Express REST API backend connected to MongoDB, and a cross-platform Flutter Customer & Rider Mobile App.

---

## Architecture Overview

- **Web Frontend (`/src`)**: React 18 + Vite + Tailwind CSS admin and shopkeeper portal.
- **Backend API (`/backend`)**: Express.js REST API with MongoDB (Mongoose), handling authentication, products catalog, store inventories, order lifecycle, delivery tracking, and analytics.
- **Customer & Rider App (`/customer_app`)**: Flutter mobile and web application with real-time tracking, 3D visual item displays, voice search, location-based ordering, and OTP verification.
- **Deployment**: Configured for continuous deployment on [Railway](https://railway.app) via `railway.json` and Nixpacks.

---

## Continuous Deployment via Railway

Every commit pushed to the `main` branch of this repository (`Rajgupta1304/kirana-bazar`) automatically triggers a new deployment on Railway.

### Build & Start Workflow (Configured in `railway.json`)
- **Builder**: Nixpacks
- **Build Command**: `npm install && npm run build`
- **Start Command**: `node backend/index.js`
- **Healthcheck Endpoint**: `/api/health`

---

## Local Development & Setup

### Prerequisites
- Node.js >= 18
- Flutter SDK (for customer app)
- MongoDB instance (Atlas or local)

### Backend & Web Admin
```bash
# Install dependencies
npm install

# Start development web server
npm run dev

# Start backend server
npm run start
```

### Flutter Customer App
```bash
cd customer_app

# Run Flutter analyze
flutter analyze lib/

# Build Web app
flutter build web --release --base-href /app/

# Build Android release APK
flutter build apk --release
```
