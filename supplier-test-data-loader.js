// ==============================================
// 🏭 TEDARİKÇİ KALİTE YÖNETİMİ TEST VERİSİ YÜKLEYICI
// ==============================================
// Bu scripti browser console'da çalıştırarak test verisi yükleyebilirsiniz

console.log('🏭 Tedarikçi Kalite Yönetimi test verisi yükleniyor...');

// Önce mevcut veriyi kontrol edelim
console.log('📊 Mevcut localStorage durumu:');
const currentSuppliers = localStorage.getItem('suppliers');
const currentNC = localStorage.getItem('supplier-nonconformities');
const currentDefects = localStorage.getItem('supplier-defects');

console.log('Suppliers:', currentSuppliers ? JSON.parse(currentSuppliers).length + ' kayıt' : 'VERİ YOK');
console.log('Nonconformities:', currentNC ? JSON.parse(currentNC).length + ' kayıt' : 'VERİ YOK');
console.log('Defects:', currentDefects ? JSON.parse(currentDefects).length + ' kayıt' : 'VERİ YOK');

// 1. TEDARİKÇİLER - QualityManagement ile uyumlu format
const suppliers = [
  {
    id: 'SUP-001',
    name: 'Seçkinler Metal A.Ş.',
    code: 'SM001',
    type: 'onaylı',  // Bu alan çok önemli - KPI hesaplamada kullanılıyor
    status: 'aktif',
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
    type: 'onaylı',  // Bu alan çok önemli - KPI hesaplamada kullanılıyor
    status: 'aktif',
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
    name: 'Alfa Kalite Ltd.',
    code: 'AK003',
    type: 'onaylı',  // Bu alan çok önemli - KPI hesaplamada kullanılıyor
    status: 'aktif',
    category: 'kritik',
    supplyType: 'malzeme',
    supplySubcategories: ['Elektronik Komponentler', 'Standart Parçalar (Vida, Somun, Rondela)'],
    contact: {
      email: 'info@alfakalite.com',
      phone: '+90 216 555 0125',
      address: 'Ankara Organize Sanayi',
      contactPerson: 'Osman Alfa'
    },
    materialTypes: ['Elektronik', 'Bağlantı Elemanları'],
    performanceScore: 89,
    qualityScore: 92,
    deliveryScore: 86,
    riskLevel: 'düşük',
    registrationDate: '2022-05-10',
    lastAuditDate: '2024-08-20',
    nextAuditDate: '2025-08-20',
    auditStatus: 'planlı',
    nonconformityCount: 0,
    defectCount: 0,
    dofCount: 0,
    isActive: true
  },
  {
    id: 'SUP-004',
    name: 'Beta Elektronik San.',
    code: 'BE004',
    type: 'değerlendirme',  // Onaysız tedarikçi - KPI test için
    status: 'beklemede',
    category: 'normal',
    supplyType: 'malzeme',
    supplySubcategories: ['Elektronik Komponentler'],
    contact: {
      email: 'info@betaelektronik.com',
      phone: '+90 312 555 0126',
      address: 'İzmir Sanayi Sitesi',
      contactPerson: 'Kemal Beta'
    },
    materialTypes: ['Elektronik'],
    performanceScore: 65,
    qualityScore: 70,
    deliveryScore: 60,
    riskLevel: 'yüksek',
    registrationDate: '2024-11-01',
    lastAuditDate: '2024-11-15',
    nextAuditDate: '2025-02-15',
    auditStatus: 'beklemede',
    nonconformityCount: 1,
    defectCount: 2,
    dofCount: 1,
    isActive: true
  }
];

