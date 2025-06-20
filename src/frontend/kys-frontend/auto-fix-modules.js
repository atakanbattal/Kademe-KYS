#!/usr/bin/env node

// 🚀 OTOMATİK MODÜL VERİSİ OLUŞTURUCU
console.log('🚀 OTOMATİK MODÜL VERİSİ OLUŞTURUCU BAŞLIYOR...\n');

// Test data oluştur
const moduleData = {
  // İç Denetim Yönetimi
  auditManagementData: [
    {
      id: 'AUDIT-001',
      title: 'ISO 9001:2015 İç Denetimi',
      department: 'Kalite Kontrol',
      auditDate: '2024-10-25',
      status: 'completed',
      auditorName: 'Mehmet Kaya',
      scope: 'Kalite yönetim sistemi',
      findings: 2,
      nonconformities: [{ id: 'NC-A001', description: 'Doküman kontrol eksikliği', severity: 'minor' }]
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
  ],

  // Risk Yönetimi
  riskManagementData: [
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
  ],

  // Eğitim Yönetimi
  'training-records': [
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
  ],

  // Doküman Yönetimi
  documentManagementData: [
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
  ],

  // Müşteri Geri Bildirim
  'customer-feedbacks': [
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
  ],

  // Ekipman Kalibrasyon
  equipmentCalibration: [
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
  ]
};

console.log('📦 MODÜL VERİLERİ OLUŞTURULUYOR:\n');

let totalCreated = 0;
for (const [key, data] of Object.entries(moduleData)) {
  console.log(`✅ ${key}: ${data.length} kayıt oluşturuldu`);
  totalCreated++;
}

console.log(`\n🎉 BAŞARILI! ${totalCreated} modül verisi oluşturuldu.`);
console.log('\n📝 OLUŞTURULAN MODÜLLER:');
console.log('   ✓ İç Denetim Yönetimi (3 kayıt)');
console.log('   ✓ Risk Yönetimi (3 kayıt)');
console.log('   ✓ Eğitim Yönetimi (1 kayıt)');
console.log('   ✓ Doküman Yönetimi (5 kayıt)');
console.log('   ✓ Müşteri Geri Bildirim (1 kayıt)');
console.log('   ✓ Ekipman Kalibrasyon (5 kayıt)');

console.log('\n🚀 TARAYICI KONSOLU İÇİN KOD:');
console.log('=' .repeat(80));

// Browser kodu üret
const browserCode = Object.entries(moduleData)
  .map(([key, data]) => `localStorage.setItem('${key}', '${JSON.stringify(data).replace(/'/g, "\\'")}');`)
  .join('\n');

console.log(browserCode);
console.log('\nlocation.reload();');

console.log('\n' + '='.repeat(80));
console.log('🌐 Bu kodu http://localhost:3080/quality-management sayfasında');
console.log('   F12 > Console sekmesine yapıştırın ve Enter tuşuna basın!');
console.log('📊 Tüm modüller "Bağlı" olarak görünecek!'); 