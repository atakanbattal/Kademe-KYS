/**
 * TEDARİKÇİ VERİ KORUMA VE TEST SİSTEMİ
 * 
 * Bu script:
 * 1. localStorage'daki tedarikçi verilerini korur
 * 2. Test verileri oluşturur
 * 3. Veri silinmesini takip eder
 * 4. Debug bilgileri sağlar
 * 
 * PROBLEM: Modül geçişinde tedarikçi listesi siliniyor
 * ÇÖZÜM: 3 katmanlı koruma sistemi
 * 
 * Kullanım: Browser console'da copy-paste yaparak çalıştır
 */

console.log('🛡️ TEDARİKÇİ VERİ KORUMA SİSTEMİ AKTİF');

// 1. MEVCUT VERİ DURUMUNU KONTROL ET
function checkCurrentData() {
  const suppliers = localStorage.getItem('suppliers');
  const pairs = localStorage.getItem('supplier-pairs');
  const nonconformities = localStorage.getItem('supplier-nonconformities');
  const defects = localStorage.getItem('supplier-defects');
  
  console.log('📊 MEVCUT VERİ DURUMU:', {
    suppliers: suppliers ? JSON.parse(suppliers).length + ' kayıt' : 'YOK',
    pairs: pairs ? JSON.parse(pairs).length + ' eşleştirme' : 'YOK',
    nonconformities: nonconformities ? JSON.parse(nonconformities).length + ' uygunsuzluk' : 'YOK',
    defects: defects ? JSON.parse(defects).length + ' hata' : 'YOK'
  });
  
  if (suppliers) {
    const supplierList = JSON.parse(suppliers);
    console.log('👥 TEDARİKÇİ LİSTESİ:');
    supplierList.forEach((s, i) => {
      console.log(`  ${i+1}. ${s.name} (${s.code}) - ${s.type} - Puan: ${s.performanceScore}`);
    });
  }
  
  return {
    suppliers: suppliers ? JSON.parse(suppliers) : [],
    pairs: pairs ? JSON.parse(pairs) : [],
    nonconformities: nonconformities ? JSON.parse(nonconformities) : [],
    defects: defects ? JSON.parse(defects) : []
  };
}

// 2. TEST VERİSİ OLUŞTUR
function createTestData() {
  console.log('🏗️ Test verisi oluşturuluyor...');
  
  const testSuppliers = [
    {
      id: 'TEST-SUP-001',
      name: 'Test Metal A.Ş.',
      code: 'TM001', 
      type: 'onaylı',
      category: 'stratejik',
      supplyType: 'malzeme',
      supplySubcategories: ['Ham Madde (Çelik, Alüminyum, Plastik)'],
      contact: {
        email: 'test@testmetal.com',
        phone: '+90 212 555 0001',
        address: 'Test Sanayi Sitesi',
        contactPerson: 'Test Kişi'
      },
      materialTypes: ['Çelik Levha'],
      performanceScore: 88,
      qualityScore: 90,
      deliveryScore: 86,
      riskLevel: 'düşük',
      status: 'aktif',
      registrationDate: new Date().toISOString().split('T')[0],
      lastAuditDate: '2024-08-15',
      nextAuditDate: '2025-08-15',
      auditStatus: 'planlı',
      nonconformityCount: 0,
      defectCount: 0,
      dofCount: 0,
      isActive: true
    },
    {
      id: 'TEST-SUP-002',
      name: 'Güvenilir Tedarik Ltd.',
      code: 'GT002',
      type: 'alternatif',
      category: 'kritik',
      supplyType: 'hizmet',
      supplySubcategories: ['Taşeron İşçilik (Kaynak, Montaj)'],
      contact: {
        email: 'info@guvenilirtedarik.com',
        phone: '+90 212 555 0002',
        address: 'Güvenilir Caddesi No:123',
        contactPerson: 'Güvenilir Kişi'
      },
      materialTypes: ['Profil'],
      performanceScore: 92,
      qualityScore: 94,
      deliveryScore: 89,
      riskLevel: 'düşük',
      status: 'aktif',
      registrationDate: new Date().toISOString().split('T')[0],
      lastAuditDate: '2024-09-20',
      nextAuditDate: '2025-09-20',
      auditStatus: 'planlı',
      nonconformityCount: 0,
      defectCount: 0,
      dofCount: 0,
      isActive: true
    }
  ];
  
  const testPairs = [
    {
      id: 'TEST-PAIR-001',
      primarySupplier: testSuppliers[0],
      alternativeSuppliers: [testSuppliers[1]],
      materialType: 'Çelik Levha',
      category: 'stratejik',
      performanceComparison: {
        primaryScore: 88,
        alternativeScores: [{ id: 'TEST-SUP-002', score: 92 }],
        recommendation: 'Her iki tedarikçi de güvenilir'
      },
      lastReviewDate: new Date().toISOString().split('T')[0],
      nextReviewDate: new Date(Date.now() + 6*30*24*60*60*1000).toISOString().split('T')[0]
    }
  ];
  
  // localStorage'a kaydet
  localStorage.setItem('suppliers', JSON.stringify(testSuppliers));
  localStorage.setItem('supplier-pairs', JSON.stringify(testPairs));
  localStorage.setItem('supplier-nonconformities', JSON.stringify([]));
  localStorage.setItem('supplier-defects', JSON.stringify([]));
  
  // Backup'la
  localStorage.setItem('suppliers-backup', JSON.stringify(testSuppliers));
  
  console.log('✅ Test verisi başarıyla oluşturuldu:', testSuppliers.length, 'tedarikçi');
  return testSuppliers;
}

