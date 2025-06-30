// 🔧 MODÜL ENTEGRASYONU VE STORAGE ANAHTARI DÜZELTME SCRİPTİ
// Bu script localStorage'daki mevcut verileri KPI sisteminin beklediği anahtarlarla senkronize eder

console.log('🔧 MODÜL STORAGE ANAHTARI DÜZELTME BAŞLATILIYOR...\n');

// 1. MEVCUT DURUMU KONTROL ET
function checkCurrentStorage() {
  const keys = Object.keys(localStorage);
  console.log('📋 MEVCUT LOCALSTORAGE ANAHTARLARI:', keys.length);
  
  const moduleData = {};
  keys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data && data !== 'null' && data !== '[]') {
      try {
        const parsed = JSON.parse(data);
        moduleData[key] = Array.isArray(parsed) ? parsed.length : 'object';
      } catch (e) {
        moduleData[key] = 'string';
      }
    }
  });
  
  console.table(moduleData);
  return moduleData;
}

// 2. KPI SİSTEMİNİN BEKLEDİĞİ ANAHTAR İSİMLERİ
const expectedKeys = {
  // KPI fonksiyonunda kullanılan -> Modülde kullanılan
  'productionQualityData': 'productionQualityTracking',
  'equipment_calibration_data': 'equipmentCalibration',
  'materialCertificateTracking': 'materialCertificateTracking', // aynı
  'tankLeakTests': 'tankLeakTests', // aynı
  'fanTestRecords': 'fanTestRecords', // aynı
  'audit-findings': 'auditManagementData',
  'kys-cost-management-data': 'kys-cost-management-data', // aynı
  'suppliers': 'suppliers', // aynı
  'supplier-nonconformities': 'supplier-nonconformities', // aynı
  'supplier-defects': 'supplier-defects', // aynı
  'dofRecords': 'dofRecords', // aynı
  'riskManagementData': 'riskManagementData', // aynı
  'training-records': 'training-records', // aynı
  'customer-feedbacks': 'customer-feedbacks' // aynı
};

// 3. VERİ SENKRONIZASYONU
function syncStorageKeys() {
  console.log('\n🔄 VERİ SENKRONİZASYONU BAŞLATIYOR...');
  
  let syncCount = 0;
  
  Object.entries(expectedKeys).forEach(([kpiKey, moduleKey]) => {
    const moduleData = localStorage.getItem(moduleKey);
    const kpiData = localStorage.getItem(kpiKey);
    
    if (moduleData && moduleData !== 'null' && moduleData !== '[]' && !kpiData) {
      localStorage.setItem(kpiKey, moduleData);
      console.log(`  ✅ ${moduleKey} -> ${kpiKey} senkronize edildi`);
      syncCount++;
    } else if (kpiData && kpiData !== 'null' && kpiData !== '[]' && !moduleData) {
      localStorage.setItem(moduleKey, kpiData);
      console.log(`  ✅ ${kpiKey} -> ${moduleKey} senkronize edildi`);
      syncCount++;
    }
  });
  
  console.log(`\n📊 Toplam ${syncCount} adet veri senkronize edildi`);
  return syncCount;
}

