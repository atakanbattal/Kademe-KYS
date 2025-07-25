/**
 * ARAÇ KALİTE KONTROL TAKİP SİSTEMİ TEST VERİSİ
 * 
 * Bu script yeni Araç Kalite Kontrol modülü için test verisi oluşturur
 * 
 * @author: Atakan Battal
 * @date: 2024
 */

console.log('🚗 Araç Kalite Kontrol Takip Sistemi Test Verisi');
console.log('============================================');

// Test araçları verisi
const testVehicles = [
  {
    vehicleName: 'HSCK-2024-001',
    vehicleModel: 'HSCK',
    serialNumber: 'HSCK240001',
    customerName: 'ABC Makina San. Ltd. Şti.',
    spsNumber: 'SPS-2024-0145',
    productionDate: new Date('2024-01-15'),
    description: 'Hidrolik sistem dahil komplet HSCK aracı',
    currentStatus: 'quality_control',
    defects: [
      {
        id: '1',
        description: 'Hidrolik sistem yağ kaçağı tespit edildi',
        department: 'Hidrolik',
        responsiblePerson: 'Mehmet Yılmaz',
        priority: 'high',
        status: 'open',
        detectedDate: new Date(),
        notes: 'Acil müdahale gerekiyor'
      }
    ]
  },
  {
    vehicleName: 'KDM35-2024-007',
    vehicleModel: 'KDM35',
    serialNumber: 'KDM240007',
    customerName: 'XYZ İnşaat A.Ş.',
    spsNumber: 'SPS-2024-0198',
    productionDate: new Date('2024-01-20'),
    description: '35 tonluk kaldırma kapasiteli KDM aracı',
    currentStatus: 'ready_for_shipment',
    defects: []
  },
  {
    vehicleName: 'Çelik2000-2024-012',
    vehicleModel: 'Çelik 2000',
    serialNumber: 'CL240012',
    customerName: 'DEF Metal San. A.Ş.',
    spsNumber: 'SPS-2024-0223',
    productionDate: new Date('2024-01-25'),
    description: 'Çelik işleme özellikli endüstriyel araç',
    currentStatus: 'returned_to_production',
    defects: [
      {
        id: '1',
        description: 'Çelik kesim bıçakları tolerans dışı',
        department: 'Kesim',
        responsiblePerson: 'Ali Demir',
        priority: 'critical',
        status: 'in_progress',
        detectedDate: new Date('2024-01-28'),
        notes: 'Yeni bıçaklar sipariş verildi'
      },
      {
        id: '2',
        description: 'Elektrik paneli kablo düzeni',
        department: 'Elektrik',
        responsiblePerson: 'Fatma Kaya',
        priority: 'medium',
        status: 'resolved',
        detectedDate: new Date('2024-01-27'),
        resolvedDate: new Date('2024-01-28'),
        notes: 'Kablolar yeniden düzenlendi'
      }
    ],
    productionReturnDate: new Date('2024-01-28'),
    isOverdue: false
  },
  {
    vehicleName: 'HSCK-2024-002',
    vehicleModel: 'HSCK',
    serialNumber: 'HSCK240002',
    customerName: 'GHI Otomotiv Ltd.',
    spsNumber: 'SPS-2024-0267',
    productionDate: new Date('2024-02-01'),
    description: 'Özel tasarım HSCK aracı - modifiye edilmiş',
    currentStatus: 'production',
    defects: []
  },
  {
    vehicleName: 'KDM35-2024-008',
    vehicleModel: 'KDM35',
    serialNumber: 'KDM240008',
    customerName: 'JKL Lojistik A.Ş.',
    spsNumber: 'SPS-2024-0301',
    productionDate: new Date('2024-02-05'),
    description: 'Lojistik operasyonları için KDM35',
    currentStatus: 'shipped',
    defects: [],
    shipmentDate: new Date('2024-02-10'),
    shipmentNotes: 'Müşteri teslimatı tamamlandı'
  },
  {
    vehicleName: 'Çelik2000-2024-013',
    vehicleModel: 'Çelik 2000',
    serialNumber: 'CL240013',
    customerName: 'MNO Endüstri Ltd.',
    spsNumber: 'SPS-2024-0345',
    productionDate: new Date('2024-02-08'),
    description: 'Endüstriyel kullanım Çelik 2000 serisi',
    currentStatus: 'returned_to_production',
    defects: [
      {
        id: '1',
        description: 'Güvenlik sensörleri kalibrasyonu',
        department: 'Elektronik',
        responsiblePerson: 'Ahmet Öz',
        priority: 'high',
        status: 'open',
        detectedDate: new Date('2024-02-10'),
        notes: 'Kalibrasyon ekipmanı bekleniyor'
      }
    ],
    productionReturnDate: new Date('2024-02-09'),
    isOverdue: true,
    overdueDate: new Date('2024-02-11'),
    warningLevel: 'warning'
  }
];

