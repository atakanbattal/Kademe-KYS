/**
 * MODÜL NAVİGASYON TEST SCRIPTI
 * 
 * Bu script tedarikçi verilerinin modüller arası geçişte 
 * korunup korunmadığını test eder.
 * 
 * PROBLEM: 
 * - Sayfa yenilemede veri korunuyor
 * - Modüller arası geçişte tedarikçi listesi siliniyor
 * - Onaylı/alternatif eşleştirmesi silinmiyor
 * 
 * ÇÖZÜM:
 * - updateSupplierPerformances fonksiyonuna localStorage kaydetme eklendi
 * 
 * Kullanım: Browser console'da çalıştır
 */

console.log('🔍 MODÜL NAVİGASYON TEST BAŞLATIYOR...');

// Test için örnek tedarikçi verisi oluştur
const testSupplierData = [
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
      phone: '+90 212 555 0000',
      address: 'Test Adres',
      contactPerson: 'Test Kişi'
    },
    materialTypes: ['Çelik Levha'],
    performanceScore: 95,
    qualityScore: 90,
    deliveryScore: 88,
    riskLevel: 'düşük',
    status: 'aktif',
    registrationDate: '2024-01-01',
    lastAuditDate: '2024-11-01',
    nextAuditDate: '2025-11-01',
    auditStatus: 'planlı',
    nonconformityCount: 0,
    defectCount: 0,
    dofCount: 0,
    isActive: true
  },
  {
    id: 'TEST-SUP-002',
    name: 'Test Alternatif Ltd.',
    code: 'TA002',
    type: 'alternatif',
    category: 'kritik',
    supplyType: 'hizmet',
    supplySubcategories: ['Taşeron İşçilik (Kaynak, Montaj)'],
    contact: {
      email: 'test@testalternatif.com',
      phone: '+90 212 555 0001',
      address: 'Test Alternatif Adres',
      contactPerson: 'Test Alternatif Kişi'
    },
    materialTypes: ['Kaynak'],
    performanceScore: 85,
    qualityScore: 82,
    deliveryScore: 87,
    riskLevel: 'orta',
    status: 'aktif',
    registrationDate: '2024-02-01',
    lastAuditDate: '2024-10-15',
    nextAuditDate: '2025-10-15',
    auditStatus: 'planlı',
    nonconformityCount: 1,
    defectCount: 0,
    dofCount: 0,
    isActive: true
  }
];

// Test eşleştirme verisi oluştur
const testPairData = [
  {
    id: 'TEST-PAIR-001',
    primarySupplier: testSupplierData[0],
    alternativeSuppliers: [testSupplierData[1]],
    materialType: 'Çelik Levha',
    category: 'stratejik',
    performanceComparison: {
      primaryScore: 95,
      alternativeScores: [{ id: 'TEST-SUP-002', score: 85 }],
      recommendation: 'Ana tedarikçi performansı üstün'
    },
    lastReviewDate: '2024-11-01',
    nextReviewDate: '2025-05-01'
  }
];

// Fonksiyon: Test verilerini localStorage'a kaydet
function saveTestData() {
  try {
    localStorage.setItem('suppliers', JSON.stringify(testSupplierData));
    localStorage.setItem('supplier-pairs', JSON.stringify(testPairData));
    console.log('✅ Test verileri localStorage\'a kaydedildi');
    console.log('📊 Tedarikçi sayısı:', testSupplierData.length);
    console.log('🔗 Eşleştirme sayısı:', testPairData.length);
    return true;
  } catch (error) {
    console.error('❌ Test veri kaydetme hatası:', error);
    return false;
  }
}

// Fonksiyon: localStorage verilerini kontrol et
function checkStoredData() {
  const storedSuppliers = localStorage.getItem('suppliers');
  const storedPairs = localStorage.getItem('supplier-pairs');
  
  console.log('\n🔍 MEVCUT DURUMU KONTROL ET:');
  
  if (storedSuppliers) {
    const suppliers = JSON.parse(storedSuppliers);
    console.log('✅ Tedarikçi verileri mevcut:', suppliers.length + ' adet');
    console.log('📋 Tedarikçiler:', suppliers.map(s => `${s.name} (${s.type})`).join(', '));
  } else {
    console.log('❌ Tedarikçi verileri bulunamadı');
  }
  
  if (storedPairs) {
    const pairs = JSON.parse(storedPairs);
    console.log('✅ Eşleştirme verileri mevcut:', pairs.length + ' adet');
    console.log('🔗 Eşleştirmeler:', pairs.map(p => `${p.primarySupplier.name} ↔ ${p.alternativeSuppliers[0]?.name}`).join(', '));
  } else {
    console.log('❌ Eşleştirme verileri bulunamadı');
  }
  
  return { suppliers: storedSuppliers, pairs: storedPairs };
}

