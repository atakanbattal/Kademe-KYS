// 🔧 QUALITY MANAGEMENT MODULE CONNECTION FIX
// Bu script, Quality Management dashboard'daki bağlantısız modülleri düzeltir
// Sistem http://localhost:3080 adresinde çalışıyor

console.log('🚀 QUALITY MANAGEMENT MODULE CONNECTION FIX BAŞLIYOR...');

// 1. MEVCUT DURUM KONTROLÜ
function checkCurrentStatus() {
  console.log('\n📊 MEVCUT DURUM KONTROLÜ:');
  
  const keys = [
    'suppliers',                    // Tedarikçi Kalite Yönetimi
    'auditManagementData',         // İç Denetim Yönetimi
    'documentManagementData',      // Doküman Yönetimi
    'customer-feedbacks',          // Müşteri Geri Bildirim
    'equipmentCalibration',        // Ekipman Kalibrasyon
    'riskManagementData',          // Risk Yönetimi (bonus)
    'training-records'             // Eğitim Yönetimi (bonus)
  ];
  
  const status = {};
  keys.forEach(key => {
    const data = localStorage.getItem(key);
    const count = data ? JSON.parse(data).length : 0;
    status[key] = { exists: !!data, count };
    console.log(`  ✓ ${key}: ${count > 0 ? '✅ '+count+' kayıt' : '❌ VERİ YOK'}`);
  });
  
  return status;
}

// 2. VERİ OLUŞTURMA FONKSİYONLARI
function createSupplierData() {
  return [
    {
      id: 'SUP-001',
      name: 'Seçkinler Metal A.Ş.',
      code: 'SM001',
      type: 'onaylı',
      status: 'approved',
      qualificationStatus: 'qualified',
      performanceScore: 88,
      qualityScore: 92,
      deliveryScore: 85,
      lastAuditDate: '2024-10-15',
      nextAuditDate: '2024-12-15'
    },
    {
      id: 'SUP-002',
      name: 'Nisa Metal Ltd.',
      code: 'NM002',
      type: 'onaylı',
      status: 'approved',
      qualificationStatus: 'qualified',
      performanceScore: 95,
      qualityScore: 96,
      deliveryScore: 94,
      lastAuditDate: '2024-11-01',
      nextAuditDate: '2025-01-01'
    },
    {
      id: 'SUP-003',
      name: 'Demir Çelik San.',
      code: 'DC003',
      type: 'alternatif',
      status: 'approved',
      qualificationStatus: 'qualified',
      performanceScore: 78,
      qualityScore: 75,
      deliveryScore: 82,
      lastAuditDate: '2024-09-20',
      nextAuditDate: '2024-11-20'
    }
  ];
}

function createAuditData() {
  return [
    {
      id: 'AUDIT-001',
      title: 'ISO 9001:2015 İç Denetimi',
      department: 'Kalite Kontrol',
      auditDate: '2024-10-25',
      status: 'completed',
      auditorName: 'Mehmet Kaya',
      scope: 'Kalite yönetim sistemi',
      findings: 2,
      nonconformities: [
        { id: 'NC-A001', description: 'Doküman kontrol eksikliği', severity: 'minor' }
      ]
    },
    {
      id: 'AUDIT-002',
      title: 'Üretim Süreç Denetimi',
      department: 'Üretim',
      auditDate: '2024-11-15',
      status: 'completed',
      auditorName: 'Ayşe Demir',
      scope: 'Üretim süreçleri',
      findings: 1,
      nonconformities: []
    },
    {
      id: 'AUDIT-003',
      title: 'Tedarikçi Denetimi',
      department: 'Satın Alma',
      auditDate: '2024-12-10',
      status: 'planning',
      auditorName: 'Ali Vural',
      scope: 'Tedarikçi değerlendirme',
      findings: 0,
      nonconformities: []
    }
  ];
}

function createDocumentData() {
  return [
    {
      id: 'DOC-001',
      title: 'Kalite El Kitabı',
      documentType: 'handbook',
      version: '3.1',
      status: 'approved',
      approvalDate: '2024-01-15',
      expiryDate: '2025-01-15',
      department: 'Kalite Kontrol',
      responsiblePerson: 'Fatma Özkan'
    },
    {
      id: 'DOC-002',
      title: 'Üretim Prosedürü',
      documentType: 'procedure',
      version: '2.4',
      status: 'approved',
      approvalDate: '2024-09-20',
      expiryDate: '2025-09-20',
      department: 'Üretim',
      responsiblePerson: 'Hasan Türk'
    },
    {
      id: 'DOC-003',
      title: 'İş Talimatı - Tank Kaynağı',
      documentType: 'instruction',
      version: '1.2',
      status: 'approved',
      approvalDate: '2024-08-10',
      expiryDate: '2025-08-10',
      department: 'Kaynak',
      responsiblePerson: 'Osman Çelik'
    },
    {
      id: 'DOC-004',
      title: 'Test Formu',
      documentType: 'form',
      version: '1.0',
      status: 'draft',
      approvalDate: null,
      expiryDate: null,
      department: 'Kalite Kontrol',
      responsiblePerson: 'Zeynep Akar'
    },
    {
      id: 'DOC-005',
      title: 'Risk Değerlendirme Formu',
      documentType: 'form',
      version: '2.1',
      status: 'approved',
      approvalDate: '2024-06-05',
      expiryDate: '2025-06-05',
      department: 'İSG',
      responsiblePerson: 'Murat Kılıç'
    }
  ];
}

