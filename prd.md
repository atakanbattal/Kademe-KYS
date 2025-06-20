# Entegre Kalite Yönetim Sistemi (KYS) - Product Requirements Document (PRD)

## 1. Proje Amacı ve Hedefi

Kapsamlı, modüler ve sürdürülebilir bir entegre kalite yönetim sistemi uygulaması geliştirmek. 
Hedef; kalite süreçlerinin otomasyonu, izlenebilirlik, raporlama, maliyet analizi ve sürekli güncellenebilir bir yapı ile profesyonel düzeyde kurumsal kalite yönetimi sağlamak.

---

### 2. Modüller ve Fonksiyonlar

### 2.1. Girdi Kalite Kontrol Modülü
- Malzeme bilgisi ve sertifika değerlerine göre otomatik kabul/red raporu oluşturur.
- Malzeme hakkında teknik bilgi veritabanı.
- Sertifika karşılaştırma ve stok entegrasyonu.

### 2.2. Tank Sızdırmazlık Testi Modülü
- Tank/test tipi, malzeme, kaynakçı, kalite personeli gibi detaylarla izlenebilirlik sağlar.
- Test sonuçlarının otomatik kaydı ve arşivlenmesi.
- Görsel yükleme ve rapor otomasyonu.

### 2.3. Kalitesizlik Maliyeti Modülü
- Hurda, yeniden işleme, test, fire, müşteri şikayeti gibi maliyet kalemlerini girerek toplam kalitesizlik maliyeti hesaplar.
- Tüm üretim adımlarına göre maliyet takibi.
- Zaman bazlı karşılaştırma ve analizler.

### 2.4. DÖF ve 8D Yönetimi Modülü
- DÖF/8D açma, atama, kapatma, revizyon takibi.
- Birim bazlı açık ve kapanan faaliyet oranları.
- Takip, dashboard, anlık bildirim sistemi.
- Kök neden analizi ve aksiyon takibi.

### 2.5. Son Kontrol & Ara Kontrol Formları Modülü
- Araç/ürün bazlı dinamik form oluşturma ve revizyon takibi.
- Form builder (alan ekleme/çıkarma, kategoriye göre düzenleme).
- PDF/Excel rapor çıkışı.
- Onay süreci ve revizyon geçmişi.

### 2.6. Fan Testleri Modülü
- Kullanılan fan tiplerine göre test parametreleri tanımlama.
- Otomatik test raporu oluşturma.
- Geçmiş test kayıtları ve analiz.

### 2.7. Ayarlar ve Yetkilendirme Modülü
- Kullanıcı tipi (yönetici, kalite, üretim, tedarikçi vs.) bazlı yetkilendirme.
- Sistem parametreleri ve kalitesizlik maliyeti gibi değerlerin yönetimi.
- Modül ekleme/çıkarma ve versiyon takibi.

### 2.8. EN 5817 Class B/C/D Kaynak Hata Limiti Modülü
- EN 5817 standardına göre Class B, C, D kaynak hata limitlerini otomatik olarak belirler ve raporlar.
- Kaynak dikişi türü, parça kalınlığı ve hata tipine göre limitleri hesaplar.
- Otomatik raporlama ve kalite seviyesi karşılaştırma ekranı.

### 2.9. WPS (Kaynak Prosedür Şartnamesi) Oluşturucu Modülü
- Farklı kaynak yöntemleri (MMA, MIG/MAG, TIG vb.) için WPS dokümanlarını otomatik olarak oluşturur.
- Malzeme türü, kalınlığı, kaynak teli/elektrodu, koruyucu gaz, kaynak pozisyonu, amper, voltaj ve hız gibi parametrelerin kullanıcı tarafından girilmesini sağlar.
- EN ISO 15609-1 ve ilgili standartlara uygun şekilde çıktı alır.
- Oluşturulan WPS’leri kaydeder, revizyon takibini yapar ve PDF formatında dışa aktarır.
- İstenirse mevcut WPQR (Kaynak Prosedürü Yeterlilik Kaydı) ile bağlantı kurabilir.

---

## 3. Teknik Mimari ve Geliştirme Planı

