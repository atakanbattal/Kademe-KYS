# 🚀 RENDER.COM BACKEND DEPLOYMENT GUIDE

## Hızlı Deployment Adımları

### 1. Render.com Hesabı Oluşturun
- [render.com](https://render.com) adresine gidin
- GitHub ile giriş yapın

### 2. Repository Bağlayın
- **New Web Service** butonuna tıklayın
- GitHub repository'nizı seçin: `Kademe-KYS`
- **Connect** butonuna tıklayın

### 3. Deployment Ayarları

#### Build Settings:
- **Name**: `kademe-kys-backend`
- **Region**: `Oregon (US West)`
- **Branch**: `main`
- **Runtime**: `Node`

#### Build & Deploy:
- **Build Command**: `cd src/backend && npm install && npm run build`
- **Start Command**: `cd src/backend && npm start`

#### Advanced:
- **Health Check Path**: `/health`
- **Auto-Deploy**: `Yes`

### 4. Environment Variables Ekleyin

Render Dashboard'da **Environment** sekmesine gidin ve şu değişkenleri ekleyin:

```
NODE_ENV=production
SUPABASE_URL=https://nzkxizhnikfshyhilefg.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56a3hpemhuaWtmc2h5aGlsZWZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MTYwMzIsImV4cCI6MjA3MjI5MjAzMn0.aRm8XdIvVrBffxT2VHH7A2bMqQsjiJiy3qkbJAkYhUk
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56a3hpemhuaWtmc2h5aGlsZWZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjcxNjAzMiwiZXhwIjoyMDcyMjkyMDMyfQ.22xhkrcxviakmu1PYJke-P4WNXDfPDCZMMi8Z5WnRFU
JWT_SECRET=kys_supabase_jwt_secret_2024_secure_random_key_123456789
FRONTEND_URL=https://kademe-qdms.netlify.app
```

### 5. Deploy Butonuna Basın!

Render otomatik olarak:
- ✅ Repository'yi çekecek
- ✅ Dependencies yükleyecek  
- ✅ TypeScript build yapacak
- ✅ Backend'i başlatacak

### 6. URL'yi Kopyalayın

Deploy tamamlandıktan sonra:
- Dashboard'da backend URL'inizi göreceksiniz
- Örnek: `https://kademe-kys-backend.onrender.com`

### 7. Test Edin

```bash
curl https://kademe-kys-backend.onrender.com/health
curl -X POST https://kademe-kys-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"atakan.battal@kademe.com.tr","password":"atakan1234"}'
```

## 🎯 Sonuç

Backend deployment tamamlandıktan sonra:
1. ✅ Netlify'daki frontend otomatik olarak yeni backend URL'ini kullanacak
2. ✅ Giriş hatası çözülecek
3. ✅ Production ortamında sorunsuz çalışacak

**Deployment süresi: ~5-10 dakika**
