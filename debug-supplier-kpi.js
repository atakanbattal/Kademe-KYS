// ===============================================
// 🔍 TEDARİKÇİ KPI BAĞLANTI SORUNU DEBUG SCRIPT
// ===============================================
// Bu scripti browser console'da çalıştırarak sorunu tespit edin

console.log('🔍 Tedarikçi KPI Bağlantı Sorunu Debug Başlatılıyor...');

// 1. localStorage Durumu Kontrolü
console.log('📊 localStorage Kontrol:');
const suppliers = localStorage.getItem('suppliers');
const nonconformities = localStorage.getItem('supplier-nonconformities');
const defects = localStorage.getItem('supplier-defects');

console.log('suppliers key:', suppliers ? `${JSON.parse(suppliers).length} kayıt` : '❌ VERİ YOK');
console.log('supplier-nonconformities key:', nonconformities ? `${JSON.parse(nonconformities).length} kayıt` : '❌ VERİ YOK');
console.log('supplier-defects key:', defects ? `${JSON.parse(defects).length} kayıt` : '❌ VERİ YOK');

// 2. Veri Yok ise Test Verisi Yükle
if (!suppliers || !nonconformities || !defects) {
  console.log('⚠️  Veri eksik! Test verisi yükleniyor...');
  
  // Minimal test verisi
  const testSuppliers = [
    {
      id: 'SUP-001',
      name: 'Test Tedarikçi 1',
      type: 'onaylı',
      status: 'aktif'
    },
    {
      id: 'SUP-002', 
      name: 'Test Tedarikçi 2',
      type: 'onaylı',
      status: 'aktif'
    }
  ];
  
  const testNonconformities = [
    {
      id: 'NC-001',
      supplierId: 'SUP-001',
      title: 'Test Uygunsuzluk',
      status: 'açık'
    }
  ];
  
  const testDefects = [
    {
      id: 'DEF-001',
      supplierId: 'SUP-001',
      defectType: 'Test Hata',
      status: 'açık'
    }
  ];
  
  localStorage.setItem('suppliers', JSON.stringify(testSuppliers));
  localStorage.setItem('supplier-nonconformities', JSON.stringify(testNonconformities));
  localStorage.setItem('supplier-defects', JSON.stringify(testDefects));
  
  console.log('✅ Minimal test verisi yüklendi!');
}

// 3. QualityManagement getSupplierData Fonksiyonu Simülasyonu
function debugGetSupplierData() {
  console.log('🧮 getSupplierData fonksiyonu simülasyonu:');
  
  try {
    const supplierData = JSON.parse(localStorage.getItem('suppliers') || '[]');
    const nonconformities = JSON.parse(localStorage.getItem('supplier-nonconformities') || '[]');
    const defects = JSON.parse(localStorage.getItem('supplier-defects') || '[]');
    
    console.log('Raw Data Check:', {
      suppliersCount: supplierData.length,
      nonconformitiesCount: nonconformities.length,
      defectsCount: defects.length
    });
    
    if (supplierData.length > 0) {
      console.log('İlk tedarikçi örneği:', supplierData[0]);
    }
    
    const totalSuppliers = supplierData.length;
    const approvedSuppliers = supplierData.filter((supplier) => 
      supplier.status === 'onaylı' || supplier.status === 'approved' || supplier.type === 'onaylı'
    ).length;
    const approvalRate = totalSuppliers > 0 ? (approvedSuppliers / totalSuppliers) * 100 : 0;
    
    const activeNonconformities = nonconformities.filter((nc) => 
      nc.status === 'açık' || nc.status === 'open'
    ).length;
    const activeDefects = defects.filter((d) => 
      d.status === 'açık' || d.status === 'open'
    ).length;

    const result = {
      totalSuppliers,
      approvedSuppliers,
      approvalRate,
      activeNonconformities,
      activeDefects,
      dataQuality: (totalSuppliers > 5 ? 'high' : totalSuppliers > 2 ? 'medium' : 'low')
    };
    
    console.log('📈 Hesaplanan değerler:', result);
    
    // 4. Modül Durumu Hesaplaması
    const moduleConnected = (totalSuppliers > 0 || activeNonconformities > 0 || activeDefects > 0);
    const recordCount = totalSuppliers + activeNonconformities + activeDefects;
    
    console.log('🔗 Modül Bağlantı Durumu:');
    console.log('Bağlantı Koşulu:', `(${totalSuppliers} > 0 || ${activeNonconformities} > 0 || ${activeDefects} > 0) = ${moduleConnected}`);
    console.log('Kayıt Sayısı:', recordCount);
    console.log('Bağlantı Durumu:', moduleConnected ? '✅ BAĞLI' : '❌ BAĞLANTISIZ');
    
    return result;
    
  } catch (error) {
    console.error('❌ getSupplierData hatası:', error);
    return {
      totalSuppliers: 0,
      approvedSuppliers: 0,
      approvalRate: 0,
      activeNonconformities: 0,
      activeDefects: 0,
      dataQuality: 'low'
    };
  }
}