function createCustomerFeedbackData() {
  return [
    {
      id: 'FB-001',
      customerName: 'ABC İnşaat Ltd.',
      feedbackType: 'complaint',
      subject: 'Tank kalite sorunu',
      description: 'Teslim edilen tankta kalite problemi tespit edildi',
      date: '2024-11-20',
      status: 'resolved',
      priority: 'high',
      rating: 2,
      assignedTo: 'Kalite Ekibi',
      resolutionDate: '2024-11-25'
    }
  ];
}

function createEquipmentCalibrationData() {
  return [
    {
      id: 'EQ-001',
      equipmentCode: 'CAL-001',
      name: 'Dijital Kumpas',
      manufacturer: 'Mitutoyo',
      model: 'CD-15CPX',
      serialNumber: 'MT2024001',
      category: 'Ölçüm Cihazları',
      location: 'Kalite Kontrol Lab',
      department: 'Kalite Kontrol',
      status: 'calibrated',
      calibrationRequired: true,
      lastCalibrationDate: '2024-01-15',
      nextCalibrationDate: '2025-01-15',
      calibrationStatus: 'valid'
    },
    {
      id: 'EQ-002',
      equipmentCode: 'CAL-002',
      name: 'Basınç Test Cihazı',
      manufacturer: 'Wika',
      model: 'CPT6100',
      serialNumber: 'WK2024002',
      category: 'Test Cihazları',
      location: 'Test Lab',
      department: 'Kalite Kontrol',
      status: 'calibrated',
      calibrationRequired: true,
      lastCalibrationDate: '2024-06-01',
      nextCalibrationDate: '2024-12-01',
      calibrationStatus: 'due'
    },
    {
      id: 'EQ-003',
      equipmentCode: 'CAL-003',
      name: 'Sızdırmazlık Test Ünitesi',
      manufacturer: 'Ateq',
      model: 'F620',
      serialNumber: 'AT2024003',
      category: 'Test Cihazları',
      location: 'Test Alanı',
      department: 'Kalite Kontrol',
      status: 'calibrated',
      calibrationRequired: true,
      lastCalibrationDate: '2024-08-15',
      nextCalibrationDate: '2025-02-15',
      calibrationStatus: 'valid'
    },
    {
      id: 'EQ-004',
      equipmentCode: 'CAL-004',
      name: 'Ultrasonik Kalınlık Ölçer',
      manufacturer: 'GE',
      model: 'DM5E',
      serialNumber: 'GE2024004',
      category: 'NDT Cihazları',
      location: 'Kaynak Lab',
      department: 'Kalite Kontrol',
      status: 'needs_calibration',
      calibrationRequired: true,
      lastCalibrationDate: '2023-12-01',
      nextCalibrationDate: '2024-06-01',
      calibrationStatus: 'overdue'
    },
    {
      id: 'EQ-005',
      equipmentCode: 'CAL-005',
      name: 'Çekme Test Makinesi',
      manufacturer: 'Instron',
      model: '5969',
      serialNumber: 'IN2024005',
      category: 'Mekanik Test',
      location: 'Mekanik Lab',
      department: 'Kalite Kontrol',
      status: 'calibrated',
      calibrationRequired: true,
      lastCalibrationDate: '2024-09-10',
      nextCalibrationDate: '2025-03-10',
      calibrationStatus: 'valid'
    }
  ];
}

function createRiskData() {
  return [
    {
      id: 'RISK-001',
      title: 'Kaynak kalitesi riski',
      category: 'kalite',
      probability: 3,
      impact: 4,
      riskLevel: 'high',
      severity: 'high',
      status: 'mitigated',
      description: 'Kaynak işlemi sırasında kalite sorunları',
      mitigation: 'WPS prosedürlerinin güncellenmesi'
    },
    {
      id: 'RISK-002',
      title: 'Tedarikçi gecikme riski',
      category: 'tedarik',
      probability: 2,
      impact: 3,
      riskLevel: 'medium',
      severity: 'medium',
      status: 'monitoring',
      description: 'Tedarikçi teslimat gecikmesi riski',
      mitigation: 'Alternatif tedarikçi belirlenmesi'
    },
    {
      id: 'RISK-003',
      title: 'Ekipman arıza riski',
      category: 'operasyonel',
      probability: 2,
      impact: 4,
      riskLevel: 'high',
      severity: 'high',
      status: 'identified',
      description: 'Kritik üretim ekipmanlarında arıza riski',
      mitigation: 'Önleyici bakım programının iyileştirilmesi'
    }
  ];
}

