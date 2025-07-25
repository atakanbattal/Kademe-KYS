# 🚗 Araç Kalite Kontrol Takip Sistemi

## 📋 Sistem Özeti

Araç Kalite Kontrol Takip Sistemi, ürettiğiniz tüm araçların (HSCK, KDM35, Çelik 2000 vb.) üretimden kalite kontrole geçiş sürecini, kalite kontrol eksikliklerini, üretime geri dönüşlerini ve sevkiyat süreçlerini eksiksiz takip etmenizi sağlayan kapsamlı bir web tabanlı sistemdir.

## 🎯 Ana Özellikler

### ✅ **Araç Takip ve Yönetimi**
- Araç temel bilgileri (isim, model, seri no, müşteri, SPS numarası)
- Durum bazlı iş akışı (Üretim → Kalite → Üretime Dönüş → Sevke Hazır → Sevk Edildi)
- Tam süreç zinciri takibi ve tarih geçmişi

### ✅ **Kalite Kontrol Yönetimi**
- Eksiklik/hata kaydı ve takibi
- Departman ve sorumlu kişi bazlı atama
- Öncelik seviyesi belirleme (Düşük, Orta, Yüksek, Kritik)
- Eksiklik çözüm süreci takibi

### ✅ **Otomatik Uyarı Sistemi**
- 2 günden fazla üretimde bekleyen araçlar için otomatik uyarı
- Gecikme analizi ve erken müdahale
- Dashboard'da görsel uyarılar

### ✅ **Dashboard ve Raporlama**
- Anlık durum istatistikleri
- Son aktiviteler listesi
- Uyarılar ve gecikmeler
- Filtreleme ve arama özellikleri

## 🚀 Sisteme Erişim

1. **Ana menüden erişim:** Kalite Yönetimi → **Araç Kalite Kontrol Takip**
2. **Doğrudan URL:** `/vehicle-quality-control`

## 💻 Kullanım Kılavuzu

### 1. **Dashboard Görünümü**
- Toplam araç sayısı ve durum dağılımı
- Kalitede bekleyen araç sayısı
- Geciken araç uyarıları
- Son aktiviteler

### 2. **Yeni Araç Ekleme**

**🎯 Model-Araç Eşleşmeleri:**
- **HSCK:** 6+1, 8+1, 10+1,5, 13+1,5, 14+1,5, 15+1,5, 16+2, 22+2, 14+2
- **Araç Üstü Vakumlu:** KDM35, KDM80S, İstac6, KDM45, KDM75
- **Mekanik Süpürge:** Çelik 2000, FTH, Ural
- **Kompakt Araç:** AGA2100, AGA3000, AGA6000
- **Çay Toplama Makinesi:** Çay Toplama Makinesi
- **Rusya Motor Odası:** RMO
- **Özel (Manuel Giriş):** Kullanıcı tanımlı model/araç adları

```
Gerekli Bilgiler:
- Model Seçimi (dropdown menü)
- Araç Adı (model bazlı akıllı seçim veya manuel giriş)
- Seri Numarası (benzersiz olmalı)
- Müşteri Adı
- SPS Numarası (opsiyonel)
- Öncelik Seviyesi (Düşük/Orta/Yüksek/Kritik)
- Üretim Tarihi
- Açıklama (opsiyonel)
```

**💡 Akıllı Seçim:** Model seçildiğinde, o modele özel araç adları otomatik olarak dropdown'da görünür.

### 3. **Kalite Kontrol Süreci**

#### **3.1. Kalite Kontrole Alma**
- Araç listesinden "Kalite Kontrole Al" butonuna tıklayın
- Durum otomatik olarak "Kalite Kontrolde" olarak güncellenir
- Başlangıç tarihi kayıt altına alınır

#### **3.2. Eksiklik Ekleme**
- Kalitede olan araçlara eksiklik ekleyebilirsiniz
- Her eksiklik için:
  - Detaylı açıklama
  - Sorumlu birim
  - Sorumlu kişi
  - Öncelik seviyesi
  - Notlar

#### **3.3. Üretime Geri Gönderme**
- Eksiklikler tespit edildiğinde aracı üretime geri gönderin
- Geri gönderme sebebi zorunlu olarak kaydedilir
- 2 gün sonra otomatik uyarı sistemine girer

#### **3.4. Sevke Hazır İşaretleme**
- Tüm eksiklikler giderildikten sonra
- "Sevke Hazır" durumuna geçirin
- Bu aşamada araç sevkiyata hazır hale gelir