// 3. VERİ KORUMA SİSTEMİ KURMA
function setupDataProtection() {
  console.log('🛡️ Veri koruma sistemi kuruluyor...');
  
  // Her 3 saniyede kontrol et
  const protectionInterval = setInterval(() => {
    const currentSuppliers = localStorage.getItem('suppliers');
    
    if (!currentSuppliers || currentSuppliers === '[]' || currentSuppliers === 'null') {
      console.log('🚨 ALARM: Tedarikçi verisi silinmiş!');
      
      // Backup'tan restore et
      const backup = localStorage.getItem('suppliers-backup');
      if (backup) {
        localStorage.setItem('suppliers', backup);
        console.log('🔧 Backup\'tan restore edildi');
        
        // Event tetikle (React component'lerin algılaması için)
        window.dispatchEvent(new Event('supplierDataRestored'));
      } else {
        console.log('⚠️ Backup bulunamadı - test verisi oluşturuluyor');
        createTestData();
      }
    } else {
      // Backup güncelle
      localStorage.setItem('suppliers-backup', currentSuppliers);
    }
  }, 3000);
  
  console.log('✅ Koruma sistemi aktif - her 3 saniyede kontrol ediliyor');
  
  // Koruma sistemini durdurma fonksiyonu
  window.stopSupplierProtection = () => {
    clearInterval(protectionInterval);
    console.log('🛑 Koruma sistemi durduruldu');
  };
  
  return protectionInterval;
}

// 4. MANUAL VERİ RESTORE
function restoreFromBackup() {
  console.log('🔄 Backup\'tan restore işlemi...');
  
  const backup = localStorage.getItem('suppliers-backup');
  if (backup) {
    localStorage.setItem('suppliers', backup);
    console.log('✅ Backup\'tan restore edildi');
    window.dispatchEvent(new Event('supplierDataRestored'));
  } else {
    console.log('❌ Backup bulunamadı');
  }
}

// 5. LOCALSTORAGE DURUMUNU İZLEME
function monitorLocalStorage() {
  console.log('👁️ localStorage monitoring başlatılıyor...');
  
  const originalSetItem = localStorage.setItem;
  const originalRemoveItem = localStorage.removeItem;
  const originalClear = localStorage.clear;
  
  localStorage.setItem = function(key, value) {
    if (key === 'suppliers') {
      console.log('📝 localStorage.setItem - suppliers:', value ? JSON.parse(value).length + ' kayıt' : 'null');
    }
    return originalSetItem.apply(this, arguments);
  };
  
  localStorage.removeItem = function(key) {
    if (key === 'suppliers') {
      console.log('🗑️ localStorage.removeItem - suppliers key silindi!');
    }
    return originalRemoveItem.apply(this, arguments);
  };
  
  localStorage.clear = function() {
    console.log('💥 localStorage.clear() çağrıldı - TÜM VERİ SİLİNDİ!');
    return originalClear.apply(this, arguments);
  };
  
  console.log('✅ localStorage monitoring aktif');
}

// ANA FONKSİYONLAR
window.supplierDebug = {
  check: checkCurrentData,
  createTest: createTestData,
  protect: setupDataProtection,
  restore: restoreFromBackup,
  monitor: monitorLocalStorage,
  
  // Hızlı komutlar
  setup: function() {
    console.log('🚀 TAM KURULUM BAŞLIYOR...');
    this.monitor();
    this.createTest();
    this.protect();
    console.log('✅ Tedarikçi koruma sistemi tam kurulum tamamlandı!');
    console.log('💡 Komutlar: supplierDebug.check(), supplierDebug.restore(), stopSupplierProtection()');
  },
  
  status: function() {
    console.log('📊 SİSTEM DURUMU:');
    this.check();
    console.log('🛡️ Koruma: ', window.stopSupplierProtection ? 'AKTİF' : 'PASİF');
  }
};

// Otomatik kurulum
console.log('🎯 Hızlı kurulum için: supplierDebug.setup()');
console.log('📊 Durum kontrolü için: supplierDebug.status()');

// İlk kontrol
checkCurrentData(); 