function createTrainingData() {
  return [
    {
      id: 'TRN-001',
      title: 'ISO 9001:2015 Temel Eğitimi',
      trainee: 'Personel Grubu A',
      trainer: 'Mehmet Uzman',
      date: '2024-09-15',
      duration: 8,
      status: 'completed',
      certificateIssued: true,
      hasCertificate: true,
      score: 85
    }
  ];
}

// 3. VERİ YÜKLEME FONKSİYONU
function loadModuleData() {
  console.log('\n🔧 EKSİK MODÜL VERİLERİ YÜKLEME:');
  
  const currentStatus = checkCurrentStatus();
  let loaded = 0;
  
  // Tedarikçi verisi
  if (currentStatus.suppliers.count === 0) {
    localStorage.setItem('suppliers', JSON.stringify(createSupplierData()));
    console.log('  ✅ Tedarikçi verisi yüklendi (3 kayıt)');
    loaded++;
  }
  
  // İç denetim verisi
  if (currentStatus.auditManagementData.count === 0) {
    localStorage.setItem('auditManagementData', JSON.stringify(createAuditData()));
    console.log('  ✅ İç denetim verisi yüklendi (3 kayıt)');
    loaded++;
  }
  
  // Doküman verisi
  if (currentStatus.documentManagementData.count === 0) {
    localStorage.setItem('documentManagementData', JSON.stringify(createDocumentData()));
    console.log('  ✅ Doküman verisi yüklendi (5 kayıt)');
    loaded++;
  }
  
  // Müşteri geri bildirim verisi
  if (currentStatus['customer-feedbacks'].count === 0) {
    localStorage.setItem('customer-feedbacks', JSON.stringify(createCustomerFeedbackData()));
    console.log('  ✅ Müşteri geri bildirim verisi yüklendi (1 kayıt)');
    loaded++;
  }
  
  // Ekipman kalibrasyon verisi
  if (currentStatus.equipmentCalibration.count === 0) {
    localStorage.setItem('equipmentCalibration', JSON.stringify(createEquipmentCalibrationData()));
    console.log('  ✅ Ekipman kalibrasyon verisi yüklendi (5 kayıt)');
    loaded++;
  }
  
  // Risk yönetimi verisi (bonus)
  if (currentStatus.riskManagementData.count === 0) {
    localStorage.setItem('riskManagementData', JSON.stringify(createRiskData()));
    console.log('  ✅ Risk yönetimi verisi yüklendi (3 kayıt)');
    loaded++;
  }
  
  // Eğitim verisi (bonus)
  if (currentStatus['training-records'].count === 0) {
    localStorage.setItem('training-records', JSON.stringify(createTrainingData()));
    console.log('  ✅ Eğitim verisi yüklendi (1 kayıt)');
    loaded++;
  }
  
  return loaded;
}

// 4. ANA FİX FONKSİYONU
function fixModuleConnections() {
  console.log('\n🎯 MODÜL BAĞLANTI DÜZELTMESİ BAŞLADI:');
  
  // Mevcut durum
  const beforeStatus = checkCurrentStatus();
  const beforeDisconnected = Object.keys(beforeStatus).filter(key => beforeStatus[key].count === 0);
  
  console.log(`\n📊 Bağlantısız modül sayısı: ${beforeDisconnected.length}`);
  if (beforeDisconnected.length > 0) {
    console.log('  ❌ Bağlantısız modüller:', beforeDisconnected.join(', '));
  }
  
  // Veri yükle
  const loadedCount = loadModuleData();
  
  // Sonuç kontrol
  console.log('\n📈 SONUÇ:');
  const afterStatus = checkCurrentStatus();
  const afterDisconnected = Object.keys(afterStatus).filter(key => afterStatus[key].count === 0);
  
  console.log(`  🎉 ${loadedCount} modül verisi yüklendi`);
  console.log(`  📊 Kalan bağlantısız modül: ${afterDisconnected.length}`);
  
  if (afterDisconnected.length === 0) {
    console.log('\n🎯 ✅ TÜM MODÜLLER BAŞARIYLA BAĞLANDI!');
  } else {
    console.log('\n⚠️ Hala bağlantısız modüller var:', afterDisconnected.join(', '));
  }
  
  return {
    before: beforeDisconnected.length,
    after: afterDisconnected.length,
    loaded: loadedCount,
    success: afterDisconnected.length === 0
  };
}

// 5. SCRIPT ÇALIŞTIR
try {
  const result = fixModuleConnections();
  
  if (result.success) {
    console.log('\n🚀 BAŞARILI! Sayfa yenileniyor...');
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  } else {
    console.log('\n⚠️ Bazı modüller hala bağlanamadı. Manuel kontrol gerekebilir.');
  }
  
} catch (error) {
  console.error('❌ Script çalıştırma hatası:', error);
  console.log('💡 Tarayıcı konsolunu yeniden açın ve scripti tekrar çalıştırın.');
}

console.log('\n🔧 QUALITY MANAGEMENT MODULE CONNECTION FIX TAMAMLANDI.'); 