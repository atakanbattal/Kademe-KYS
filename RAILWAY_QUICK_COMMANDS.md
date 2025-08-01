# 🚄 Railway Quick Commands

## Express Deployment Komutları

### 🚀 One-Click Deployment
```bash
# Otomatik deployment script çalıştır
./deploy-to-railway.sh
```

### 📦 Manual Railway Commands
```bash
# Railway CLI kurulumu
npm install -g @railway/cli

# Login
railway login

# Project init
railway init

# Environment variables
railway variables set MONGODB_URI="mongodb+srv://kysuser:password@cluster.mongodb.net/kys"
railway variables set JWT_SECRET="$(openssl rand -hex 32)"
railway variables set NODE_ENV="production"

# Deploy
railway up

# Domain ayarla
railway domain

# Logs izle
railway logs --follow
```

### 🔧 MongoDB Atlas Commands
```bash
# MongoDB Atlas cluster oluştur: https://mongodb.com/atlas
# 1. Free cluster (M0) oluştur
# 2. Database user ekle (kysuser)
# 3. Network access: 0.0.0.0/0 (Railway için)
# 4. Connection string al
```

### 🌐 Frontend Update Commands
```bash
# Railway URL'ini al
railway domain

# Frontend API URL'ini güncelle
# File: src/frontend/kys-frontend/src/services/api.ts
# Line: const API_URL = 'https://your-railway-app.up.railway.app/api'

# Production build test
cd src/frontend/kys-frontend
npm run build
```

### 📊 Health Check Commands
```bash
# Backend health check
curl https://your-app.up.railway.app/health

# API test
curl https://your-app.up.railway.app/api/deviation-approvals

# Database connection test
curl https://your-app.up.railway.app/api/deviation-approvals/dashboard
```

### 🔄 Update Commands
```bash
# Code güncelleme sonrası otomatik redeploy
git push origin main

# Manuel redeploy
railway up --detach

# Variables güncelleme
railway variables set FRONTEND_URL="https://your-netlify.app"

# Logs kontrol
railway logs --tail 100
```

### 💡 Pro Tips

1. **Free Tier Limits**: $5/month credit, 500 hours runtime
2. **Sleep Mode**: Inactivity sonrası uyku (30 saniye wake-up)
3. **Custom Domain**: `railway domain` ile subdomain al
4. **Environment Variables**: Railway dashboard'tan da ayarlanabilir
5. **Database Backup**: MongoDB Atlas otomatik backup yapıyor

### 🚨 Common Issues

- **Port Error**: Railway otomatik PORT variable sağlar
- **CORS Error**: FRONTEND_URL'yi doğru ayarlayın
- **DB Connection**: MongoDB Atlas IP whitelist kontrol edin
- **Build Error**: package.json'da build script kontrol edin

### 📞 Support
- Railway Discord: https://discord.gg/railway
- Documentation: https://docs.railway.app