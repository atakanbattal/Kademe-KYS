// ===============================================
// 🔥 TEDARİKÇİ KALİTE YÖNETİMİ ACİL DÜZELTME
// ===============================================
// Bu scripti browser console'da çalıştırın!

console.log('🔥 Tedarikçi Kalite Yönetimi ACİL düzeltme başlatılıyor...');

// 1. TEDARİKÇİLER
const suppliers = [
  {
    id: 'SUP-001',
    name: 'Seçkinler Metal A.Ş.',
    code: 'SM001',
    type: 'onaylı',
    status: 'onaylı',
    category: 'stratejik',
    supplyType: 'malzeme',
    contact: {
      email: 'info@seckinlermetal.com',
      phone: '+90 212 555 0123',
      address: 'İstanbul Sanayi Sitesi',
      contactPerson: 'Ahmet Seçkin'
    },
    performanceScore: 92,
    qualityRating: 4.5,
    lastAuditDate: '2024-01-15',
    approvalDate: '2023-06-20',
    certifications: ['ISO 9001', 'TS 16949']
  },
  {
    id: 'SUP-002',
    name: 'Demir Çelik San. Ltd.',
    code: 'DC002',
    type: 'onaylı',
    status: 'onaylı',
    category: 'kritik',
    supplyType: 'malzeme',
    contact: {
      email: 'contact@demircelik.com',
      phone: '+90 232 444 5566',
      address: 'İzmir Atatürk OSB',
      contactPerson: 'Mehmet Demir'
    },
    performanceScore: 88,
    qualityRating: 4.2,
    lastAuditDate: '2024-02-10',
    approvalDate: '2023-08-15',
    certifications: ['ISO 9001', 'ISO 14001']
  },
  {
    id: 'SUP-003',
    name: 'Kalite Plastik A.Ş.',
    code: 'KP003',
    type: 'onaylı',
    status: 'onaylı',
    category: 'standart',
    supplyType: 'malzeme',
    contact: {
      email: 'info@kaliteplastik.com',
      phone: '+90 312 333 7788',
      address: 'Ankara Siteler',
      contactPerson: 'Ayşe Kaya'
    },
    performanceScore: 85,
    qualityRating: 4.0,
    lastAuditDate: '2024-01-25',
    approvalDate: '2023-09-10',
    certifications: ['ISO 9001']
  },
  {
    id: 'SUP-004',
    name: 'Test Tedarikçi Ltd.',
    code: 'TT004',
    type: 'değerlendirmede',
    status: 'değerlendirmede',
    category: 'potansiyel',
    supplyType: 'hizmet',
    contact: {
      email: 'test@testtedarikci.com',
      phone: '+90 216 999 1122',
      address: 'İstanbul Anadolu Yakası',
      contactPerson: 'Test User'
    },
    performanceScore: 65,
    qualityRating: 3.2,
    lastAuditDate: '2024-03-01',
    approvalDate: null,
    certifications: []
  }
];

// 2. UYGUNSUZLUKLAR
const nonconformities = [
  {
    id: 'NC-001',
    supplierId: 'SUP-001',
    supplierName: 'Seçkinler Metal A.Ş.',
    description: 'Malzeme kalite standartlarının altında',
    type: 'kalite',
    severity: 'yüksek',
    status: 'açık',
    detectedDate: '2024-03-10',
    reportedBy: 'Kalite Kontrol Ekibi',
    correctiveAction: 'Tedarikçi ile görüşme yapıldı, düzeltici faaliyet planı hazırlandı',
    targetCloseDate: '2024-03-25'
  },
  {
    id: 'NC-002',
    supplierId: 'SUP-002',
    supplierName: 'Demir Çelik San. Ltd.',
    description: 'Teslimat gecikmeleri',
    type: 'teslimat',
    severity: 'orta',
    status: 'açık',
    detectedDate: '2024-03-12',
    reportedBy: 'Satın Alma Departmanı',
    correctiveAction: 'Teslimat programı revize edildi',
    targetCloseDate: '2024-03-20'
  },
  {
    id: 'NC-003',
    supplierId: 'SUP-003',
    supplierName: 'Kalite Plastik A.Ş.',
    description: 'Ürün ambalajında hasar',
    type: 'ambalaj',
    severity: 'düşük',
    status: 'açık',
    detectedDate: '2024-03-15',
    reportedBy: 'Gelen Kontrol',
    correctiveAction: 'Ambalaj prosedürü güncellendi',
    targetCloseDate: '2024-03-22'
  },
  {
    id: 'NC-004',
    supplierId: 'SUP-001',
    supplierName: 'Seçkinler Metal A.Ş.',
    description: 'Sertifika süresi dolmuş',
    type: 'dokümantasyon',
    severity: 'orta',
    status: 'kapalı',
    detectedDate: '2024-02-20',
    reportedBy: 'Doküman Kontrol',
    correctiveAction: 'Yeni sertifika temin edildi',
    targetCloseDate: '2024-03-01',
    closeDate: '2024-02-28'
  }
];

