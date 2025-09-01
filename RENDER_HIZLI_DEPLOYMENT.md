# 🚀 RENDER.COM HIZLI DEPLOYMENT

## Netlify Functions Çalışmıyor - Alternatif Çözüm

### 1. Render.com'a Gidin
**LINK:** https://render.com

### 2. GitHub ile Giriş Yapın

### 3. New Web Service
- **Repository:** Kademe-KYS 
- **Branch:** main

### 4. Ayarlar:
- **Name:** kademe-kys-backend
- **Environment:** Node
- **Build Command:** `cd src/backend && npm install && npm run build`
- **Start Command:** `cd src/backend && npm start`
- **Instance Type:** Free

### 5. Environment Variables:
```
NODE_ENV=production
SUPABASE_URL=https://nzkxizhnikfshyhilefg.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56a3hpemhuaWtmc2h5aGlsZWZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MTYwMzIsImV4cCI6MjA3MjI5MjAzMn0.aRm8XdIvVrBffxT2VHH7A2bMqQsjiJiy3qkbJAkYhUk
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56a3hpemhuaWtmc2h5aGlsZWZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjcxNjAzMiwiZXhwIjoyMDcyMjkyMDMyfQ.22xhkrcxviakmu1PYJke-P4WNXDfPDCZMMi8Z5WnRFU
JWT_SECRET=kys_supabase_jwt_secret_2024_secure_random_key_123456789
FRONTEND_URL=https://kademe-qdms.netlify.app
```

### 6. Deploy Butonuna Basın

### 7. 5-10 dakika bekleyin

### 8. Backend URL'ini kopyalayın

### 9. Ben netlify.toml'da API URL'ini güncelleyeceğim

## SONUÇ: 
**Bu kesin çalışacak!** Render.com stabil ve güvenilir.