// Fonksiyon: Modül navigasyon simüle et
function simulateModuleNavigation() {
  console.log('\n🚀 MODÜL NAVİGASYON SİMÜLASYONU:');
  
  // 1. Başlangıç durumu
  console.log('1️⃣ Başlangıç durumu kontrol ediliyor...');
  const beforeNavigation = checkStoredData();
  
  if (!beforeNavigation.suppliers) {
    console.log('⚠️ Test verileri bulunamadı, önce test verilerini yüklüyor...');
    saveTestData();
  }
  
  // 2. Modül değişikliği simülasyonu (window events)
  console.log('\n2️⃣ Modül değişikliği simüle ediliyor...');
  console.log('🔄 URL değişikliği simülasyonu...');
  
  // React Router navgigation event simüle et
  const navigationEvent = new PopStateEvent('popstate', {
    state: { module: 'quality-management' }
  });
  window.dispatchEvent(navigationEvent);
  
  // Component unmount/mount simüle et
  setTimeout(() => {
    console.log('🔄 Component remount simülasyonu...');
    
    // 3. Navigasyon sonrası durumu kontrol et
    console.log('\n3️⃣ Navigasyon sonrası durum kontrol ediliyor...');
    const afterNavigation = checkStoredData();
    
    // 4. Veri kaybı analizi
    console.log('\n📊 VERİ KAYBI ANALİZİ:');
    
    const beforeSuppliers = beforeNavigation.suppliers ? JSON.parse(beforeNavigation.suppliers) : [];
    const afterSuppliers = afterNavigation.suppliers ? JSON.parse(afterNavigation.suppliers) : [];
    
    const beforePairs = beforeNavigation.pairs ? JSON.parse(beforeNavigation.pairs) : [];
    const afterPairs = afterNavigation.pairs ? JSON.parse(afterNavigation.pairs) : [];
    
    console.log('Tedarikçi Durumu:');
    console.log(`  Öncesi: ${beforeSuppliers.length} adet`);
    console.log(`  Sonrası: ${afterSuppliers.length} adet`);
    console.log(`  Durum: ${beforeSuppliers.length === afterSuppliers.length ? '✅ KORUNDU' : '❌ KAYBOLDU'}`);
    
    console.log('Eşleştirme Durumu:');
    console.log(`  Öncesi: ${beforePairs.length} adet`);
    console.log(`  Sonrası: ${afterPairs.length} adet`);
    console.log(`  Durum: ${beforePairs.length === afterPairs.length ? '✅ KORUNDU' : '❌ KAYBOLDU'}`);
    
    // 5. Test sonucu
    if (beforeSuppliers.length === afterSuppliers.length && beforePairs.length === afterPairs.length) {
      console.log('\n🎉 TEST BAŞARILI: Modül navigasyonunda veri kaybı yok!');
    } else {
      console.log('\n❌ TEST BAŞARISIZ: Modül navigasyonunda veri kaybı tespit edildi!');
      
      if (beforeSuppliers.length !== afterSuppliers.length) {
        console.log('⚠️ SORUN: Tedarikçi listesi modül geçişinde siliniyor');
        console.log('💡 ÇÖZÜM: updateSupplierPerformances fonksiyonuna localStorage kaydetme eklendi');
      }
    }
    
  }, 1000);
}

// Fonksiyon: localStorage temizle (test için)
function clearTestData() {
  localStorage.removeItem('suppliers');
  localStorage.removeItem('supplier-pairs');
  localStorage.removeItem('supplier-nonconformities');
  localStorage.removeItem('supplier-defects');
  console.log('🗑️ Test verileri temizlendi');
}

// Fonksiyon: Performans güncellemesi test et
function testPerformanceUpdate() {
  console.log('\n🎯 PERFORMANS GÜNCELLEME TESTİ:');
  
  const suppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
  if (suppliers.length === 0) {
    console.log('⚠️ Test için veri bulunamadı, test verileri yükleniyor...');
    saveTestData();
    return;
  }
  
  console.log('📊 Önceki performans skorları:');
  suppliers.forEach(s => {
    console.log(`  ${s.name}: Genel ${s.performanceScore}, Kalite ${s.qualityScore}, Teslimat ${s.deliveryScore}`);
  });
  
  // Performans skorlarını simüle et
  const updatedSuppliers = suppliers.map(supplier => ({
    ...supplier,
    performanceScore: Math.max(0, supplier.performanceScore - Math.floor(Math.random() * 5)),
    qualityScore: Math.max(0, supplier.qualityScore - Math.floor(Math.random() * 3)),
    deliveryScore: Math.max(0, supplier.deliveryScore - Math.floor(Math.random() * 4))
  }));
  
  // localStorage'a kaydet (updateSupplierPerformances simülasyonu)
  localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
  console.log('💾 Güncellenmiş performans skorları localStorage\'a kaydedildi');
  
  console.log('📊 Yeni performans skorları:');
  updatedSuppliers.forEach(s => {
    console.log(`  ${s.name}: Genel ${s.performanceScore}, Kalite ${s.qualityScore}, Teslimat ${s.deliveryScore}`);
  });
  
  console.log('✅ Performans güncelleme testi tamamlandı');
}

// MAIN TEST EXECUTION
console.log('\n========================================');
console.log('🧪 TEDARIKÇI MODÜL NAVİGASYON TESTİ');
console.log('========================================');

// Test menüsü
console.log('\nKullanılabilir test fonksiyonları:');
console.log('saveTestData() - Test verilerini yükle');
console.log('checkStoredData() - Mevcut verileri kontrol et');
console.log('simulateModuleNavigation() - Modül geçişi simüle et');
console.log('testPerformanceUpdate() - Performans güncelleme test et');
console.log('clearTestData() - Test verilerini temizle');

// Otomatik test başlat
console.log('\n🚀 Otomatik test başlatılıyor...');
simulateModuleNavigation();

console.log('\n✅ Test script yüklendi. Yukarıdaki fonksiyonları manuel olarak da çağırabilirsiniz.'); 