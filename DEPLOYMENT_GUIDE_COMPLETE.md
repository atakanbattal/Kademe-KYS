# 🚀 Kademe KYS - MongoDB, Railway ve Netlify Deployment Rehberi

## 📋 İhtiyaç Listesi
- [ ] GitHub hesabı
- [ ] MongoDB Atlas hesabı
- [ ] Railway hesabı  
- [ ] Netlify hesabı

---

## 🎯 ADIM 1: MongoDB Atlas Kurulumu

### 1.1 MongoDB Atlas Hesabı
1. **MongoDB Atlas'a gidin:** https://cloud.mongodb.com/
2. **"Try Free" ile ücretsiz hesap oluşturun**
3. **Email doğrulaması yapın**

### 1.2 Database Cluster Oluşturma
```bash
# 1. "Create a New Cluster" tıklayın
# 2. "M0 Sandbox" (ÜCRETSİZ) seçin
# 3. Provider: AWS
# 4. Region: Europe (Frankfurt) seçin
# 5. Cluster Name: "KYS-Production"
# 6. "Create Cluster" tıklayın (2-3 dakika sürer)
```

### 1.3 Database User Oluşturma
```bash
# 1. Sol menüden "Database Access" seçin
# 2. "Add New Database User" tıklayın
# 3. Authentication Method: Password
# 4. Username: kysuser
# 5. Password: [GÜVENLİ ŞİFRE OLUŞTURUN]
# 6. Database User Privileges: "Read and write to any database"
# 7. "Add User" tıklayın
```

### 1.4 Network Access Ayarlama
```bash
# 1. Sol menüden "Network Access" seçin
# 2. "Add IP Address" tıklayın
# 3. "ALLOW ACCESS FROM ANYWHERE" seçin (0.0.0.0/0)
# 4. Comment: "Railway Production Access"
# 5. "Confirm" tıklayın
```

### 1.5 Connection String Alma
```bash
# 1. "Database" menüsüne dönün
# 2. Cluster'ınızda "Connect" tıklayın
# 3. "Connect your application" seçin
# 4. Driver: Node.js, Version: 4.1 or later
# 5. Connection string'i kopyalayın:
#    mongodb+srv://kysuser:<password>@kys-production.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

---

## 🚂 ADIM 2: Railway Deployment (Backend)

### 2.1 Railway Hesabı
1. **Railway'e gidin:** https://railway.app/
2. **GitHub ile giriş yapın**
3. **Email doğrulaması yapın**

### 2.2 Yeni Proje Oluşturma
```bash
# 1. "New Project" tıklayın
# 2. "Deploy from GitHub repo" seçin
# 3. Repository'nizi seçin: "Kademe-KYS"
# 4. Root directory: "/" (boş bırakın)
```

### 2.3 Environment Variables Ayarlama
```bash
# Railway Dashboard'da projenizi açın
# Settings > Environment sekmesine gidin
# Aşağıdaki değişkenleri ekleyin:

MONGODB_URI=mongodb+srv://kysuser:ŞİFRENİZ@kys-production.xxxxx.mongodb.net/kys?retryWrites=true&w=majority
JWT_SECRET=super_gizli_jwt_anahtar_buraya_yazip_prod_icin_degistirin
PORT=5003
NODE_ENV=production
FRONTEND_URL=https://netlify-app-adiniz.netlify.app
```

### 2.4 Deploy Ayarları
```bash
# Settings > General sekmesinde:
# Build Command: cd src/backend && npm install && npm run build
# Start Command: cd src/backend && npm start
# Root Directory: / (boş)
```

### 2.5 Domain Alma
```bash
# Settings > Domains sekmesinde:
# "Generate Domain" tıklayın
# Domain'inizi kopyalayın: https://xxx-xxx-production.railway.app
```

---

## 🌐 ADIM 3: Netlify Deployment (Frontend)

### 3.1 Netlify Hesabı
1. **Netlify'a gidin:** https://netlify.com/
2. **GitHub ile giriş yapın**
3. **Repository'nize erişim izni verin**

### 3.2 Site Oluşturma
```bash
# 1. "New site from Git" tıklayın
# 2. "GitHub" seçin
# 3. Repository'nizi seçin: "Kademe-KYS"
# 4. Branch: main
# 5. Base directory: src/frontend/kys-frontend
# 6. Build command: npm run build
# 7. Publish directory: src/frontend/kys-frontend/build
```

### 3.3 Environment Variables Ayarlama
```bash
# Site Settings > Environment variables sekmesine gidin
# Aşağıdaki değişkenleri ekleyin:

