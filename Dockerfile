# ===================================
# KALİTE YÖNETİM SİSTEMİ - DOCKERFILE
# ===================================

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy backend files only
COPY src/backend/package*.json ./
COPY src/backend/ ./

# Install dependencies
RUN npm install --production

# Build the application
RUN npm run build

# Expose port
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:$PORT/health || exit 1

# Start the application
CMD ["npm", "start"] 