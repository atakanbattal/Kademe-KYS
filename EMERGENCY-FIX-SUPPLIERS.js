// EMERGENCY FIX - Tedarikçi verilerini hemen geri yükle
// Browser console'da çalıştırın: CTRL+V + ENTER

console.log("🚨 EMERGENCY TEDARIKÇI VERİ GERİ YÜKLEME!");
console.log("====================================");

// Tedarikçi verilerini hemen localStorage'a geri yükle
const emergencySuppliers = [
  {
    id: 'SUP-001',
    name: 'Seçkinler Metal A.Ş.',
    code: 'SM001',
    type: 'onaylı',
    category: 'stratejik',
    supplyType: 'malzeme',
    supplySubcategories: ['Ham Madde (Çelik, Alüminyum, Plastik)', 'Yarı Mamul (Profil, Sac, Boru)'],
    contact: {
      email: 'info@seckinlermetal.com',
      phone: '+90 212 555 0123',
      address: 'İstanbul Sanayi Sitesi',
      contactPerson: 'Ahmet Seçkin'
    },
    materialTypes: ['Çelik Levha', 'Profil'],
    performanceScore: 92,
    qualityScore: 95,
    deliveryScore: 88,
    riskLevel: 'düşük',
    status: 'aktif',
    registrationDate: '2020-01-15',
    lastAuditDate: '2024-06-15',
    nextAuditDate: '2025-06-15',
    auditStatus: 'planlı',
    nonconformityCount: 2,
    defectCount: 1,
    dofCount: 0,
    isActive: true
  },
  {
    id: 'SUP-002',
    name: 'Nisa Metal Ltd.',
    code: 'NM002',
    type: 'alternatif',
    category: 'stratejik',
    supplyType: 'hizmet',
    supplySubcategories: ['Taşeron İşçilik (Kaynak, Montaj)', 'Bakım ve Onarım Hizmetleri'],
    contact: {
      email: 'info@nisametal.com',
      phone: '+90 212 555 0124',
      address: 'Bursa Sanayi Sitesi',
      contactPerson: 'Fatma Nisa'
    },
    materialTypes: ['Çelik Levha', 'Profil'],
    performanceScore: 87,
    qualityScore: 90,
    deliveryScore: 85,
    riskLevel: 'düşük',
    status: 'aktif',
    registrationDate: '2021-03-20',
    lastAuditDate: '2024-07-10',
    nextAuditDate: '2025-07-10',
    auditStatus: 'planlı',
    nonconformityCount: 1,
    defectCount: 0,
    dofCount: 0,
    isActive: true
  },
  {
    id: 'SUP-003',
    name: 'Kaliteli Üretim A.Ş.',
    code: 'KAL-003',
    type: 'onaylı',
    category: 'kritik',
    supplyType: 'malzeme',
    supplySubcategories: ['Yarı Mamul (Profil, Sac, Boru)'],
    contact: {
      email: 'kalite@kaliteliuretim.com',
      phone: '+90 216 444 33 22',
      address: 'İzmir Atatürk Organize Sanayi',
      contactPerson: 'Kaliteli Üretim Müdürü'
    },
    materialTypes: ['Profil', 'Boru'],
    performanceScore: 94,
    qualityScore: 96,
    deliveryScore: 92,
    riskLevel: 'düşük',
    status: 'aktif',
    registrationDate: '2023-01-10',
    lastAuditDate: '2024-11-20',
    nextAuditDate: '2025-11-20',
    auditStatus: 'tamamlandı',
    nonconformityCount: 0,
    defectCount: 0,
    dofCount: 0,
    isActive: true
  },
  {
    id: 'SUP-004',
    name: 'Yedek Alternatif Ltd.',
    code: 'YAL-004',
    type: 'alternatif',
    category: 'genel',
    supplyType: 'malzeme',
    supplySubcategories: ['Ham Madde (Çelik, Alüminyum, Plastik)'],
    contact: {
      email: 'info@yedekalternatif.com',
      phone: '+90 312 777 88 99',
      address: 'Ankara Ostim Sanayi',
      contactPerson: 'Yedek Sorumlusu'
    },
    materialTypes: ['Alüminyum'],
    performanceScore: 82,
    qualityScore: 84,
    deliveryScore: 80,
    riskLevel: 'orta',
    status: 'aktif',
    registrationDate: '2023-06-15',
    lastAuditDate: '2024-09-10',
    nextAuditDate: '2025-09-10',
    auditStatus: 'tamamlandı',
    nonconformityCount: 2,
    defectCount: 1,
    dofCount: 1,
    isActive: true
  }
];