// 4. EKSİK VERİLERİ OLUŞTUR
function createMissingData() {
  console.log('\n🏗️ EKSİK VERİLERİ OLUŞTURUYOR...');
  
  let createdCount = 0;
  
  // Üretim Kalite Verisi
  if (!localStorage.getItem('productionQualityData') && !localStorage.getItem('productionQualityTracking')) {
    const productionData = [
      {
        id: 'PROD-001',
        vehicleId: 'KDM-001',
        productionDate: '2024-11-01',
        defects: [],
        qualityScore: 98,
        status: 'Approved'
      },
      {
        id: 'PROD-002',
        vehicleId: 'KDM-002',
        productionDate: '2024-11-02',
        defects: [
          { id: 'DEF-001', defectType: 'Painting', status: 'resolved', severity: 'minor' }
        ],
        qualityScore: 95,
        status: 'Approved'
      },
      {
        id: 'PROD-003',
        vehicleId: 'KDM-003',
        productionDate: '2024-11-03',
        defects: [],
        qualityScore: 100,
        status: 'Approved'
      }
    ];
    localStorage.setItem('productionQualityData', JSON.stringify(productionData));
    localStorage.setItem('productionQualityTracking', JSON.stringify(productionData));
    console.log('  ✅ Üretim kalite verisi oluşturuldu (3 kayıt)');
    createdCount++;
  }
  
  // Ekipman Kalibrasyon Verisi
  if (!localStorage.getItem('equipment_calibration_data') && !localStorage.getItem('equipmentCalibration')) {
    const equipmentData = [
      {
        id: 'EQ-001',
        equipmentName: 'Kaynak Makinesi #1',
        lastCalibrationDate: '2024-10-15',
        nextCalibrationDate: '2025-01-15',
        status: 'calibrated',
        calibrationResult: 'passed'
      },
      {
        id: 'EQ-002',
        equipmentName: 'Ölçüm Cihazı #2',
        lastCalibrationDate: '2024-09-20',
        nextCalibrationDate: '2024-12-20',
        status: 'calibrated',
        calibrationResult: 'passed'
      },
      {
        id: 'EQ-003',
        equipmentName: 'Test Ekipmanı #3',
        lastCalibrationDate: '2024-08-10',
        nextCalibrationDate: '2024-11-10',
        status: 'overdue',
        calibrationResult: 'pending'
      }
    ];
    localStorage.setItem('equipment_calibration_data', JSON.stringify(equipmentData));
    localStorage.setItem('equipmentCalibration', JSON.stringify(equipmentData));
    console.log('  ✅ Ekipman kalibrasyon verisi oluşturuldu (3 kayıt)');
    createdCount++;
  }
  
  // Malzeme Sertifika Verisi
  if (!localStorage.getItem('materialCertificateTracking')) {
    const materialData = [
      {
        id: 'MAT-001',
        materialName: 'Çelik Levha S355',
        certificateNumber: 'CERT-2024-001',
        certificateStatus: 'valid',
        expiryDate: '2025-06-15',
        status: 'certified'
      },
      {
        id: 'MAT-002',
        materialName: 'Alüminyum Profil',
        certificateNumber: 'CERT-2024-002',
        certificateStatus: 'valid',
        expiryDate: '2025-03-20',
        status: 'certified'
      }
    ];
    localStorage.setItem('materialCertificateTracking', JSON.stringify(materialData));
    console.log('  ✅ Malzeme sertifika verisi oluşturuldu (2 kayıt)');
    createdCount++;
  }
  
  // Tank Sızıntı Test Verisi
  if (!localStorage.getItem('tankLeakTests')) {
    const tankTestData = [
      {
        id: 'TLT-001',
        tankId: 'TANK-001',
        testDate: '2024-11-01',
        testResult: { result: 'passed', leakRate: 0 },
        status: 'completed'
      },
      {
        id: 'TLT-002',
        tankId: 'TANK-002',
        testDate: '2024-11-02',
        testResult: { result: 'passed', leakRate: 0 },
        status: 'completed'
      }
    ];
    localStorage.setItem('tankLeakTests', JSON.stringify(tankTestData));
    console.log('  ✅ Tank sızıntı test verisi oluşturuldu (2 kayıt)');
    createdCount++;
  }
  
  // Denetim Bulgular Verisi
  if (!localStorage.getItem('audit-findings')) {
    const auditFindings = [
      {
        id: 'AF-001',
        title: 'Doküman Kontrol Eksikliği',
        status: 'open',
        severity: 'medium',
        department: 'Kalite Güvence'
      },
      {
        id: 'AF-002',
        title: 'Kayıt Tutma Uygunsuzluğu',
        status: 'closed',
        severity: 'low',
        department: 'Üretim'
      }
    ];
    localStorage.setItem('audit-findings', JSON.stringify(auditFindings));
    console.log('  ✅ Denetim bulgular verisi oluşturuldu (2 kayıt)');
    createdCount++;
  }
  
  // Maliyet Verisi
  if (!localStorage.getItem('kys-cost-management-data')) {
    const costData = [
      {
        id: 'COST-001',
        maliyetTuru: 'iç_hata',
        maliyetMiktari: 15000,
        birimMaliyeti: 500,
        tarih: '2024-11-01',
        aciklama: 'Üretimde tespit edilen hata maliyeti'
      },
      {
        id: 'COST-002',
        maliyetTuru: 'garanti',
        maliyetMiktari: 8500,
        birimMaliyeti: 850,
        tarih: '2024-11-02',
        aciklama: 'Garanti kapsamında düzeltme maliyeti'
      }
    ];
    localStorage.setItem('kys-cost-management-data', JSON.stringify(costData));
    console.log('  ✅ Maliyet yönetimi verisi oluşturuldu (2 kayıt)');
    createdCount++;
  }
  
  console.log(`\n📊 Toplam ${createdCount} adet eksik veri oluşturuldu`);
  return createdCount;
}

