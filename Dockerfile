# Node.js 18 Alpine 
FROM node:18-alpine

# Çalışma dizini
WORKDIR /app

# Package files kopyala
COPY package*.json ./

# Dependencies yükle (production only)
RUN npm ci --omit=dev

# TypeScript ve build dependencies ekle
RUN npm install --save-dev typescript ts-node

# Source code kopyala
COPY . .

# TypeScript build
RUN npm run build

# Port ayarla
EXPOSE 5003

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5003/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start command
CMD ["npm", "start"] 