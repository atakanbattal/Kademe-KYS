# Railway Environment Variables

Railway dashboard'ında Variables sekmesinde şu environment variable'ları ekleyin:

## 🔑 Gerekli Environment Variables:

```
MONGODB_URI=mongodb+srv://atakanbattal:Kvmb26Eta4@cluster0.5hio1wd.mongodb.net/kys-database?retryWrites=true&w=majority&appName=Cluster0

NODE_ENV=production

JWT_SECRET=your-super-secret-jwt-key-change-in-production-2024

CORS_ORIGIN=https://kys-kalite-yonetim.netlify.app

FRONTEND_URL=https://kys-kalite-yonetim.netlify.app

DB_NAME=kys-database
```

## 📝 Railway Deployment Adımları:

1. **Railway.app**'e gidin ve projenizi seçin
2. **Variables** sekmesine tıklayın  
3. Yukarıdaki variable'ları tek tek ekleyin
4. **Deployments** sekmesinden "Redeploy" yapın

## 🌐 MongoDB Atlas IP Whitelist:

MongoDB Atlas'ta IP whitelist'e şunları ekleyin:
- `0.0.0.0/0` (Tüm IP'ler - Railway için gerekli)
- Veya Railway'in IP aralıklarını özel olarak ekleyin

## ✅ Deployment Sonrası Test:

Backend URL'niz şöyle bir şey olacak:
`https://kys-kalite-yonetim-production.up.railway.app`

Test endpoint'leri:
- `/health` - Health check
- `/api/status` - API status
- `/` - Ana sayfa 