// Eşleştirme verisi
const emergencyPairs = [
  {
    id: 'PAIR-001',
    primarySupplier: emergencySuppliers[0], // Seçkinler Metal
    alternativeSuppliers: [emergencySuppliers[1]], // Nisa Metal
    materialType: 'Çelik Levha',
    category: 'stratejik',
    performanceComparison: {
      primaryScore: 92,
      alternativeScores: [{ id: 'SUP-002', score: 87 }],
      recommendation: 'Ana tedarikçi performansı üstün'
    },
    lastReviewDate: '2024-10-15',
    nextReviewDate: '2025-04-15'
  },
  {
    id: 'PAIR-002',
    primarySupplier: emergencySuppliers[2], // Kaliteli Üretim
    alternativeSuppliers: [emergencySuppliers[3]], // Yedek Alternatif
    materialType: 'Profil',
    category: 'kritik',
    performanceComparison: {
      primaryScore: 94,
      alternativeScores: [{ id: 'SUP-004', score: 82 }],
      recommendation: 'Ana tedarikçi performansı üstün'
    },
    lastReviewDate: '2024-11-01',
    nextReviewDate: '2025-05-01'
  }
];

// Uygunsuzluk verisi
const emergencyNonconformities = [
  {
    id: 'NC-001',
    supplierId: 'SUP-002',
    title: 'Geç Teslimat',
    description: 'Malzemeler 2 gün geç teslim edildi',
    category: 'teslimat',
    severity: 'orta',
    detectedDate: '2024-11-15',
    status: 'açık',
    dueDate: '2024-12-15',
    correctionCost: 3000,
    partCode: 'STL-001',
    delayDays: 2,
    recurrence: false
  }
];

// Hata verisi
const emergencyDefects = [
  {
    id: 'DEF-001',
    supplierId: 'SUP-004',
    defectType: 'Yüzey Hatası',
    description: 'Alüminyum profilde çizik',
    quantity: 5,
    detectedDate: '2024-11-10',
    batchNumber: 'ALU-2024-001',
    severity: 'minor',
    status: 'açık',
    correctionCost: 1500
  }
];

// Hemen localStorage'a kaydet
localStorage.setItem('suppliers', JSON.stringify(emergencySuppliers));
localStorage.setItem('supplier-pairs', JSON.stringify(emergencyPairs));
localStorage.setItem('supplier-nonconformities', JSON.stringify(emergencyNonconformities));
localStorage.setItem('supplier-defects', JSON.stringify(emergencyDefects));

console.log("✅ EMERGENCY VERİLER GERİ YÜKLENDİ!");
console.log("👥 Tedarikçi Sayısı:", emergencySuppliers.length);
console.log("🔗 Eşleştirme Sayısı:", emergencyPairs.length);
console.log("⚠️ Uygunsuzluk Sayısı:", emergencyNonconformities.length);
console.log("🔴 Hata Sayısı:", emergencyDefects.length);

// Tedarikçi türlerini göster
const onayliCount = emergencySuppliers.filter(s => s.type === 'onaylı').length;
const alternatifCount = emergencySuppliers.filter(s => s.type === 'alternatif').length;

console.log("🔵 Onaylı Tedarikçi:", onayliCount);
console.log("🟡 Alternatif Tedarikçi:", alternatifCount);

// Event'leri tetikle
window.dispatchEvent(new Event('supplierDataUpdated'));
window.dispatchEvent(new Event('storage'));
console.log("🔄 Güncelleme event'leri tetiklendi");

console.log("\n💡 ŞİMDİ:");
console.log("1. Sayfayı yenileyin (F5)");
console.log("2. Tedarikçi Kalite Yönetimi sayfasını kontrol edin");
console.log("3. Tedarikçi listesinin geri geldiğini göreceksiniz!");

setTimeout(() => {
  location.reload();
}, 2000); 