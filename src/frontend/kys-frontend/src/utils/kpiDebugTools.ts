// KPI Debug Araçları

// Tüm localStorage verilerini göster
export const showAllLocalStorageData = () => {
  console.log('🔍 Tüm localStorage Verileri:');
  console.log('================================');
  
  Object.keys(localStorage).forEach(key => {
    const value = localStorage.getItem(key);
    if (!value) return;
    
    try {
      const parsed = JSON.parse(value);
      console.log(`\n📌 ${key}:`);
      console.log(`   Kayıt Sayısı: ${Array.isArray(parsed) ? parsed.length : 'Array değil'}`);
      
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log('   İlk kayıt:', parsed[0]);
      }
    } catch {
      console.log(`\n📌 ${key}: ${value.substring(0, 100)}...`);
    }
  });
  console.log('\n================================');
};

// KPI ile ilgili localStorage verilerini temizle
export const clearKPIData = () => {
  console.log('🗑️ KPI verileri temizleniyor...');
  
  const kpiKeys = [
    'dofRecords',
    'qualityCostRecords',
    'vehicleRecords',
    'supplierRecords',
    'vehicleQualityRecords',
    'supplierQualityRecords'
  ];
  
  kpiKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`   ✅ ${key} temizlendi`);
    }
  });
  
  console.log('✅ KPI verileri temizlendi. Sayfayı yenileyin.');
};