#### **3.5. Sevkiyat**
- Son aşama olarak "Sevk Et" işlemini gerçekleştirin
- Sevkiyat notları ekleyebilirsiniz
- Araç durumu "Sevk Edildi" olarak işaretlenir

### 4. **Filtreleme ve Arama**
- **Durum Filtresi:** Belirli durumdaki araçları görüntüleyin
- **Metin Arama:** Araç adı, seri no veya müşteri bazında arama
- **Tarih Aralığı:** Belirli tarih aralığındaki araçları filtreleyin
- **Model Filtresi:** Araç modeline göre gruplandırın

### 5. **Uyarılar Yönetimi**
- Uyarılar sekmesinde geciken araçları görüntüleyin
- Her uyarı için gecikme gün sayısı gösterilir
- Kritik (5+ gün) ve normal (2-4 gün) uyarılar renk kodlu

## 📊 API Endpoint'leri

```
GET    /api/vehicle-quality-control/dashboard     - Dashboard verileri
GET    /api/vehicle-quality-control/warnings      - Uyarılar listesi
GET    /api/vehicle-quality-control               - Araç listesi
POST   /api/vehicle-quality-control               - Yeni araç oluştur
GET    /api/vehicle-quality-control/:id           - Araç detayı
PATCH  /api/vehicle-quality-control/:id           - Araç güncelle
DELETE /api/vehicle-quality-control/:id           - Araç sil
PATCH  /api/vehicle-quality-control/:id/status    - Durum güncelle
POST   /api/vehicle-quality-control/:id/defects   - Eksiklik ekle
PATCH  /api/vehicle-quality-control/:id/defects/:defectId - Eksiklik güncelle
```

## 🎨 Durum Renk Kodları

| Durum | Renk | Açıklama |
|-------|------|----------|
| **Üretimde** | 🔵 Mavi | Araç üretim aşamasında |
| **Kalite Kontrolde** | 🟠 Turuncu | Kalite kontrol sürecinde |
| **Üretime Geri Döndü** | 🔴 Kırmızı | Eksiklik nedeniyle geri gönderildi |
| **Sevke Hazır** | 🟢 Yeşil | Tüm kontroller tamamlandı |
| **Sevk Edildi** | 🟣 Mor | Müşteriye teslim edildi |

## ⚠️ Önemli Notlar

1. **Seri Numarası Benzersizliği:** Her araç için farklı seri numarası kullanın
2. **Gecikme Takibi:** 2 günden fazla üretimde bekleyen araçlar otomatik uyarı alır
3. **Zorunlu Alanlar:** Araç adı, model, seri no ve müşteri bilgileri zorunludur
4. **Tarih Takibi:** Tüm durum değişiklikleri otomatik olarak tarihlendirilir
5. **Kullanıcı Takibi:** Kim ne zaman hangi işlemi yaptığı kayıt altına alınır

## 🔧 Teknik Detaylar

- **Frontend:** React 19 + TypeScript + Material-UI
- **Backend:** Node.js + Express + MongoDB
- **Veritabanı:** MongoDB (Mongoose ODM)
- **API:** RESTful API tasarımı
- **Responsive:** Tüm cihazlarda çalışır
- **Türkçe Desteği:** Tam Türkçe karakter desteği

## 🎯 İş Süreçleri

### **Tipik Araç Yaşam Döngüsü:**

1. **Araç Sisteme Eklenir** (Üretim durumunda)
2. **Kalite Kontrole Alınır** → Durum: "Kalite Kontrolde"
3. **Kalite Kontrol Tamamlanır:**
   - ✅ **Başarılı:** "Sevke Hazır" → "Sevk Edildi"
   - ❌ **Eksiklikli:** "Üretime Geri Döndü" → Eksiklik giderilir → Tekrar kaliteye
4. **Final Sevkiyat** → Süreç tamamlanır

### **Gecikme Yönetimi:**
- Üretime geri dönen araçlar 2 gün içinde kaliteye dönmeli
- 2+ gün gecikme = Sarı uyarı
- 5+ gün gecikme = Kırmızı kritik uyarı

## 📈 Raporlama

Sistem şu raporları otomatik oluşturur:
- Günlük durum raporu
- Gecikme analizi
- Departman performansı
- Müşteri bazlı durum
- Eksiklik trend analizi

---

## 🚀 Sistem Hazır!

Araç Kalite Kontrol Takip Sistemi başarıyla entegre edilmiştir ve kullanıma hazırdır. Herhangi bir sorun durumunda sistem yöneticisine başvurun.

**Geliştirildi:** Atakan Battal  
**Tarih:** 2024  
**Versiyon:** 1.0.0 