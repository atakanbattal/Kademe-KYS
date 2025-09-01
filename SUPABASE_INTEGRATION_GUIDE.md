# Supabase Entegrasyon Rehberi

Bu rehber, Kademe A.Ş. Kalite Yönetim Sistemi'nin MongoDB'den Supabase PostgreSQL'e geçiş sürecini açıklamaktadır.

## 📋 Genel Bakış

Proje artık Supabase PostgreSQL veritabanı kullanmaktadır. Bu değişiklik şunları sağlar:
- Modern PostgreSQL veritabanı
- Gerçek zamanlı güncellemeler
- Güçlü rol tabanlı erişim kontrolü (RLS)
- Otomatik yedekleme ve ölçeklendirme
- REST API ve gerçek zamanlı abonelikler

## 🚀 Kurulum Adımları

### 1. Supabase Projesi Oluşturma

1. [Supabase Dashboard](https://app.supabase.com)'a gidin
2. "New Project" butonuna tıklayın
3. Proje adını girin: `kys-kalite-yonetim-sistemi`
4. Güçlü bir database password oluşturun
5. Bölge seçin (Europe West için `eu-west-1`)
6. Projeyi oluşturun

### 2. Veritabanı Şeması Oluşturma

1. Supabase Dashboard'da "SQL Editor" sekmesine gidin
2. `supabase_migrations/01_initial_schema.sql` dosyasının içeriğini kopyalayın
3. SQL Editor'e yapıştırın ve "Run" butonuna tıklayın
4. Tüm tablolar, indeksler ve fonksiyonlar oluşturulacaktır

### 3. Ortam Değişkenlerini Ayarlama

#### Backend için (.env):
```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Server Configuration
PORT=5003
NODE_ENV=development
JWT_SECRET=your-jwt-secret

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

#### Frontend için (kys-frontend/.env):
```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

# API Configuration
REACT_APP_API_URL=http://localhost:5003/api
```

### 4. Supabase Credentials Alma

1. Supabase Dashboard'da "Settings" > "API" sekmesine gidin
2. "Project URL" ve "anon/public" anahtarını kopyalayın
3. "service_role" anahtarını kopyalayın (sadece backend için)

## 🔧 Geliştirme Ortamı

### Gereksinimler
- Node.js 16+
- npm veya yarn
- Supabase hesabı

### Backend Başlatma
```bash
cd "src/backend"
npm install
npm run dev
```

### Frontend Başlatma
```bash
cd "src/frontend/kys-frontend"
npm install
npm start
```

## 📊 Veritabanı Yapısı

### Tablolar

1. **users**: Kullanıcı yönetimi
   - Roller: admin, quality, production, supplier, viewer
   - Şifre hashleme ve JWT token desteği

2. **suppliers**: Tedarikçi yönetimi
   - Benzersiz kod sistemi
   - Malzeme kategorileri (JSON array)

3. **material_quality_controls**: Malzeme kalite kontrolleri
   - Sertifika özellikleri (JSON)
   - Tedarikçi-malzeme-parti benzersizlik kısıtı

4. **quality_control_reports**: Kalite kontrol raporları
   - Otomatik rapor ID üretimi
   - Test sonuçları (JSON)

5. **vehicle_quality_controls**: Araç kalite kontrolleri
   - Durum geçmişi takibi
   - Eksiklik yönetimi
   - Otomatik uyarı sistemi

6. **tank_leak_tests**: Tank sızıntı testleri
   - Otomatik basınç hesaplaması
   - Test sonuç belirleme

7. **deviation_approvals**: Sapma onayları
   - Çok aşamalı onay süreci
   - Araç bilgileri (JSON)

### Önemli Özellikler

- **Otomatik Zaman Damgaları**: created_at ve updated_at otomatik güncelleme
- **UUID Primary Keys**: Güvenli ve benzersiz anahtarlar
- **JSONB Support**: Esnek veri yapıları
- **Indexing**: Optimum performans
- **Triggers**: İş mantığı otomasyonu
- **RLS (Row Level Security)**: Güvenlik politikaları

## 🔐 Güvenlik

### Rol Tabanlı Erişim Kontrolü (RLS)

Supabase RLS politikaları şu erişim seviyelerini sağlar:
- **Admin**: Tüm veri erişimi
- **Quality**: Kalite kontrol verileri
- **Production**: Üretim verileri
- **Supplier**: Kendi tedarikçi verileri
- **Viewer**: Sadece okuma erişimi

### JWT Token Doğrulama

Backend JWT token doğrulama kullanır:
- 30 günlük token süresi
- Kullanıcı aktif durumu kontrolü
- Rol bazlı yetkilendirme middleware

## 📱 Frontend Entegrasyonu

### API İletişimi

Frontend iki şekilde çalışabilir:
1. **Backend API**: Mevcut axios API servisi (önerilen)
2. **Direct Supabase**: Doğrudan Supabase client (gelecek özellikler için)

### Real-time Özellikler

Supabase real-time özellikleri:
```typescript
// Malzeme kalite kontrol değişikliklerini dinle
supabaseService.kys.realtime.subscribeMaterialQualityControls((payload) => {
  console.log('Malzeme kalite kontrol güncellemesi:', payload);
});
```

## 🚀 Production Deployment

### Supabase Production Ayarları

1. **Database Backup**: Otomatik günlük yedekleme aktif
2. **SSL Connections**: Zorunlu SSL bağlantıları
3. **Connection Pooling**: Yüksek performans için
4. **Monitoring**: Otomatik izleme ve uyarılar

### Environment Variables (Production)

```bash
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=very-secure-random-string
PORT=5003
```

## 🧪 Test Verisi

Test verisi oluşturmak için:

```sql
-- Test kullanıcısı
INSERT INTO users (name, email, password_hash, role, department)
VALUES ('Test Admin', 'admin@test.com', '$2a$10$hashedpassword', 'admin', 'IT');

-- Test tedarikçisi
INSERT INTO suppliers (name, code, contact_person, email, phone, address, material_categories)
VALUES ('Test Tedarikçi', 'TEST001', 'John Doe', 'test@supplier.com', '+90532123456', 'Test Address', ARRAY['Metal', 'Plastic']);
```

## 🔧 Troubleshooting

### Yaygın Sorunlar

1. **Bağlantı Hatası**
   - Supabase URL ve API anahtarlarını kontrol edin
   - Internet bağlantısını kontrol edin

2. **Auth Hatası**
   - JWT secret doğruluğunu kontrol edin
   - Token süresinin dolmadığından emin olun

3. **Database Schema Hatası**
   - Migration dosyasının tamamen çalıştırıldığından emin olun
   - RLS politikalarının doğru yapılandırıldığını kontrol edin

### Log Kontrolü

Backend logları:
```bash
cd src/backend
npm run dev
# Konsol çıktısını takip edin
```

Supabase Dashboard'da "Logs" sekmesinden veritabanı loglarını kontrol edebilirsiniz.

## 📚 Faydalı Linkler

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)

## 💡 Gelecek Özellikler

1. **File Storage**: Sertifika ve dosya yükleme için Supabase Storage
2. **Real-time Dashboard**: Canlı güncellemeler
3. **Advanced Analytics**: PostgreSQL analitik fonksiyonları
4. **Edge Functions**: Serverless fonksiyonlar
5. **Multi-tenant Architecture**: Çoklu şirket desteği

## 🆘 Destek

Sorunlar için:
1. Bu rehberi kontrol edin
2. Supabase Dashboard loglarını inceleyin
3. Backend konsol çıktısını kontrol edin
4. GitHub issues oluşturun

---

**Not**: Bu entegrasyon MongoDB'yi tamamen değiştirir. Eski MongoDB konfigürasyonları artık kullanılmamaktadır.
