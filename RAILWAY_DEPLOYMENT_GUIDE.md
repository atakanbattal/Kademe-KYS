# 🚄 Railway Deployment Guide

## Kalite Yönetim Sistemi - MongoDB + Express Backend Deployment

### 📋 Prerequisites

1. **Railway Hesabı**: [railway.app](https://railway.app) üzerinden ücretsiz hesap oluşturun
2. **MongoDB Atlas**: [mongodb.com/atlas](https://mongodb.com/atlas) üzerinden ücretsiz cluster oluşturun
3. **GitHub Repository**: Kodlarınız GitHub'da olmalı

---

## 🗄️ Step 1: MongoDB Atlas Setup

### 1.1 MongoDB Atlas Cluster Oluşturun
```bash
1. https://mongodb.com/atlas adresine gidin
2. "Build a Database" > "Free" seçin (M0 Sandbox)
3. Cloud Provider: AWS, Region: us-east-1 (varsayılan)
4. Cluster Name: "kys-database" 
```

### 1.2 Database User Oluşturun
```bash
1. Security > Database Access
2. "Add New Database User"
3. Username: kysuser
4. Password: [güçlü şifre oluşturun]
5. Built-in Role: "Read and write to any database"
```

### 1.3 Network Access Ayarlayın
```bash
1. Security > Network Access
2. "Add IP Address"
3. "Allow Access from Anywhere" (0.0.0.0/0)
4. (Railway dynamic IP'ler kullandığı için gerekli)
```

### 1.4 Connection String Alın
```bash
1. Database > Connect > "Connect your application"
2. Driver: Node.js, Version: 4.1 or later
3. Connection string'i kopyalayın:
   mongodb+srv://kysuser:<password>@kys-database.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

---

## 🚄 Step 2: Railway Deployment

### 2.1 Railway CLI Kurulumu
```bash
# macOS (Homebrew)
brew install railway

# npm ile
npm install -g @railway/cli

# Railway'e login olun
railway login
```

### 2.2 Railway Project Oluşturun
```bash
# Proje dizininde
railway init

# GitHub repo'yu bağlayın
railway link [your-github-repo-url]
```

### 2.3 Environment Variables Ayarlayın
```bash
# MongoDB connection string
railway variables set MONGODB_URI="mongodb+srv://kysuser:YOUR_PASSWORD@kys-database.xxxxx.mongodb.net/kys?retryWrites=true&w=majority"

# JWT Secret (güçlü bir key oluşturun)
railway variables set JWT_SECRET="your-super-secret-jwt-key-change-in-production-$(openssl rand -hex 32)"

# Node environment
railway variables set NODE_ENV="production"

# CORS için frontend URL (daha sonra güncelleyin)
railway variables set FRONTEND_URL="http://localhost:3000"
```

### 2.4 Deploy Edin
```bash
# Deploy işlemini başlatın
railway up

# Domain alın (opsiyonel)
railway domain

# Logları izleyin
railway logs
```

---

## 🌐 Step 3: Frontend API URL Güncelleme

### 3.1 Railway Backend URL'ini Alın
```bash
# Railway dashboard'tan veya CLI ile
railway status

# URL örneği: https://your-app-name.up.railway.app
```

### 3.2 Frontend Environment Variables
```bash
# .env dosyası oluşturun (frontend root'ta)
REACT_APP_API_URL=https://your-app-name.up.railway.app/api

# Veya direkt kod içinde güncelleyin
# src/frontend/kys-frontend/src/services/api.ts
const API_URL = 'https://your-app-name.up.railway.app/api';
```

---

## 🧪 Step 4: Test Etme

### 4.1 Backend Health Check
```bash
curl https://your-app-name.up.railway.app/health
# Yanıt: {"status":"OK","timestamp":"..."}
```

### 4.2 API Endpoints Test
```bash
# Deviation Approvals listesi
curl https://your-app-name.up.railway.app/api/deviation-approvals

# Database connection test
curl https://your-app-name.up.railway.app/api/deviation-approvals/dashboard
```

---

## 🔧 Step 5: Production Optimization

### 5.1 MongoDB Production Settings
```bash
# Connection string'de production ayarları
mongodb+srv://kysuser:password@kys-database.xxxxx.mongodb.net/kys?retryWrites=true&w=majority&maxPoolSize=10&serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1
```

### 5.2 Railway Environment Variables Update
```bash
# CORS için frontend domain'i ekleyin
railway variables set FRONTEND_URL="https://your-netlify-app.netlify.app"

# Rate limiting ve security headers için
railway variables set RATE_LIMIT_WINDOW_MS="900000"
railway variables set RATE_LIMIT_MAX_REQUESTS="100"
```

---

## 📊 Step 6: Monitoring & Maintenance

### 6.1 Railway Dashboard
```bash
- Metrics: CPU, Memory, Network usage
- Logs: Real-time application logs
- Deployments: Deployment history
- Environment Variables: Güvenli değişken yönetimi
```

### 6.2 MongoDB Atlas Monitoring
```bash
- Performance Advisor
- Real-time Performance Panel
- Database Profiler
- Automated Index Suggestions
```

---

## 🚨 Troubleshooting

### Common Issues & Solutions

1. **Build Error - TypeScript**
   ```bash
   # Backend package.json'da build script kontrol edin
   "build": "tsc"
   ```

2. **Database Connection Error**
   ```bash
   # IP whitelist kontrol edin: 0.0.0.0/0
   # Username/password doğruluğu
   # Network access ayarları
   ```

3. **CORS Errors**
   ```bash
   # Backend'te CORS ayarları
   app.use(cors({
     origin: process.env.FRONTEND_URL || '*'
   }));
   ```

4. **Environment Variables**
   ```bash
   # Railway'de tüm variables'ları kontrol edin
   railway variables
   ```

---

## 💰 Cost Estimation

### Free Tier Limits
- **Railway**: $5/month credit (starter plan)
- **MongoDB Atlas**: 512MB free storage
- **Bandwidth**: 100GB/month outbound

### Production Scaling
- **Railway Pro**: $20/month
- **MongoDB Atlas M10**: $57/month
- Küçük-orta ölçekli işletmeler için ideal

---

## 🔐 Security Best Practices

1. **Environment Variables**: Sensitive data'yı asla code'a yazma
2. **JWT Secret**: 32+ karakter, random generated
3. **Database User**: Minimum gerekli yetkiler
4. **HTTPS**: Her zaman SSL/TLS kullanın
5. **Rate Limiting**: API abuse'u önleyin

---

## 📞 Support

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **MongoDB Atlas Docs**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)

Happy Deploying! 🚀