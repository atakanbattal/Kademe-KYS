# ===================================
# KALİTE YÖNETİM SİSTEMİ - DOCKERFILE
# ===================================

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files for caching
COPY package*.json ./
COPY src/backend/package*.json ./src/backend/

# Install root dependencies and backend dependencies
RUN npm ci --only=production && \
    cd src/backend && \
    npm ci --only=production

# Copy backend source code
COPY src/backend/ ./src/backend/

# Build the application
RUN cd src/backend && npm run build

# Expose port
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:$PORT/health || exit 1

# Start the application
CMD ["npm", "start"] 