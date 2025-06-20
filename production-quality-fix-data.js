// ===============================================
// 🏭 ÜRETİM KALİTE HATA TAKİP ACİL DÜZELTME
// ===============================================
// Bu scripti browser console'da çalıştırın!

console.log('🏭 Üretim Kalite Hata Takip ACİL düzeltme başlatılıyor...');

const productionQualityTracking = [
  {
    id: 'PQT-001',
    vehicleId: 'KDM-2024-001',
    chassisNumber: 'KDM240001',
    productModel: 'Kademe Kargo Van 2024',
    productionDate: '2024-03-10',
    productionLine: 'Hat-1',
    shift: 'Gündüz Vardiyası',
    inspectionStage: 'Final Kalite Kontrol',
    inspector: 'Ahmet Yılmaz',
    defects: [
      {
        id: 'DEF-001',
        defectType: 'Boyutsal Hata',
        location: 'Ön Kapı',
        description: 'Kapı çerçevesi 2mm tolerans dışı',
        severity: 'critical',
        status: 'open',
        detectedDate: '2024-03-10',
        repeatCount: 1,
        correctiveAction: 'Kapı çerçevesi yeniden ayarlandı'
      },
      {
        id: 'DEF-002',
        defectType: 'Yüzey Kalitesi',
        location: 'Sol Yan Panel',
        description: 'Boya akıntısı mevcut',
        severity: 'medium',
        status: 'in_progress',
        detectedDate: '2024-03-10',
        repeatCount: 1,
        correctiveAction: 'Boya işlemi tekrarlanacak'
      }
    ],
    qualityScore: 85,
    status: 'Rework Required',
    notes: 'Minor defects detected, rework in progress'
  },
  {
    id: 'PQT-002',
    vehicleId: 'KDM-2024-002',
    chassisNumber: 'KDM240002',
    productModel: 'Kademe Pickup 2024',
    productionDate: '2024-03-11',
    productionLine: 'Hat-2',
    shift: 'Gece Vardiyası',
    inspectionStage: 'Ara Kontrol',
    inspector: 'Fatma Kaya',
    defects: [
      {
        id: 'DEF-003',
        defectType: 'Elektriksel',
        location: 'Dashboard',
        description: 'Kablo bağlantı sorunu',
        severity: 'high',
        status: 'open',
        detectedDate: '2024-03-11',
        repeatCount: 2,
        correctiveAction: 'Kablo bağlantıları kontrol edildi'
      }
    ],
    qualityScore: 78,
    status: 'In Progress',
    notes: 'Electrical issue identified'
  },
  {
    id: 'PQT-003',
    vehicleId: 'KDM-2024-003',
    chassisNumber: 'KDM240003',
    productModel: 'Kademe Minibüs 2024',
    productionDate: '2024-03-12',
    productionLine: 'Hat-1',
    shift: 'Gündüz Vardiyası',
    inspectionStage: 'Final Kalite Kontrol',
    inspector: 'Mehmet Demir',
    defects: [],
    qualityScore: 98,
    status: 'Passed',
    notes: 'No defects found, ready for delivery'
  },
  {
    id: 'PQT-004',
    vehicleId: 'KDM-2024-004',
    chassisNumber: 'KDM240004',
    productModel: 'Kademe Kamyonet 2024',
    productionDate: '2024-03-13',
    productionLine: 'Hat-2',
    shift: 'Gündüz Vardiyası',
    inspectionStage: 'İlk Kontrol',
    inspector: 'Ayşe Özkan',
    defects: [
      {
        id: 'DEF-004',
        defectType: 'Mekanik',
        location: 'Motor Kompartmanı',
        description: 'Fren sistemi ayar hatası',
        severity: 'critical',
        status: 'open',
        detectedDate: '2024-03-13',
        repeatCount: 1,
        correctiveAction: 'Fren sistemi tekrar kalibre edilecek'
      },
      {
        id: 'DEF-005',
        defectType: 'Montaj Hatası',
        location: 'Arka Aksam',
        description: 'Vida sıkma torku yetersiz',
        severity: 'medium',
        status: 'open',
        detectedDate: '2024-03-13',
        repeatCount: 3,
        correctiveAction: 'Tork anahtarı kalibrasyonu yapıldı'
      }
    ],
    qualityScore: 65,
    status: 'Failed',
    notes: 'Multiple defects detected, requires significant rework'
  },
  {
    id: 'PQT-005',
    vehicleId: 'KDM-2024-005',
    chassisNumber: 'KDM240005',
    productModel: 'Kademe Kargo Van 2024',
    productionDate: '2024-03-14',
    productionLine: 'Hat-1',
    shift: 'Akşam Vardiyası',
    inspectionStage: 'Final Kalite Kontrol',
    inspector: 'Ali Vural',
    defects: [
      {
        id: 'DEF-006',
        defectType: 'Kozmetik',
        location: 'İç Döşeme',
        description: 'Kumaş çekme sorunu',
        severity: 'low',
        status: 'closed',
        detectedDate: '2024-03-14',
        closeDate: '2024-03-14',
        repeatCount: 1,
        correctiveAction: 'Döşeme değiştirildi'
      }
    ],
    qualityScore: 92,
    status: 'Passed',
    notes: 'Minor cosmetic issue fixed'
  }
];

// localStorage'a DOĞRUDAN yükle
localStorage.setItem('productionQualityTracking', JSON.stringify(productionQualityTracking));

console.log('✅ ÜRETİM KALİTE TEST VERİSİ YÜKLEME TAMAMLANDI!');
console.log('📊 Yüklenen veriler:');
console.log('- Üretim Kalite Kayıtları:', productionQualityTracking.length, 'kayıt');

// Toplam hata sayısını hesapla
const totalDefects = productionQualityTracking.reduce((sum, record) => 
  sum + (record.defects ? record.defects.length : 0), 0);
console.log('- Toplam Hata:', totalDefects, 'adet');

// localStorage eventini tetikle
window.dispatchEvent(new Event('storage'));
window.dispatchEvent(new Event('productionDataUpdated'));

console.log('🔄 Senkronizasyon sinyalleri gönderildi');
console.log('🎯 KPI sayfasını yenileyin veya 3 saniye bekleyin!');

// Test et
setTimeout(() => {
  console.log('🔍 VERİ KONTROLÜ:');
  const testData = JSON.parse(localStorage.getItem('productionQualityTracking') || '[]');
  
  console.log('Production Quality localStorage:', testData.length);
  
  if (testData.length > 0) {
    console.log('✅ BAŞARILI! Üretim Kalite modülü artık BAĞLI olmalı!');
  } else {
    console.log('❌ HATA! Veri yüklenemedi!');
  }
}, 1000); 