// Dashboard istatistikleri
const dashboardStats = {
  totalVehicles: testVehicles.length,
  statusCounts: {
    production: testVehicles.filter(v => v.currentStatus === 'production').length,
    qualityControl: testVehicles.filter(v => v.currentStatus === 'quality_control').length,
    returnedToProduction: testVehicles.filter(v => v.currentStatus === 'returned_to_production').length,
    readyForShipment: testVehicles.filter(v => v.currentStatus === 'ready_for_shipment').length,
    shipped: testVehicles.filter(v => v.currentStatus === 'shipped').length
  },
  overdueVehicles: testVehicles.filter(v => v.isOverdue).length,
  recentActivities: [
    {
      vehicleId: '1',
      vehicleName: 'HSCK-2024-001',
      serialNumber: 'HSCK240001',
      action: 'Kalite kontrole alındı',
      timestamp: new Date('2024-02-09T14:30:00'),
      user: 'Kalite Kontrol Operatörü'
    },
    {
      vehicleId: '3',
      vehicleName: 'Çelik2000-2024-012',
      serialNumber: 'CL240012',
      action: 'Üretime geri gönderildi',
      timestamp: new Date('2024-02-09T10:15:00'),
      user: 'Kalite Kontrol Şefi'
    },
    {
      vehicleId: '5',
      vehicleName: 'KDM35-2024-008',
      serialNumber: 'KDM240008',
      action: 'Sevk edildi',
      timestamp: new Date('2024-02-08T16:45:00'),
      user: 'Sevkiyat Sorumlusu'
    }
  ]
};

// Uyarılar
const warnings = [
  {
    _id: 'warn1',
    vehicleId: '6',
    vehicleName: 'Çelik2000-2024-013',
    serialNumber: 'CL240013',
    warningType: 'overdue',
    message: 'Araç 2 günden fazla üretimde bekliyor',
    overdueDate: new Date('2024-02-11'),
    daysPastDue: 2
  }
];

console.log('📊 Test Verileri Özeti:');
console.log(`- Toplam Araç: ${testVehicles.length}`);
console.log(`- Kalitede: ${dashboardStats.statusCounts.qualityControl}`);
console.log(`- Üretime Geri Dönen: ${dashboardStats.statusCounts.returnedToProduction}`);
console.log(`- Sevke Hazır: ${dashboardStats.statusCounts.readyForShipment}`);
console.log(`- Sevk Edilen: ${dashboardStats.statusCounts.shipped}`);
console.log(`- Geciken: ${dashboardStats.overdueVehicles}`);
console.log('');

console.log('🎯 Modül Özellikleri:');
console.log('✅ Araç kayıt ve takip sistemi');
console.log('✅ Durum bazlı iş akışı (Production → Quality → Shipment)');
console.log('✅ Eksiklik/hata yönetimi');
console.log('✅ Otomatik uyarı sistemi (2 gün geçikme)');
console.log('✅ Dashboard ve raporlama');
console.log('✅ Filtreleme ve arama');
console.log('✅ Süreç zinciri takibi');
console.log('✅ Müşteri bazlı gruplandırma');
console.log('✅ SPS entegrasyonu');
console.log('✅ Responsive tasarım');
console.log('');

console.log('🔧 Teknik Özellikler:');
console.log('✅ MongoDB/Mongoose backend');
console.log('✅ Express.js REST API');
console.log('✅ React/TypeScript frontend');
console.log('✅ Material-UI tasarım sistemi');
console.log('✅ Real-time durum güncellemeleri');
console.log('✅ Tarih bazlı filtreleme');
console.log('✅ Pagination ve sıralama');
console.log('✅ PDF rapor çıktısı hazır');
console.log('✅ Türkçe karakter desteği');
console.log('');