// 5. TÜM MODÜL BAĞLANTILARI KONTROL ET
function validateModuleConnections() {
  console.log('\n✅ MODÜL BAĞLANTI DURUMU:');
  
  const modules = [
    { name: 'Kalite Maliyet Yönetimi', key: 'kys-cost-management-data' },
    { name: 'Tedarikçi Kalite Yönetimi', key: 'suppliers' },
    { name: 'DÖF 8D Yönetimi', key: 'dofRecords' },
    { name: 'Risk Yönetimi', key: 'riskManagementData' },
    { name: 'Üretim Kalite Takibi', key: 'productionQualityData' },
    { name: 'Ekipman Kalibrasyon', key: 'equipment_calibration_data' },
    { name: 'Eğitim Yönetimi', key: 'training-records' },
    { name: 'Tank Sızıntı Testi', key: 'tankLeakTests' },
    { name: 'Müşteri Geri Bildirim', key: 'customer-feedbacks' },
    { name: 'Fan Test Analizi', key: 'fanTestRecords' },
    { name: 'Malzeme Sertifika Takibi', key: 'materialCertificateTracking' },
    { name: 'Denetim Bulgular', key: 'audit-findings' }
  ];
  
  const results = modules.map(module => {
    const data = localStorage.getItem(module.key);
    const hasData = data && data !== 'null' && data !== '[]';
    const count = hasData ? JSON.parse(data).length : 0;
    
    return {
      'Modül': module.name,
      'Durum': hasData ? '✅ Bağlı' : '❌ Bağlantısız',
      'Kayıt Sayısı': count,
      'Anahtar': module.key
    };
  });
  
  console.table(results);
  
  const connectedCount = results.filter(r => r.Durum === '✅ Bağlı').length;
  console.log(`\n📊 SONUÇ: ${connectedCount}/${modules.length} modül bağlı`);
  
  return { total: modules.length, connected: connectedCount };
}

// 6. ANA ÇALIŞTIRMA FONKSİYONU
function main() {
  console.log('🚀 MODÜL ENTEGRASYONU DÜZELTME SCRİPTİ\n');
  
  // Mevcut durumu kontrol et
  const currentStorage = checkCurrentStorage();
  
  // Veri senkronizasyonu yap
  const syncedCount = syncStorageKeys();
  
  // Eksik verileri oluştur
  const createdCount = createMissingData();
  
  // Sonuçları kontrol et
  const validation = validateModuleConnections();
  
  console.log('\n🎯 ÖZET:');
  console.log(`  📦 Mevcut localStorage anahtarı: ${Object.keys(currentStorage).length}`);
  console.log(`  🔄 Senkronize edilen veri: ${syncedCount}`);
  console.log(`  🏗️ Oluşturulan eksik veri: ${createdCount}`);
  console.log(`  ✅ Bağlı modül: ${validation.connected}/${validation.total}`);
  
  if (validation.connected === validation.total) {
    console.log('\n🎉 TÜM MODÜLLER BAŞARIYLA BAĞLANDI!');
    console.log('🔄 KPI Management sayfasını yenileyin');
  } else {
    console.log('\n⚠️ Bazı modüller hala bağlantısız. Lütfen ilgili modülleri kontrol edin.');
  }
  
  // Storage event tetikle
  window.dispatchEvent(new Event('storage'));
  
  return {
    success: validation.connected === validation.total,
    details: {
      totalModules: validation.total,
      connectedModules: validation.connected,
      syncedData: syncedCount,
      createdData: createdCount
    }
  };
}

// Scripti çalıştır
const result = main();
console.log('\n✨ SCRIPT TAMAMLANDI:', result); 