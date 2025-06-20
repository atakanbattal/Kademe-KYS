# 🏭 AYD Kaynakhane Kalite Yönetim Sistemi

Modern, kapsamlı kalite yönetim sistemi - React, Node.js ve MongoDB ile geliştirilmiştir.

## 🚀 Özellikler

### 📋 Modüller
- **DÖF ve 8D Yönetimi** - Düzeltici ve önleyici faaliyetler
- **Risk Yönetimi** - Risk değerlendirme ve takip sistemi
- **Tedarikçi Kalite Yönetimi** - Tedarikçi performans takibi
- **Kalitesizlik Maliyet Yönetimi** - COPQ analizi ve raporlama
- **Üretim Kalite Takibi** - Üretim hata analizi
- **İç Tetkik Yönetimi** - Denetim planlama ve takip
- **Doküman Yönetimi** - Kalite dokümanları
- **Ekipman Kalibrasyon** - Kalibrasyon takip sistemi

### 🛠️ Teknoloji Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB Atlas
- **UI**: Material-UI (MUI)
- **Deployment**: Railway + Netlify

## 🔧 Kurulum

### Gereksinimler
- Node.js 18+
- MongoDB Atlas hesabı
- Git

### 🏗️ Development Setup

1. **Repository'yi klonlayın:**
```bash
git clone https://github.com/atakanbattal/kys-kalite-yonetim.git
cd kys-kalite-yonetim
```

2. **Backend kurulumu:**
```bash
cd src/backend
npm install
cp env.example .env
# .env dosyasını MongoDB Atlas bilgilerinizle güncelleyin
npm run dev
```

3. **Frontend kurulumu:**
```bash
# Ana dizinde
npm install
npm run dev
```

## 🚀 Deployment

### Railway + Netlify (Önerilen)

#### Backend (Railway)
1. [Railway.app](https://railway.app) hesabı oluşturun
2. "New Project" → "Deploy from GitHub Repo"
3. Repository'yi seçin
4. Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/kys-database
   PORT=5003
   NODE_ENV=production
   ```

#### Frontend (Netlify)
1. [Netlify.com](https://netlify.com) hesabı oluşturun
2. "New site from Git" → GitHub repository
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Environment Variables:
   ```
   VITE_API_URL=https://your-railway-backend-url.up.railway.app
   ```

### 🐳 Docker Deployment

```bash
# MongoDB Atlas bağlantı bilgilerini .env'e ekleyin
docker-compose up -d
```

## 📊 MongoDB Atlas Setup

1. [MongoDB Atlas](https://mongodb.com/atlas) hesabı oluşturun
2. Yeni cluster oluşturun
3. Database user oluşturun
4. Network Access'te IP whitelist ekleyin (0.0.0.0/0 tüm IP'ler için)
5. Connect → "Connect your application" → Connection string'i kopyalayın

## 🔐 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/kys-database
PORT=5003
NODE_ENV=production
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=https://your-frontend-domain.netlify.app
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-domain.up.railway.app
```

## 📱 Kullanım

1. Sistem açıldığında Dashboard'dan başlayın
2. Sol menüden istediğiniz modüle geçin
3. Her modül localStorage ile veri saklar (demo amaçlı)
4. Production'da MongoDB Atlas kullanılır

## 🧪 Test Data

Test verisi yüklemek için browser console'da:
```javascript
// Kalitesizlik maliyeti test verisi
localStorage.setItem('kys-cost-management-data', JSON.stringify([
  {
    id: 1,
    tarih: '2024-01-15',
    parcaKodu: 'PKD001',
    maliyetTuru: 'hurda',
    maliyet: 2500,
    departman: 'kaynak',
    aciklama: 'Kaynak hatası'
  }
]));
```

## 🤝 Katkıda Bulunma

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/YeniOzellik`)
3. Commit your Changes (`git commit -m 'Yeni özellik eklendi'`)
4. Push to the Branch (`git push origin feature/YeniOzellik`)
5. Open a Pull Request

## 📄 License

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

**Atakan Battal**
- Email: battalatakan@outlook.com
- GitHub: [@atakanbattal](https://github.com/atakanbattal)

## 🔗 Faydalı Linkler

- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Railway Docs](https://docs.railway.app/)
- [Netlify Docs](https://docs.netlify.com/)
- [React Docs](https://react.dev/)
- [Material-UI](https://mui.com/)

---

**🏭 AYD Kaynakhane için özel geliştirilmiştir** 