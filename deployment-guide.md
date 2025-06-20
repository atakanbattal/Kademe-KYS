# 🚀 Kademe KYS - Online Deployment Rehberi

Bu rehber Kademe KYS sistemini Railway (Backend) + MongoDB Atlas (Veritabanı) + Netlify (Frontend) ile online olarak deploy etmek için gerekli adımları içerir.

## 📋 Gereksinimler

- GitHub account
- Railway account
- MongoDB Atlas account  
- Netlify account

## 🗄️ 1. MongoDB Atlas Kurulumu

### 1.1 MongoDB Atlas'ta Cluster Oluşturma:
1. https://cloud.mongodb.com adresine gidin
2. "Build a Database" → "M0 FREE" seçin
3. Region: "Frankfurt (eu-central-1)" seçin
4. Cluster Name: `kademe-kys-cluster`
5. "Create" butonuna tıklayın

### 1.2 Database User Oluşturma:
1. Database Access → "Add New Database User"
2. Username: `kys-admin`
3. Password: Güvenli bir password oluşturun
4. Built-in Role: "Read and write to any database"

### 1.3 Network Access Ayarlama:
1. Network Access → "Add IP Address"
2. "Allow access from anywhere" → "0.0.0.0/0"
3. Confirm

### 1.4 Connection String Alma:
1. Clusters → "Connect" → "Connect your application"
2. Driver: Node.js, Version: 5.5 or later
3. Connection string'i kopyalayın:
```
mongodb+srv://kys-admin:<password>@kademe-kys-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

## 🚂 2. Railway Backend Deployment

### 2.1 Railway'da Proje Oluşturma:
1. https://railway.app/dashboard → "New Project"
2. "Deploy from GitHub repo" seçin
3. "Kademe-KYS" repository'sini seçin
4. Deploy butonuna tıklayın

### 2.2 Environment Variables Ayarlama:
Railway Dashboard → Variables sekmesinde şu değişkenleri ekleyin:

```env
MONGODB_URI=mongodb+srv://kys-admin:YOUR_PASSWORD@kademe-kys-cluster.xxxxx.mongodb.net/kademe-kys?retryWrites=true&w=majority
JWT_SECRET=super_secure_jwt_secret_key_for_production_2024
NODE_ENV=production
PORT=5000
CORS_ORIGINS=https://your-netlify-app.netlify.app,http://localhost:3000
```

### 2.3 Build & Deploy Settings:
1. Settings → "Build Command": `cd src/backend && npm install && npm run build`
2. "Start Command": `cd src/backend && npm start`
3. "Root Directory": `/`

## 🌐 3. Netlify Frontend Deployment

### 3.1 Netlify'da Site Oluşturma:
1. https://app.netlify.com → "Add new site" → "Import from Git"
2. GitHub → "Kademe-KYS" repository seçin
3. Build settings:
   - **Build command**: `cd src/frontend/kys-frontend && npm install && npm run build`
   - **Publish directory**: `src/frontend/kys-frontend/build`

### 3.2 Environment Variables:
Site Settings → Environment variables → "Add variable":

```env
REACT_APP_API_URL=https://your-railway-app.railway.app/api
REACT_APP_NAME=Kademe KYS
REACT_APP_VERSION=1.0.0
NODE_VERSION=18
NPM_VERSION=9
```

### 3.3 Domain Ayarlama:
1. Site settings → Domain management
2. "Add custom domain" (opsiyonel)
3. Site URL'ini not alın (örn: https://magical-app-name.netlify.app)

## 🔗 4. Cross-Service Bağlantı

### 4.1 Railway CORS Güncelleme:
Railway'daki `CORS_ORIGINS` değişkenini Netlify URL'iniz ile güncelleyin:
```
CORS_ORIGINS=https://your-actual-netlify-url.netlify.app,http://localhost:3000
```

### 4.2 Netlify API URL Güncelleme:
Railway deployment URL'inizi alıp Netlify'daki `REACT_APP_API_URL` değişkenini güncelleyin:
```
REACT_APP_API_URL=https://your-actual-railway-url.railway.app/api
```

## ✅ 5. Test ve Doğrulama

### 5.1 Backend Test:
```bash
curl https://your-railway-app.railway.app/health
# Response: {"status":"OK","timestamp":"..."}
```

### 5.2 Frontend Test:
1. Netlify URL'inizi tarayıcıda açın
2. Dashboard'ın yüklendiğini kontrol edin
3. Bir modülü açmaya çalışın

## 🛠️ 6. Deployment URLs

Deployment tamamlandıktan sonra bu URL'leri not edin:

- **Frontend**: https://your-app.netlify.app
- **Backend API**: https://your-app.railway.app  
- **Database**: MongoDB Atlas Cluster

## 🔧 7. Sorun Giderme

### Backend Sorunları:
- Railway Logs: Dashboard → Deployments → Logs
- Health check: `/health` endpoint'ini test edin

### Frontend Sorunları:
- Netlify Logs: Site Overview → "Production deploys" → "View details"
- Console errors için tarayıcı developer tools'unu kontrol edin

### Database Bağlantı Sorunları:
- MongoDB Atlas Network Access ayarlarını kontrol edin
- Connection string'de password'un doğru olduğundan emin olun

## 🎯 8. Production Ready Checklist

- [ ] MongoDB Atlas cluster oluşturuldu
- [ ] Database user ve password ayarlandı
- [ ] Railway backend deploy edildi
- [ ] Netlify frontend deploy edildi
- [ ] Environment variables ayarlandı
- [ ] CORS yapılandırması tamamlandı
- [ ] Health check endpoints çalışıyor
- [ ] Frontend-Backend bağlantısı test edildi
- [ ] Production URL'leri dokümante edildi

## 🔒 Güvenlik Notları

- JWT_SECRET için güçlü, rastgele bir key kullanın
- MongoDB password'larını güvenli tutun
- Production environment'da debug modunu kapatın
- HTTPS kullanımını zorunlu kılın
- Rate limiting ekleyin (opsiyonel)

## 📞 Destek

Deployment sırasında sorun yaşarsanız:
1. Railway/Netlify/MongoDB Atlas dokümantasyonlarını inceleyin
2. Log dosyalarını kontrol edin  
3. Environment variables'ların doğru ayarlandığından emin olun

---

**Not**: Bu rehber tamamlandıktan sonra uygulamanız https://your-app.netlify.app adresinde online olarak kullanılabilir olacaktır. 