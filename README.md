# Entegre Kalite Yönetim Sistemi (KYS)

Kapsamlı, modüler ve sürdürülebilir bir entegre kalite yönetim sistemi uygulaması. Bu uygulama, kalite süreçlerinin otomasyonu, izlenebilirlik, raporlama, maliyet analizi ve sürekli güncellenebilir bir yapı ile profesyonel düzeyde kurumsal kalite yönetimi sağlar.

## Port Yapılandırması

Karışıklığı önlemek için tüm portlar standartlaştırılmıştır:

- **Frontend:** http://localhost:3000 (React standart portu)
- **Backend:** http://localhost:5000 (Express standart portu)

## Hızlı Başlatma

### Seçenek 1: Sadece Frontend
```bash
./start-app.sh
```

### Seçenek 2: Tam Sistem (Frontend + Backend)
```bash
./start-full-app.sh
```

### Manuel Başlatma

#### Backend
```bash
cd src/backend
npm install
npm run dev
```

#### Frontend
```bash
cd src/frontend/kys-frontend
npm install
npm start
```

## Geliştirme Notları

- **Sadece localhost:3000 kullanın** - diğer portlarda açılan uygulamalar başka projelerdir
- Port çakışması durumunda script'ler otomatik olarak eski process'leri kapatır
- Değişiklikleri her zaman http://localhost:3000 adresinde görebilirsiniz

## Modüller

### 1. Girdi Kalite Kontrol Modülü
- Malzeme bilgisi ve sertifika değerlerine göre otomatik kabul/red raporu
- EN 5817 Class B/C/D'ye göre kaynak hata limitleri
- Malzeme teknik bilgi veritabanı
- Sertifika karşılaştırma ve stok entegrasyonu

### 2. Tank Sızdırmazlık Testi Modülü
- Tank/test tipi, malzeme, kaynakçı, kalite personeli detayları
- Test sonuçlarının otomatik kaydı ve arşivlenmesi
- Görsel yükleme ve rapor otomasyonu

### 3. Kalitesizlik Maliyeti Modülü
- Hurda, yeniden işleme, test, fire, müşteri şikayeti maliyet hesaplamaları
- Üretim adımlarına göre maliyet takibi
- Zaman bazlı karşılaştırma ve analizler

### 4. DÖF ve 8D Yönetimi Modülü
- DÖF/8D açma, atama, kapatma, revizyon takibi
- Birim bazlı açık ve kapanan faaliyet oranları
- Kök neden analizi ve aksiyon takibi

### 5. Son Kontrol & Ara Kontrol Formları Modülü
- Araç/ürün bazlı dinamik form oluşturma
- Form builder özelliği
- PDF/Excel rapor çıkışı

### 6. Fan Testleri Modülü
- Fan tiplerine göre test parametreleri
- Otomatik test raporu oluşturma
- Geçmiş test kayıtları ve analiz

### 7. Ayarlar ve Yetkilendirme Modülü
- Kullanıcı tipi bazlı yetkilendirme
- Sistem parametreleri yönetimi
- Modül ekleme/çıkarma ve versiyon takibi

## Teknik Altyapı

### Frontend
- React.js
- Material UI
- TypeScript
- React Router
- React Query

### Backend
- Node.js (Express.js)
- MongoDB
- JWT Authentication
- TypeScript

## Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (v14+)
- MongoDB

### Backend Kurulumu
```bash
cd src/backend
npm install
npm run dev
```

### Frontend Kurulumu
```bash
cd src/frontend/kys-frontend
npm install
npm start
```

## Proje Durumu

Bu proje halen geliştirme aşamasındadır. Şu ana kadar:

- [x] Temel proje yapısı oluşturuldu
- [x] Kullanıcı kimlik doğrulama sistemi
- [x] Girdi Kalite Kontrol Modülü (temel)
- [x] Tank Sızdırmazlık Testi Modülü (temel)
- [ ] Kalitesizlik Maliyeti Modülü
- [ ] DÖF ve 8D Yönetimi Modülü
- [ ] Son Kontrol & Ara Kontrol Formları Modülü
- [ ] Fan Testleri Modülü
- [ ] Ayarlar ve Yetkilendirme Modülü genişletme

## Katkıda Bulunma

1. Bu depoyu fork edin
2. Özellik dalınızı oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Dalınıza push edin (`git push origin feature/amazing-feature`)
5. Bir Pull Request açın

## Lisans

Bu proje Kademe A.Ş. tarafından özel kullanım için geliştirilmektedir.

## İletişim

Kademe A.Ş. - [web sitesi] - info@kademe.com.tr 