// 3. HATALAR
const defects = [
  {
    id: 'DEF-001',
    supplierId: 'SUP-001',
    supplierName: 'Seçkinler Metal A.Ş.',
    partNumber: 'SM-12345',
    defectType: 'boyutsal hata',
    description: 'Ölçüler tolerans dışında',
    quantity: 25,
    severity: 'kritik',
    status: 'açık',
    detectedDate: '2024-03-14',
    reportedBy: 'Kalite Kontrol',
    correctiveAction: 'Parçalar iade edildi, yeni lot bekleniyor',
    cost: 1500.50
  },
  {
    id: 'DEF-002',
    supplierId: 'SUP-002',
    supplierName: 'Demir Çelik San. Ltd.',
    partNumber: 'DC-67890',
    defectType: 'yüzey kalitesi',
    description: 'Çizikler ve lekeler mevcut',
    quantity: 10,
    severity: 'orta',
    status: 'açık',
    detectedDate: '2024-03-16',
    reportedBy: 'Gelen Kontrol',
    correctiveAction: 'Yüzey işlem süreçleri revize ediliyor',
    cost: 850.00
  },
  {
    id: 'DEF-003',
    supplierId: 'SUP-003',
    supplierName: 'Kalite Plastik A.Ş.',
    partNumber: 'KP-11111',
    defectType: 'renk uyumsuzluğu',
    description: 'Renk standart RAL koduna uymuyor',
    quantity: 50,
    severity: 'düşük',
    status: 'açık',
    detectedDate: '2024-03-18',
    reportedBy: 'Kalite Kontrol',
    correctiveAction: 'Renk standardı netleştirildi',
    cost: 320.75
  },
  {
    id: 'DEF-004',
    supplierId: 'SUP-002',
    supplierName: 'Demir Çelik San. Ltd.',
    partNumber: 'DC-55555',
    defectType: 'malzeme hatası',
    description: 'Yanlış çelik kalitesi kullanılmış',
    quantity: 5,
    severity: 'kritik',
    status: 'düzeltilmiş',
    detectedDate: '2024-02-25',
    reportedBy: 'Kalite Kontrol',
    correctiveAction: 'Malzeme değiştirildi, süreç kontrol edildi',
    cost: 2200.00,
    closeDate: '2024-03-05'
  }
];

// localStorage'a DOĞRUDAN yükle
localStorage.setItem('suppliers', JSON.stringify(suppliers));
localStorage.setItem('supplier-nonconformities', JSON.stringify(nonconformities));
localStorage.setItem('supplier-defects', JSON.stringify(defects));

console.log('✅ TEDARİKÇİ TEST VERİSİ YÜKLEME TAMAMLANDI!');
console.log('📊 Yüklenen veriler:');
console.log('- Tedarikçiler:', suppliers.length, 'kayıt');
console.log('- Uygunsuzluklar:', nonconformities.length, 'kayıt');
console.log('- Hatalar:', defects.length, 'kayıt');

// localStorage eventini tetikle
window.dispatchEvent(new Event('storage'));
window.dispatchEvent(new Event('supplierDataUpdated'));

console.log('🔄 Senkronizasyon sinyalleri gönderildi');
console.log('🎯 KPI sayfasını yenileyin veya 3 saniye bekleyin!');

// Test et
setTimeout(() => {
  console.log('🔍 VERİ KONTROLÜ:');
  const testSuppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
  const testNC = JSON.parse(localStorage.getItem('supplier-nonconformities') || '[]');
  const testDefects = JSON.parse(localStorage.getItem('supplier-defects') || '[]');
  
  console.log('Suppliers localStorage:', testSuppliers.length);
  console.log('Nonconformities localStorage:', testNC.length);
  console.log('Defects localStorage:', testDefects.length);
  
  if (testSuppliers.length > 0) {
    console.log('✅ BAŞARILI! Tedarikçi modülü artık BAĞLI olmalı!');
  } else {
    console.log('❌ HATA! Veri yüklenemedi!');
  }
}, 1000); 