// 5. Debug Çalıştır
const supplierResult = debugGetSupplierData();

// 6. KPI Tetikleme Testi
console.log('🔄 KPI Güncelleme Tetikleniyor...');
if (window.dispatchEvent) {
  window.dispatchEvent(new Event('supplierDataUpdated'));
  console.log('✅ supplierDataUpdated event tetiklendi');
} else {
  console.log('❌ window.dispatchEvent bulunamadı');
}

// 7. Sonuç ve Öneriler
console.log('\n🎯 DEBUG SONUCU:');
if (supplierResult.totalSuppliers === 0 && supplierResult.activeNonconformities === 0 && supplierResult.activeDefects === 0) {
  console.log('❌ SORUN: Tüm değerler 0, bu yüzden modül bağlantısız görünüyor');
  console.log('💡 ÇÖZÜM: Test verisi yükleyin veya Tedarikçi Kalite Yönetimi modülünde veri ekleyin');
} else {
  console.log('✅ Veri mevcut, modül bağlı olmalı');
  console.log('💡 Eğer hala bağlantısız görünüyorsa, sayfayı yenileyin veya KPI modülünü kontrol edin');
}

// 8. Hızlı Çözüm - Güçlü Test Verisi
function loadStrongTestData() {
  const strongSuppliers = [
    { id: 'SUP-001', name: 'Güçlü Test Tedarikçi 1', type: 'onaylı', status: 'aktif' },
    { id: 'SUP-002', name: 'Güçlü Test Tedarikçi 2', type: 'onaylı', status: 'aktif' },
    { id: 'SUP-003', name: 'Güçlü Test Tedarikçi 3', type: 'onaylı', status: 'aktif' }
  ];
  
  const strongNonconformities = [
    { id: 'NC-001', supplierId: 'SUP-001', title: 'Test NC 1', status: 'açık' },
    { id: 'NC-002', supplierId: 'SUP-002', title: 'Test NC 2', status: 'açık' }
  ];
  
  const strongDefects = [
    { id: 'DEF-001', supplierId: 'SUP-001', defectType: 'Test Defect 1', status: 'açık' },
    { id: 'DEF-002', supplierId: 'SUP-002', defectType: 'Test Defect 2', status: 'açık' }
  ];
  
  localStorage.setItem('suppliers', JSON.stringify(strongSuppliers));
  localStorage.setItem('supplier-nonconformities', JSON.stringify(strongNonconformities));
  localStorage.setItem('supplier-defects', JSON.stringify(strongDefects));
  
  console.log('💪 Güçlü test verisi yüklendi!');
  window.dispatchEvent(new Event('supplierDataUpdated'));
  
  // Hemen kontrol et
  setTimeout(() => {
    debugGetSupplierData();
  }, 1000);
}

console.log('\n🛠️  Kullanılabilir Fonksiyonlar:');
console.log('  loadStrongTestData() - Güçlü test verisi yükle');

// Global fonksiyon tanımla
window.debugGetSupplierData = debugGetSupplierData;
window.loadStrongTestData = loadStrongTestData;

console.log('🏁 Debug tamamlandı. Sonuçları kontrol edin!'); 