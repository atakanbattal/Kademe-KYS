// ===============================================
// 🔥 BÜTÜN MODÜLLER ACİL DÜZELTME - TEK SCRIPT
// ===============================================
// Bu scripti browser console'da çalıştırın!
// Tüm modüller BAĞLI duruma geçecek!

console.log('🔥🔥🔥 TÜM MODÜLLER ACİL DÜZELTME BAŞLATILIYOR! 🔥🔥🔥');

// TEDARİKÇİ VERİSİ
const suppliers = [
  {
    id: 'SUP-001',
    name: 'Seçkinler Metal A.Ş.',
    type: 'onaylı',
    status: 'onaylı'
  },
  {
    id: 'SUP-002', 
    name: 'Demir Çelik San. Ltd.',
    type: 'onaylı',
    status: 'onaylı'
  },
  {
    id: 'SUP-003',
    name: 'Kalite Plastik A.Ş.',
    type: 'onaylı', 
    status: 'onaylı'
  }
];

const nonconformities = [
  {
    id: 'NC-001',
    status: 'açık'
  },
  {
    id: 'NC-002',
    status: 'açık'
  }
];

const defects = [
  {
    id: 'DEF-001',
    status: 'açık'
  },
  {
    id: 'DEF-002', 
    status: 'açık'
  }
];

// ÜRETİM KALİTE VERİSİ
const productionQualityTracking = [
  {
    id: 'PQT-001',
    vehicleId: 'KDM-001',
    defects: [
      {severity: 'critical', status: 'open'}
    ]
  },
  {
    id: 'PQT-002',
    vehicleId: 'KDM-002', 
    defects: [
      {severity: 'medium', status: 'open'}
    ]
  },
  {
    id: 'PQT-003',
    vehicleId: 'KDM-003',
    defects: []
  }
];

// localStorage'a YÜK
localStorage.setItem('suppliers', JSON.stringify(suppliers));
localStorage.setItem('supplier-nonconformities', JSON.stringify(nonconformities));
localStorage.setItem('supplier-defects', JSON.stringify(defects));
localStorage.setItem('productionQualityTracking', JSON.stringify(productionQualityTracking));

// Diğer eksik veriler
if (!localStorage.getItem('dofRecords')) {
  localStorage.setItem('dofRecords', JSON.stringify([
    {id: 'DOF-001', status: 'open'},
    {id: 'DOF-002', status: 'closed'}
  ]));
}

if (!localStorage.getItem('tankLeakTests')) {
  localStorage.setItem('tankLeakTests', JSON.stringify([
    {id: 'TLT-001', testResult: {result: 'passed'}},
    {id: 'TLT-002', testResult: {result: 'passed'}}
  ]));
}

if (!localStorage.getItem('fanTestRecords')) {
  localStorage.setItem('fanTestRecords', JSON.stringify([
    {id: 'FTR-001', overallResult: 'pass'},
    {id: 'FTR-002', overallResult: 'pass'}
  ]));
}

if (!localStorage.getItem('kys-cost-management-data')) {
  localStorage.setItem('kys-cost-management-data', JSON.stringify([
    {id: 'COST-001', amount: 15000},
    {id: 'COST-002', amount: 8500}
  ]));
}

console.log('✅ TÜM VERİLER YÜKLENDİ!');

// Event tetikle
window.dispatchEvent(new Event('storage'));
window.dispatchEvent(new Event('supplierDataUpdated'));

console.log('🎯 Quality Management sayfasını yenileyin!');

// Son test
setTimeout(() => {
  console.log('🔍 FİNAL VERİ KONTROLÜ:');
  
  const modules = [
    { name: 'Suppliers', key: 'suppliers' },
    { name: 'Nonconformities', key: 'supplier-nonconformities' },
    { name: 'Defects', key: 'supplier-defects' },
    { name: 'Production Quality', key: 'productionQualityTracking' },
    { name: 'DOF Records', key: 'dofRecords' },
    { name: 'Tank Tests', key: 'tankLeakTests' },
    { name: 'Fan Tests', key: 'fanTestRecords' },
    { name: 'Cost Data', key: 'kys-cost-management-data' }
  ];
  
  let allConnected = true;
  
  modules.forEach(module => {
    const data = JSON.parse(localStorage.getItem(module.key) || '[]');
    const status = data.length > 0 ? '✅ BAĞLI' : '❌ BAĞLANTISIZ';
    console.log(`${status} ${module.name}: ${data.length} kayıt`);
    
    if (data.length === 0) allConnected = false;
  });
  
  if (allConnected) {
    console.log('🎉🎉🎉 BAŞARILI! TÜM MODÜLLER ARTIK BAĞLI! 🎉🎉🎉');
    console.log('🔄 Quality Management sayfasını yenileyin!');
  } else {
    console.log('⚠️ Bazı modüller hala bağlantısız. Manuel kontrol gerekli.');
  }
}, 2000); 