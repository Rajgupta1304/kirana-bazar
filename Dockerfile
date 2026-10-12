# Stage 1: Build Frontend Assets
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy backend source code
COPY backend ./backend

# Copy compiled web frontend
COPY --from=builder /app/dist ./dist

# Copy compiled Flutter mobile web app
COPY customer_app/build/web ./customer_app/build/web

# Copy downloads directory
COPY downloads ./downloads

EXPOSE 8080

CMD ["node", "backend/index.js"]