// Gerçek veri simülasyonu oluştur
export const createRealisticKPIData = () => {
  console.log('📝 Gerçekçi KPI verileri oluşturuluyor...');
  
  // Gerçekçi DÖF kayıtları
  const realisticDofRecords = [
    // Kapalı kayıtlar - farklı sürelerle
    { id: 'DOF-2024-001', status: 'closed', createdDate: '2024-01-05T09:00:00Z', closedDate: '2024-01-18T16:00:00Z', dueDate: '2024-01-20T23:59:59Z', category: 'quality', severity: 'high' },
    { id: 'DOF-2024-002', status: 'closed', createdDate: '2024-01-10T10:30:00Z', closedDate: '2024-01-25T14:00:00Z', dueDate: '2024-01-30T23:59:59Z', category: 'production', severity: 'medium' },
    { id: 'DOF-2024-003', status: 'closed', createdDate: '2024-01-15T08:00:00Z', closedDate: '2024-01-28T17:30:00Z', dueDate: '2024-02-01T23:59:59Z', category: 'delivery', severity: 'low' },
    { id: 'DOF-2024-004', status: 'closed', createdDate: '2024-01-20T11:00:00Z', closedDate: '2024-02-05T15:00:00Z', dueDate: '2024-02-10T23:59:59Z', category: 'quality', severity: 'high' },
    { id: 'DOF-2024-005', status: 'closed', createdDate: '2024-01-25T09:30:00Z', closedDate: '2024-02-08T16:30:00Z', dueDate: '2024-02-15T23:59:59Z', category: 'process', severity: 'medium' },
    // Açık kayıtlar
    { id: 'DOF-2024-006', status: 'open', createdDate: '2024-02-28T10:00:00Z', dueDate: '2024-03-15T23:59:59Z', category: 'quality', severity: 'high' },
    { id: 'DOF-2024-007', status: 'open', createdDate: '2024-03-01T14:00:00Z', dueDate: '2024-03-20T23:59:59Z', category: 'production', severity: 'medium' },
    { id: 'DOF-2024-008', status: 'open', createdDate: '2024-03-05T08:30:00Z', dueDate: '2024-02-25T23:59:59Z', category: 'delivery', severity: 'high' }, // Gecikmiş
  ];
  
  // Gerçekçi maliyet kayıtları
  const realisticCostRecords = [
    { id: 'QC-2024-001', date: '2024-01-15', productCode: 'P-001', reworkCost: 12500, scrapCost: 8200, wasteCost: 3400, department: 'Montaj' },
    { id: 'QC-2024-002', date: '2024-01-22', productCode: 'P-002', reworkCost: 18900, scrapCost: 15600, wasteCost: 5200, department: 'Kaynak' },
    { id: 'QC-2024-003', date: '2024-02-05', productCode: 'P-003', reworkCost: 25300, scrapCost: 19800, wasteCost: 7100, department: 'Boya' },
    { id: 'QC-2024-004', date: '2024-02-12', productCode: 'P-001', reworkCost: 14700, scrapCost: 11200, wasteCost: 4300, department: 'Montaj' },
    { id: 'QC-2024-005', date: '2024-02-20', productCode: 'P-004', reworkCost: 31200, scrapCost: 24500, wasteCost: 9800, department: 'Kalıp' },
    { id: 'QC-2024-006', date: '2024-02-28', productCode: 'P-002', reworkCost: 22100, scrapCost: 17300, wasteCost: 6500, department: 'Kaynak' },
    { id: 'QC-2024-007', date: '2024-03-05', productCode: 'P-005', reworkCost: 28900, scrapCost: 21700, wasteCost: 8200, department: 'CNC' }
  ];
  
  // Gerçekçi araç kayıtları
  const realisticVehicleRecords = Array.from({ length: 120 }, (_, i) => ({
    id: `VQT-2024-${(i + 1).toString().padStart(3, '0')}`,
    chassisNo: `WDB${Math.random().toString(36).substring(2, 15).toUpperCase()}`,
    model: ['Model A', 'Model B', 'Model C'][Math.floor(Math.random() * 3)],
    productionDate: new Date(2024, 0, 1 + i).toISOString(),
    status: i < 4 ? 'rejected' : 'approved', // ~3.3% hata
    inspectionStatus: i < 115 ? 'completed' : 'pending', // ~95.8% tamamlanmış
    defects: i < 4 ? [
      { type: 'paint_defect', severity: 'minor', location: 'front_door' },
      { type: 'assembly_issue', severity: 'major', location: 'dashboard' }
    ][Math.floor(Math.random() * 2)] : [],
    inspector: `Inspector-${Math.floor(Math.random() * 5) + 1}`
  }));
  
  // Gerçekçi tedarikçi kayıtları
  const realisticSupplierRecords = [
    { id: 'SUP-001', name: 'ABC Otomotiv A.Ş.', status: 'approved', qualificationStatus: 'qualified', overallRating: 4.8, category: 'critical', lastAuditDate: '2024-01-15', deliveries: [{ id: 'DEL-001', status: 'accepted', qualityScore: 98 }] },
    { id: 'SUP-002', name: 'DEF Plastik San.', status: 'approved', qualificationStatus: 'qualified', overallRating: 4.5, category: 'important', lastAuditDate: '2024-01-20', deliveries: [{ id: 'DEL-002', status: 'accepted', qualityScore: 95 }] },
    { id: 'SUP-003', name: 'GHI Metal İşleme', status: 'approved', qualificationStatus: 'qualified', overallRating: 4.2, category: 'critical', lastAuditDate: '2024-01-25', deliveries: [{ id: 'DEL-003', status: 'accepted', qualityScore: 92 }] },
    { id: 'SUP-004', name: 'JKL Elektronik Ltd.', status: 'approved', qualificationStatus: 'qualified', overallRating: 4.6, category: 'important', lastAuditDate: '2024-02-01', deliveries: [{ id: 'DEL-004', status: 'accepted', qualityScore: 96 }] },
    { id: 'SUP-005', name: 'MNO Kauçuk A.Ş.', status: 'approved', qualificationStatus: 'qualified', overallRating: 3.9, category: 'standard', lastAuditDate: '2024-02-05', deliveries: [{ id: 'DEL-005', status: 'rejected', qualityScore: 78, rejectionReason: 'Boyut uyumsuzluğu' }] },
    { id: 'SUP-006', name: 'PQR Cam Sanayi', status: 'approved', qualificationStatus: 'qualified', overallRating: 4.7, category: 'critical', lastAuditDate: '2024-02-10', deliveries: [{ id: 'DEL-006', status: 'accepted', qualityScore: 97 }] },
    { id: 'SUP-007', name: 'STU Boya Kimya', status: 'pending', qualificationStatus: 'under_review', overallRating: 3.5, category: 'standard', lastAuditDate: '2024-02-15', deliveries: [{ id: 'DEL-007', status: 'conditionally_accepted', qualityScore: 85 }] },
    { id: 'SUP-008', name: 'VWX Döküm Ltd.', status: 'approved', qualificationStatus: 'qualified', overallRating: 4.4, category: 'important', lastAuditDate: '2024-02-20', deliveries: [{ id: 'DEL-008', status: 'accepted', qualityScore: 94 }] },
    { id: 'SUP-009', name: 'YZA Tekstil San.', status: 'suspended', qualificationStatus: 'disqualified', overallRating: 2.8, category: 'standard', lastAuditDate: '2024-02-25', deliveries: [{ id: 'DEL-009', status: 'rejected', qualityScore: 65, rejectionReason: 'Kalite standartlarını karşılamıyor' }] },
    { id: 'SUP-010', name: 'BCD Civata A.Ş.', status: 'approved', qualificationStatus: 'qualified', overallRating: 4.3, category: 'standard', lastAuditDate: '2024-03-01', deliveries: [{ id: 'DEL-010', status: 'accepted', qualityScore: 93 }] }
  ];
  
  localStorage.setItem('dofRecords', JSON.stringify(realisticDofRecords));
  localStorage.setItem('qualityCostRecords', JSON.stringify(realisticCostRecords));
  localStorage.setItem('vehicleRecords', JSON.stringify(realisticVehicleRecords));
  localStorage.setItem('supplierRecords', JSON.stringify(realisticSupplierRecords));
  
  console.log('✅ Gerçekçi KPI verileri oluşturuldu!');
  console.log('📊 Özet:');
  console.log(`   - DÖF Kayıtları: ${realisticDofRecords.length} adet`);
  console.log(`   - Maliyet Kayıtları: ${realisticCostRecords.length} adet`);
  console.log(`   - Araç Kayıtları: ${realisticVehicleRecords.length} adet`);
  console.log(`   - Tedarikçi Kayıtları: ${realisticSupplierRecords.length} adet`);
  console.log('\n💡 Sayfayı yenileyerek yeni verileri görebilirsiniz.');
};

// Window objesine ekle (browser console'dan erişim için)
if (typeof window !== 'undefined') {
  (window as any).KPIDebug = {
    showAllData: showAllLocalStorageData,
    clearData: clearKPIData,
    createRealisticData: createRealisticKPIData
  };
  
  console.log('🛠️ KPI Debug Araçları Yüklendi!');
  console.log('Kullanım:');
  console.log('  - KPIDebug.showAllData() → Tüm verileri göster');
  console.log('  - KPIDebug.clearData() → KPI verilerini temizle');
  console.log('  - KPIDebug.createRealisticData() → Gerçekçi veri oluştur');
} 