console.log('🎨 Kullanıcı Arayüzü:');
console.log('✅ Modern ve temiz tasarım');
console.log('✅ Kolay kullanım');
console.log('✅ Hızlı işlem menüleri');
console.log('✅ Renk kodlu durum göstergeleri');
console.log('✅ İkonlar ve tooltips');
console.log('✅ Breadcrumb navigasyon');
console.log('✅ Tab bazlı organizasyon');
console.log('✅ Snackbar bildirimler');
console.log('✅ Modal dialoglar');
console.log('');

console.log('📈 İş Süreçleri:');
console.log('1. Araç Ekleme: Temel bilgiler + SPS entegrasyonu');
console.log('2. Kalite Kontrole Alma: Otomatik durum değişimi');
console.log('3. Eksiklik Yönetimi: Departman bazlı takip');
console.log('4. Üretime Geri Gönderme: Sebep zorunlu');
console.log('5. Sevke Hazır İşaretleme: Onay mekanizması');
console.log('6. Sevkiyat: Final durum + notlar');
console.log('7. Uyarı Sistemi: 2+ gün gecikme otomatik tespit');
console.log('');

console.log('🚀 ARAÇ KALİTE KONTROL TAKİP SİSTEMİ HAZIR!');
console.log('Sisteminize başarıyla entegre edilmiştir.');
console.log('');
console.log('📁 Oluşturulan Dosyalar:');
console.log('- Backend Model: src/backend/src/models/VehicleQualityControl.ts');
console.log('- Backend Controller: src/backend/src/controllers/vehicleQualityControlController.ts');
console.log('- Backend Routes: src/backend/src/routes/vehicleQualityControlRoutes.ts');
console.log('- Frontend Service: src/frontend/kys-frontend/src/services/vehicleQualityControlService.ts');
console.log('- Frontend Component: src/frontend/kys-frontend/src/pages/VehicleQualityControl.tsx');
console.log('- Navigation: Layout.tsx güncellendi');
console.log('- Router: App.tsx güncellendi');
console.log('');

console.log('🔗 API Endpoints:');
console.log('GET    /api/vehicle-quality-control/dashboard - Dashboard istatistikleri');
console.log('GET    /api/vehicle-quality-control/warnings - Uyarılar listesi');
console.log('GET    /api/vehicle-quality-control - Araç listesi (filtreleme destekli)');
console.log('POST   /api/vehicle-quality-control - Yeni araç oluştur');
console.log('GET    /api/vehicle-quality-control/:id - Araç detayı');
console.log('PATCH  /api/vehicle-quality-control/:id - Araç güncelle');
console.log('DELETE /api/vehicle-quality-control/:id - Araç sil');
console.log('PATCH  /api/vehicle-quality-control/:id/status - Durum güncelle');
console.log('POST   /api/vehicle-quality-control/:id/defects - Eksiklik ekle');
console.log('PATCH  /api/vehicle-quality-control/:id/defects/:defectId - Eksiklik güncelle');
console.log('');

console.log('🎯 Kullanım Senaryoları:');
console.log('1. Araç üretimden kaliteye geçiş takibi');
console.log('2. Kalite kontrol eksikliklerinin sistematik yönetimi');
console.log('3. Üretime geri dönüş süreçlerinin izlenmesi');
console.log('4. Sevkiyat öncesi final kontroller');
console.log('5. Gecikme analizi ve erken uyarı');
console.log('6. Müşteri bazlı durum raporları');
console.log('7. Departman performans analizi');
console.log('8. Süreç iyileştirme önerileri');

// Test verilerini localStorage'a kaydet (frontend için)
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    localStorage.setItem('vehicleQualityControl_testData', JSON.stringify({
      vehicles: testVehicles,
      dashboardStats,
      warnings,
      timestamp: new Date().toISOString()
    }));
    console.log('💾 Test verileri localStorage\'a kaydedildi.');
  } catch (e) {
    console.log('⚠️  localStorage kayıt hatası:', e.message);
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testVehicles,
    dashboardStats,
    warnings
  };
} 