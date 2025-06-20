// ===============================
// 🚀 QUALITY MANAGEMENT TEST VERİSİ OLUŞTURUCU
// ===============================
// Bu script'i browser console'da çalıştırın

console.log('🚀 Quality Management Test Verisi Oluşturuluyor...');

// ✅ 1. KALİTESİZLİK MALİYETİ TEST VERİSİ
const costManagementData = [
  {
    id: 1,
    parcaKodu: 'TK-501',
    maliyetTuru: 'hurda',
    maliyet: 25000,
    birim: 'kaynak',
    departman: 'Kaynak Departmanı',
    tarih: '2024-11-01',
    aciklama: 'Kaynak dikişlerinde hata tespit edildi'
  },
  {
    id: 2,
    parcaKodu: 'FN-302',
    maliyetTuru: 'yeniden_islem',
    maliyet: 18000,
    birim: 'montaj',
    departman: 'Montaj Departmanı',
    tarih: '2024-11-05',
    aciklama: 'Fan balans ayarı yeniden yapıldı'
  },
  {
    id: 3,
    parcaKodu: 'TK-750',
    maliyetTuru: 'fire',
    maliyet: 35000,
    birim: 'kaynak',
    departman: 'Kaynak Departmanı',
    tarih: '2024-11-10',
    aciklama: 'Tank üretiminde malzeme fire'
  },
  {
    id: 4,
    parcaKodu: 'CL-120',
    maliyetTuru: 'garanti',
    maliyet: 45000,
    birim: 'kalite_kontrol',
    departman: 'Kalite Kontrol',
    tarih: '2024-11-12',
    aciklama: 'Müşteri garanti talebi'
  },
  {
    id: 5,
    parcaKodu: 'PM-801',
    maliyetTuru: 'sikayet',
    maliyet: 12000,
    birim: 'boyahane',
    departman: 'Boyahane',
    tarih: '2024-11-15',
    aciklama: 'Boya kalitesi şikayeti'
  }
];

localStorage.setItem('kys-cost-management-data', JSON.stringify(costManagementData));
console.log('✅ Kalitesizlik maliyeti test verisi oluşturuldu:', costManagementData.length, 'kayıt');

// ✅ 2. DÖF VE 8D TEST VERİSİ
const dofRecords = [
  {
    id: 'DOF-2024-001',
    dofNumber: 'DOF-2024-001',
    title: 'Kaynak Dikişi Hatası',
    description: 'Tank yan duvarında kaynak hatası tespit edildi',
    priority: 'high',
    status: 'open',
    department: 'Kaynak Departmanı',
    responsible: 'Atakan Battal',
    createdDate: '2024-11-01',
    openingDate: '2024-11-01',
    dueDate: '2024-12-01',
    type: 'dof',
    rootCause: 'Kaynak parametresi yanlış ayarlanmış',
    actions: [
      { id: 1, description: 'Kaynak parametrelerini kontrol et', responsible: 'Kaynak Forman', dueDate: '2024-11-15', status: 'completed' }
    ]
  },
  {
    id: 'DOF-2024-002',
    dofNumber: 'DOF-2024-002',
    title: 'Fan Balans Problemi',
    description: 'Fan performans testinde balans hatası',
    priority: 'medium',
    status: 'closed',
    department: 'Montaj Departmanı',
    responsible: 'Atakan Battal',
    createdDate: '2024-10-15',
    openingDate: '2024-10-15',
    dueDate: '2024-11-15',
    closedDate: '2024-11-10',
    type: 'dof',
    rootCause: 'Fan kanadı montaj hatası',
    actions: [
      { id: 1, description: 'Fan kanadı yeniden monte et', responsible: 'Montaj Teknisyeni', dueDate: '2024-11-01', status: 'completed' }
    ]
  },
  {
    id: 'MDI-2024-001',
    dofNumber: 'MDI-2024-001',
    title: 'Tank Sızdırmazlık Hatası',
    description: 'Tank sızdırmazlık testinde başarısızlık',
    priority: 'critical',
    status: 'open',
    department: 'Kalite Kontrol',
    responsible: 'Atakan Battal',
    createdDate: '2024-11-20',
    openingDate: '2024-11-20',
    dueDate: '2024-12-20',
    type: '8d',
    rootCause: 'Kaynak dikişi sızdırıyor',
    actions: [
      { id: 1, description: 'Sızdıran kaynak dikişini tespit et', responsible: 'Kalite Kontrol', dueDate: '2024-11-25', status: 'in_progress' }
    ]
  }
];