### 3.1. Ön Yüz (Frontend)
- **React.js** veya **Vue.js** (önerilir), klasik HTML+JS ile modülerlik sağlanamaz.
- Responsive (mobil/tablet uyumlu).
- Açılır/kapanır, koşullu render'lı, dinamik navigation bar.
- Yetki tabanlı dinamik alanlar.

### 3.2. Arka Yüz (Backend)
- **Node.js** (Express.js), **Python (Flask/FastAPI)** veya başka modern bir framework.
- **Veritabanı**: PostgreSQL, SQLite (gelişmiş arama, revizyon takibi, izlenebilirlik için).

### 3.3. Versiyonlama ve Sürdürülebilirlik
- **Her modül bağımsız klasörlerde/componentlerde** geliştirilecek.
- Kodlar **Git** ile versiyonlanacak.
- Her güncellemede prd.md revize edilecek.

### 3.4. Entegrasyonlar
- PDF/Excel export
- Resim/görsel yükleme
- E-posta veya anlık bildirim (isteğe bağlı)

---

## 4. Kullanıcı Hikayeleri & Akışlar (User Stories)

- Kalite kontrol personeli yeni bir girdi malzeme kaydı açar, sertifikayı yükler, sistem otomatik kabul/red raporu oluşturur.
- Üretim sorumlusu, son kontrol formunu dinamik olarak oluşturur ve üretime iletir.
- Yönetici, DÖF dashboard'unda tüm birimlerin açık/kapalı faaliyet oranlarını anlık görür.
- Kalite mühendisi, sızdırmazlık testi tamamlandığında sonuçları sisteme yükler ve geçmişe dönük raporları çeker.
- Fan test sorumlusu, yeni test parametreleri tanımlar ve otomatik rapor üretir.
- Maliyet analisti, üretim dönemlerine göre kalitesizlik maliyetini raporlar.

---

## 5. Dinamik ve Profesyonel UI/UX Detayları

- Modüler navigation bar (her modül ikon/isim ile hızlı erişim)
- Sekme/seçim bazlı açılır/kapanır paneller (ör. malzeme türüne göre ek sekmeler açılır)
- Her formda "revizyon geçmişi" ve "PDF/Excel" butonu
- Dashboard'da grafikler, oranlar, KPI'lar
- Yetki bazlı görünür/gizli alanlar

---

## 6. Revizyon ve Sürekli Gelişim

- Her modül/özellik için ayrı "değişiklik geçmişi" tutulacak.
- Yeni modül/özellik ekleme çıktıkça prd.md güncellenecek ve kod tabanına entegre edilecek.
- Kullanıcıdan gelen talepler ve geri bildirimler sonrası hızlı geliştirme döngüsü.

---

## 7. Yol Haritası & Gantt

1. **Mimari Kurulum (1 hafta)**
   - Dosya yapısı, temel navigation, ilk modül iskeleti
2. **Girdi Kalite Kontrol Modülü (2 hafta)**
3. **Sızdırmazlık Testi Modülü (1 hafta)**
4. **Kalitesizlik Maliyeti Modülü (1 hafta)**
5. **DÖF & 8D Yönetimi (2 hafta)**
6. **Son Kontrol/Ara Kontrol Formları (2 hafta)**
7. **Fan Testleri (1 hafta)**
8. **Ayarlar/Yetkilendirme (1 hafta)**
9. **Dashboard, raporlamalar, son testler (2 hafta)**
10. **Geri bildirim & revizyon döngüsü (sürekli)**

---

## 8. Riskler & Alternatifler

- **Tek dosyada modülleri büyütmekten kaçınılmalı.**
- Versiyonsuz çalışma ileride bakımda problem yaratır, GIT ile çalışılmalı.
- Backend eklenmezse veri güvenliği ve revizyon takibi zayıf olur.
- UI/UX için gerekirse hazır component library (MUI, Ant Design, Bootstrap) kullanılabilir.

---

## 9. Notlar

- Uygulama geliştirildikçe bu döküman güncellenecek.
- Tüm modüller dokümantasyon ile birlikte teslim edilecek.
- Kullanıcı eğitimleri ve kısa kullanım videoları hazırlanacak (isteğe bağlı). 