// 2. UYGUNSUZLUKLAR - QualityManagement ile uyumlu format
const nonconformities = [
  {
    id: 'NC-001',
    supplierId: 'SUP-001',
    title: 'Teslim Gecikmesi',
    description: 'Çelik levha teslimatında 3 gün gecikme yaşandı',
    category: 'teslimat',
    severity: 'orta',
    detectedDate: '2024-11-15',
    status: 'açık',  // KPI hesaplamada kullanılıyor
    dueDate: '2024-12-15',
    correctionCost: 5000,
    recurrence: false,
    partCode: 'CL-001',
    delayDays: 3
  },
  {
    id: 'NC-002',
    supplierId: 'SUP-001',
    title: 'Kalite Problemi',
    description: 'Profil ölçülerinde tolerans aşımı tespit edildi',
    category: 'kalite',
    severity: 'yüksek',
    detectedDate: '2024-11-10',
    status: 'araştırılıyor',
    dueDate: '2024-12-10',
    correctionCost: 8000,
    recurrence: false,
    partCode: 'PR-001',
    quantityAffected: 50
  },
  {
    id: 'NC-003',
    supplierId: 'SUP-002',
    title: 'Dokümantasyon Eksikliği',
    description: 'Malzeme sertifikaları eksik gönderildi',
    category: 'doküman',
    severity: 'düşük',
    detectedDate: '2024-11-20',
    status: 'açık',  // KPI hesaplamada kullanılıyor
    dueDate: '2024-12-20',
    correctionCost: 1000,
    recurrence: false,
    partCode: 'DOC-001'
  },
  {
    id: 'NC-004',
    supplierId: 'SUP-004',
    title: 'Elektronik Komponent Hatası',
    description: 'Elektronik komponentlerde arıza tespit edildi',
    category: 'kalite',
    severity: 'kritik',
    detectedDate: '2024-11-22',
    status: 'açık',  // KPI hesaplamada kullanılıyor
    dueDate: '2024-12-01',
    correctionCost: 15000,
    recurrence: true,
    partCode: 'EL-001'
  }
];

// 3. HATALAR - QualityManagement ile uyumlu format
const defects = [
  {
    id: 'DEF-001',
    supplierId: 'SUP-001',
    defectType: 'Boyut Hatası',
    description: 'Çelik levha kalınlığı spesifikasyondan sapma',
    quantity: 25,
    detectedDate: '2024-11-12',
    batchNumber: 'BATCH-001',
    severity: 'major',
    status: 'açık',  // KPI hesaplamada kullanılıyor
    correctionCost: 12000
  },
  {
    id: 'DEF-002',
    supplierId: 'SUP-002',
    title: 'Yüzey Hatası',
    defectType: 'Yüzey Hatası',
    description: 'Profil yüzeyinde çizik tespit edildi',
    quantity: 10,
    detectedDate: '2024-11-18',
    batchNumber: 'BATCH-002',
    severity: 'minor',
    status: 'düzeltildi',
    correctionCost: 3000
  },
  {
    id: 'DEF-003',
    supplierId: 'SUP-004',
    title: 'Elektronik Arıza',
    defectType: 'Fonksiyon Hatası',
    description: 'Elektronik komponentte işlevsel arıza',
    quantity: 5,
    detectedDate: '2024-11-20',
    batchNumber: 'BATCH-003',
    severity: 'critical',
    status: 'açık',  // KPI hesaplamada kullanılıyor
    correctionCost: 8000
  },
  {
    id: 'DEF-004',
    supplierId: 'SUP-004',
    title: 'Paketleme Hatası',
    defectType: 'Paketleme Problemi',
    description: 'Ürün paketlemesinde hasar tespit edildi',
    quantity: 15,
    detectedDate: '2024-11-21',
    batchNumber: 'BATCH-004',
    severity: 'minor',
    status: 'açık',  // KPI hesaplamada kullanılıyor
    correctionCost: 2000
  }
];