REACT_APP_API_URL=https://railway-backend-urliniz.railway.app
REACT_APP_NODE_ENV=production
REACT_APP_NAME=Kademe KYS
REACT_APP_VERSION=1.0.0
```

### 3.4 Domain Ayarlama
```bash
# Site settings > Domain management
# Site name'i değiştirin: kademe-kys-production
# Final URL: https://kademe-kys-production.netlify.app
```

---

## 🔧 ADIM 4: CORS ve API Konfigürasyonu

### 4.1 Backend CORS Ayarları
Railway'de FRONTEND_URL environment variable'ını Netlify URL'niz ile güncelleyin:
```bash
FRONTEND_URL=https://kademe-kys-production.netlify.app
```

### 4.2 Frontend API URL'si
Netlify'de REACT_APP_API_URL'yi Railway URL'niz ile güncelleyin:
```bash
REACT_APP_API_URL=https://railway-backend-urliniz.railway.app
```

---

## ✅ ADIM 5: Test ve Doğrulama

### 5.1 Backend Test
```bash
# Railway URL'nizi browser'da açın
# https://railway-backend-urliniz.railway.app/api/health
# {"status": "ok", "timestamp": "..."} görmeli
```

### 5.2 Frontend Test
```bash
# Netlify URL'nizi browser'da açın
# https://kademe-kys-production.netlify.app
# Login sayfası açılmalı
```

### 5.3 Bağlantı Test
```bash
# Frontend'de test kullanıcısı ile giriş yapmayı deneyin
# API çağrılarının çalıştığını kontrol edin
```

---

## 🔄 ADIM 6: Otomatik Deployment

### 6.1 Railway Otomatik Deploy
```bash
# Railway otomatik olarak main branch'deki her commit'i deploy eder
# Settings > Service > Source sekmesinde kontrol edebilirsiniz
```

### 6.2 Netlify Otomatik Deploy
```bash
# Netlify otomatik olarak main branch'deki her commit'i deploy eder
# Site settings > Build & deploy sekmesinde kontrol edebilirsiniz
```

---

## 📊 ADIM 7: Monitoring ve Loglar

### 7.1 Railway Logs
```bash
# Railway Dashboard > Deploy sekmesi
# Real-time logs görüntüleyebilirsiniz
```

### 7.2 Netlify Logs
```bash
# Netlify Dashboard > Site overview
# Deploy logs ve function logs görüntüleyebilirsiniz
```

### 7.3 MongoDB Atlas Monitoring
```bash
# Atlas Dashboard > Monitoring sekmesi
# Database performance ve connections izleyebilirsiniz
```

---

## 🚨 Troubleshooting

### 🔍 Yaygın Sorunlar

#### Backend Deploy Sorunları:
```bash
# MongoDB bağlantı sorunu:
# - Connection string'de şifrenizi kontrol edin
# - Network Access'de IP whitelist'i kontrol edin
# - Database user permissions'ı kontrol edin

# Railway build hatası:
# - package.json'da scripts kısmını kontrol edin
# - Node.js version uyumluluğunu kontrol edin
```

#### Frontend Deploy Sorunları:
```bash
# Netlify build hatası:
# - Build command'ı kontrol edin: npm run build
# - Publish directory'i kontrol edin: build
# - Dependencies'leri kontrol edin

# API connection sorunu:
# - REACT_APP_API_URL environment variable'ını kontrol edin
# - CORS ayarlarını kontrol edin
```

#### CORS Sorunları:
```bash
# Backend'de FRONTEND_URL'yi doğru Netlify URL ile güncelleyin
# Browser Network tab'da 403/404 hatalarını kontrol edin
```

---

## 🎉 Final Kontrol Listesi

- [ ] MongoDB Atlas cluster çalışıyor
- [ ] Railway backend deploy edildi
- [ ] Netlify frontend deploy edildi
- [ ] Environment variables doğru ayarlandı
- [ ] CORS ayarları doğru
- [ ] API bağlantısı çalışıyor
- [ ] Login/logout fonksiyonları çalışıyor
- [ ] Tüm modüller erişilebilir
- [ ] PDF export çalışıyor

---

## 🔗 Yararlı Linkler

- MongoDB Atlas: https://cloud.mongodb.com/
- Railway: https://railway.app/
- Netlify: https://netlify.com/
- GitHub: https://github.com/

---

## 📞 Destek

Sorun yaşarsanız:
1. Railway/Netlify logs'ları kontrol edin
2. Browser Developer Tools > Network tab'ı kontrol edin
3. MongoDB Atlas connection metrics'lerini kontrol edin 