localStorage.setItem('dofRecords', JSON.stringify(dofRecords));
console.log('✅ DÖF ve 8D test verisi oluşturuldu:', dofRecords.length, 'kayıt');

// ✅ 3. TANK SIZDIRMAZLIK TESTİ VERİSİ
const tankLeakTests = [
  {
    id: 'TLT-001',
    tankId: 'TK-501',
    testDate: '2024-11-01',
    testType: 'pressure',
    testPressure: 2.5,
    testDuration: 60,
    result: 'pass',
    notes: 'Test başarılı, sızdırmazlık OK',
    inspector: 'Atakan Battal'
  },
  {
    id: 'TLT-002',
    tankId: 'TK-750',
    testDate: '2024-11-10',
    testType: 'pressure',
    testPressure: 2.5,
    testDuration: 60,
    result: 'fail',
    notes: 'Alt kaynak dikişinde sızıntı tespit edildi',
    inspector: 'Atakan Battal'
  },
  {
    id: 'TLT-003',
    tankId: 'TK-302',
    testDate: '2024-11-15',
    testType: 'vacuum',
    testPressure: -0.5,
    testDuration: 30,
    result: 'pass',
    notes: 'Vakum testi başarılı',
    inspector: 'Atakan Battal'
  },
  {
    id: 'TLT-004',
    tankId: 'TK-120',
    testDate: '2024-11-20',
    testType: 'pressure',
    testPressure: 3.0,
    testDuration: 60,
    result: 'pass',
    notes: 'Yüksek basınç testi başarılı',
    inspector: 'Atakan Battal'
  }
];

localStorage.setItem('tankLeakTests', JSON.stringify(tankLeakTests));
console.log('✅ Tank sızdırmazlık test verisi oluşturuldu:', tankLeakTests.length, 'kayıt');

// ✅ 4. FAN TEST ANALİZİ VERİSİ
const fanTestRecords = [
  {
    id: 'FTA-001',
    fanId: 'FN-302',
    testDate: '2024-11-05',
    testType: 'balance',
    balanceLevel: 'G6.3',
    result: 'fail',
    vibrationLevel: 8.5,
    notes: 'Balans değeri limit dışı',
    correctedBalance: true,
    retestResult: 'pass'
  },
  {
    id: 'FTA-002',
    fanId: 'FN-401',
    testDate: '2024-11-08',
    testType: 'performance',
    balanceLevel: 'G2.5',
    result: 'pass',
    vibrationLevel: 2.1,
    notes: 'Performans testleri normal',
    correctedBalance: false
  },
  {
    id: 'FTA-003',
    fanId: 'FN-501',
    testDate: '2024-11-12',
    testType: 'balance',
    balanceLevel: 'G6.3',
    result: 'conditional',
    vibrationLevel: 6.8,
    notes: 'Sınır değerlerde, izleme gerekli',
    correctedBalance: false
  }
];

localStorage.setItem('fanTestRecords', JSON.stringify(fanTestRecords));
console.log('✅ Fan test analizi verisi oluşturuldu:', fanTestRecords.length, 'kayıt');

// ✅ 5. TEDARİKÇİ VERİLERİ
const suppliers = [
  {
    id: 'SUP-001',
    name: 'Seçkinler Metal A.Ş.',
    code: 'SM001',
    type: 'onaylı',
    status: 'aktif',
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
    type: 'alternatif',
    status: 'aktif',
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
    type: 'onaylı',
    status: 'beklemede',
    performanceScore: 78,
    qualityScore: 75,
    deliveryScore: 82,
    lastAuditDate: '2024-09-20',
    nextAuditDate: '2024-11-20'
  }
];

localStorage.setItem('suppliers', JSON.stringify(suppliers));
console.log('✅ Tedarikçi verisi oluşturuldu:', suppliers.length, 'kayıt');

// ✅ 6. TEDARİKÇİ UYGUNSUZLUK VERİSİ
const supplierNonconformities = [
  {
    id: 'NC-001',
    supplierId: 'SUP-001',
    title: 'Boyut Sapması',
    description: 'Çelik levhalarda boyut toleransı aşımı',
    category: 'kalite',
    severity: 'yüksek',
    detectedDate: '2024-11-15',
    status: 'açık',
    dueDate: '2024-12-15',
    correctionCost: 15000,
    partCode: 'CL-001',
    quantityAffected: 25
  },
  {
    id: 'NC-002',
    supplierId: 'SUP-003',
    title: 'Teslimat Gecikmesi',
    description: 'Planlanan teslimat tarihinden 5 gün gecikme',
    category: 'teslimat',
    severity: 'orta',
    detectedDate: '2024-11-10',
    status: 'kapalı',
    dueDate: '2024-11-20',
    correctionCost: 8000,
    partCode: 'PM-002',
    delayDays: 5
  }
];