// VERİ YÜKLEME FONKSİYONU
function loadSupplierTestData() {
  try {
    console.log('⚡ Tedarikçi test verisi localStorage\'a yükleniyor...');
    
    // localStorage'a kaydet
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
    localStorage.setItem('supplier-nonconformities', JSON.stringify(nonconformities));
    localStorage.setItem('supplier-defects', JSON.stringify(defects));
    
    console.log('✅ Tedarikçi test verisi başarıyla yüklendi!');
    console.log(`📊 Yüklenen veri:`, {
      suppliers: suppliers.length + ' tedarikçi',
      approvedSuppliers: suppliers.filter(s => s.type === 'onaylı').length + ' onaylı',
      nonconformities: nonconformities.length + ' uygunsuzluk',
      activeNonconformities: nonconformities.filter(nc => nc.status === 'açık').length + ' aktif',
      defects: defects.length + ' hata',
      activeDefects: defects.filter(d => d.status === 'açık').length + ' aktif'
    });
    
    // KPI hesaplama testi
    console.log('🧮 KPI Hesaplama Testi:');
    const totalSuppliers = suppliers.length;
    const approvedSuppliers = suppliers.filter(s => s.type === 'onaylı').length;
    const approvalRate = totalSuppliers > 0 ? (approvedSuppliers / totalSuppliers) * 100 : 0;
    const activeNCs = nonconformities.filter(nc => nc.status === 'açık').length;
    const activeDefects = defects.filter(d => d.status === 'açık').length;
    
    console.log(`Toplam Tedarikçi: ${totalSuppliers}`);
    console.log(`Onaylı Tedarikçi: ${approvedSuppliers}`);
    console.log(`Onay Oranı: ${approvalRate.toFixed(2)}%`);
    console.log(`Aktif Uygunsuzluk: ${activeNCs}`);
    console.log(`Aktif Hata: ${activeDefects}`);
    
    // KPI modülünü tetikle
    console.log('🔄 KPI modülüne güncelleme sinyali gönderiliyor...');
    window.dispatchEvent(new Event('supplierDataUpdated'));
    
    // Hemen localStorage'dan kontrol et
    setTimeout(() => {
      const checkSuppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
      const checkNCs = JSON.parse(localStorage.getItem('supplier-nonconformities') || '[]');
      const checkDefects = JSON.parse(localStorage.getItem('supplier-defects') || '[]');
      
      console.log('🔍 Yükleme Kontrolü:');
      console.log('Suppliers localStorage:', checkSuppliers.length + ' kayıt');
      console.log('Nonconformities localStorage:', checkNCs.length + ' kayıt');
      console.log('Defects localStorage:', checkDefects.length + ' kayıt');
      
      if (checkSuppliers.length === 0) {
        console.error('❌ TEDARİKÇİ VERİSİ YÜKLENMEDE SORUN VAR!');
      } else {
        console.log('✅ Tedarikçi verisi başarıyla localStorage\'da');
      }
    }, 1000);
    
    return {
      success: true,
      data: {
        suppliers: suppliers.length,
        nonconformities: nonconformities.length,
        defects: defects.length,
        approvalRate: approvalRate.toFixed(2)
      }
    };
  } catch (error) {
    console.error('❌ Tedarikçi test verisi yüklenirken hata:', error);
    return { success: false, error: error.message };
  }
}

// Test veri temizleme fonksiyonu
function clearSupplierData() {
  localStorage.removeItem('suppliers');
  localStorage.removeItem('supplier-nonconformities');
  localStorage.removeItem('supplier-defects');
  console.log('🗑️ Tedarikçi verileri temizlendi');
}

// Veri kontrol fonksiyonu
function checkSupplierData() {
  const suppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
  const ncs = JSON.parse(localStorage.getItem('supplier-nonconformities') || '[]');
  const defects = JSON.parse(localStorage.getItem('supplier-defects') || '[]');
  
  console.log('📊 Mevcut Tedarikçi Veri Durumu:');
  console.log('Tedarikçiler:', suppliers.length);
  console.log('Uygunsuzluklar:', ncs.length);
  console.log('Hatalar:', defects.length);
  
  if (suppliers.length > 0) {
    console.log('Örnek tedarikçi:', suppliers[0]);
  }
  
  return { suppliers: suppliers.length, ncs: ncs.length, defects: defects.length };
}

// Otomatik yükleme
console.log('🚀 Test verisi otomatik yükleniyor...');
const result = loadSupplierTestData();

// Global fonksiyonları tanımla
window.clearSupplierData = clearSupplierData;
window.checkSupplierData = checkSupplierData;
window.loadSupplierTestData = loadSupplierTestData;

console.log('🎯 Kullanılabilir fonksiyonlar:');
console.log('  - clearSupplierData() : Verileri temizle');
console.log('  - checkSupplierData() : Mevcut verileri kontrol et');
console.log('  - loadSupplierTestData() : Test verilerini yeniden yükle');

result; 