localStorage.setItem('supplier-nonconformities', JSON.stringify(supplierNonconformities));
console.log('✅ Tedarikçi uygunsuzluk verisi oluşturuldu:', supplierNonconformities.length, 'kayıt');

// ✅ 7. TEDARİKÇİ HATA VERİSİ
const supplierDefects = [
  {
    id: 'DEF-001',
    supplierId: 'SUP-001',
    defectType: 'Kaynak Hatası',
    description: 'Kaynak dikişlerinde porozite',
    quantity: 12,
    detectedDate: '2024-11-10',
    batchNumber: 'BT-2024-001',
    severity: 'major',
    status: 'açık',
    correctionCost: 18000
  },
  {
    id: 'DEF-002',
    supplierId: 'SUP-002',
    defectType: 'Yüzey Kalitesi',
    description: 'Yüzey pürüzlülüğü standart dışı',
    quantity: 5,
    detectedDate: '2024-11-22',
    batchNumber: 'BT-2024-003',
    severity: 'minor',
    status: 'düzeltildi',
    correctionCost: 6500
  }
];

localStorage.setItem('supplier-defects', JSON.stringify(supplierDefects));
console.log('✅ Tedarikçi hata verisi oluşturuldu:', supplierDefects.length, 'kayıt');

// ✅ 8. ÜRETİM KALİTE TAKİP VERİSİ
const productionQualityTracking = [
  {
    id: 'PROD-001',
    vehicleId: 'V-001',
    vehicleModel: 'Tank 500L',
    productionDate: '2024-11-01',
    qualityStatus: 'approved',
    defects: [],
    totalDefects: 0,
    criticalDefects: 0,
    inspectionResults: { overall: 'pass' }
  },
  {
    id: 'PROD-002',
    vehicleId: 'V-002',
    vehicleModel: 'Tank 1000L',
    productionDate: '2024-11-10',
    qualityStatus: 'rejected',
    defects: [
      { type: 'weld_defect', severity: 'major', description: 'Kaynak dikişi hatası' }
    ],
    totalDefects: 1,
    criticalDefects: 1,
    inspectionResults: { overall: 'fail' }
  },
  {
    id: 'PROD-003',
    vehicleId: 'V-003',
    vehicleModel: 'Tank 750L',
    productionDate: '2024-11-15',
    qualityStatus: 'approved',
    defects: [],
    totalDefects: 0,
    criticalDefects: 0,
    inspectionResults: { overall: 'pass' }
  },
  {
    id: 'PROD-004',
    vehicleId: 'V-004',
    vehicleModel: 'Fan Ünitesi',
    productionDate: '2024-11-20',
    qualityStatus: 'conditional',
    defects: [
      { type: 'balance_issue', severity: 'minor', description: 'Hafif balans sapması' }
    ],
    totalDefects: 1,
    criticalDefects: 0,
    inspectionResults: { overall: 'conditional' }
  }
];

localStorage.setItem('productionQualityTracking', JSON.stringify(productionQualityTracking));
console.log('✅ Üretim kalite takip verisi oluşturuldu:', productionQualityTracking.length, 'kayıt');

// ✅ ÖZET RAPORU
console.log('\n🎯 TEST VERİSİ OLUŞTURMA TAMAMLANDI!');
console.log('════════════════════════════════════════');
console.log('📊 Oluşturulan Veri Setleri:');
console.log(`   • Kalitesizlik Maliyeti: ${costManagementData.length} kayıt`);
console.log(`   • DÖF ve 8D: ${dofRecords.length} kayıt`);
console.log(`   • Tank Testleri: ${tankLeakTests.length} kayıt`);
console.log(`   • Fan Testleri: ${fanTestRecords.length} kayıt`);
console.log(`   • Tedarikçiler: ${suppliers.length} kayıt`);
console.log(`   • Tedarikçi Uygunsuzluklar: ${supplierNonconformities.length} kayıt`);
console.log(`   • Tedarikçi Hatalar: ${supplierDefects.length} kayıt`);
console.log(`   • Üretim Kalite: ${productionQualityTracking.length} kayıt`);
console.log('\n💡 Şimdi Quality Management sayfasını yenileyin!');
console.log('🔗 http://localhost:3000/quality-management');
console.log('════════════════════════════════════════'); 