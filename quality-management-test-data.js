/**
 * 🔧 QUALITY MANAGEMENT MODÜLÜ TEST VERİSİ OLUŞTURMA
 * 
 * Bu script Quality Management modülündeki bağlantısız görünen modüller için
 * localStorage'a test verisi ekler:
 * 
 * - İç Denetim Yönetimi (auditManagementData)
 * - Risk Yönetimi (riskManagementData) 
 * - Eğitim Yönetimi (training-records)
 * - Doküman Yönetimi (documentManagementData)
 * - Müşteri Geri Bildirim (customer-feedbacks)
 * - Ekipman Kalibrasyon (equipmentCalibration)
 */

console.log('🚀 Quality Management Test Verisi Yükleme Başlatılıyor...');

// 1. İç Denetim Yönetimi Test Verisi
const auditManagementData = [
  {
    id: 'AUD-001',
    title: 'ISO 9001:2015 İç Denetimi',
    department: 'Kalite Güvence',
    auditDate: '2024-01-15',
    status: 'completed',
    auditor: 'Ahmet Yılmaz',
    scope: 'Kalite Yönetim Sistemi',
    findings: 5,
    nonconformities: [
      {
        id: 'NC-001',
        description: 'Prosedür güncelliği kontrolü eksik',
        severity: 'minor',
        status: 'closed'
      },
      {
        id: 'NC-002', 
        description: 'Eğitim kayıtları eksik',
        severity: 'major',
        status: 'open'
      }
    ],
    completionRate: 95,
    createdDate: '2024-01-10'
  },
  {
    id: 'AUD-002',
    title: 'Üretim Süreçleri İç Denetimi',
    department: 'Üretim',
    auditDate: '2024-02-20',
    status: 'completed',
    auditor: 'Fatma Özkan',
    scope: 'Üretim Süreçleri',
    findings: 3,
    nonconformities: [
      {
        id: 'NC-003',
        description: 'Makine kalibrasyonu gecikmesi',
        severity: 'major',
        status: 'closed'
      }
    ],
    completionRate: 98,
    createdDate: '2024-02-15'
  },
  {
    id: 'AUD-003',
    title: 'Tedarikçi Değerlendirme Denetimi',
    department: 'Satın Alma',
    auditDate: '2024-03-10',
    status: 'planned',
    auditor: 'Mehmet Demir',
    scope: 'Tedarikçi Yönetimi',
    findings: 0,
    nonconformities: [],
    completionRate: 0,
    createdDate: '2024-03-05'
  }
];

// 2. Risk Yönetimi Test Verisi
const riskManagementData = [
  {
    id: 'RSK-001',
    title: 'Makine Arızası Riski',
    category: 'operational',
    probability: 3,
    impact: 4,
    riskLevel: 'high',
    severity: 'high',
    status: 'mitigated',
    owner: 'Bakım Departmanı',
    description: 'Kritik üretim makinelerinde arıza riski',
    mitigationActions: [
      'Önleyici bakım programı',
      'Yedek parça stoku artırımı'
    ],
    currentRiskScore: 6,
    targetRiskScore: 3,
    lastReviewDate: '2024-01-20',
    createdDate: '2023-12-15'
  },
  {
    id: 'RSK-002',
    title: 'Kalite Uygunsuzluk Riski',
    category: 'quality',
    probability: 2,
    impact: 5,
    riskLevel: 'high',
    severity: 'high',
    status: 'open',
    owner: 'Kalite Kontrol',
    description: 'Müşteri şikayeti ve geri dönüş riski',
    mitigationActions: [
      'Kalite kontrol süreçlerinin güçlendirilmesi',
      'Ek test prosedürleri'
    ],
    currentRiskScore: 10,
    targetRiskScore: 4,
    lastReviewDate: '2024-02-15',
    createdDate: '2024-01-10'
  },
  {
    id: 'RSK-003',
    title: 'Tedarikçi Performans Riski',
    category: 'supply_chain',
    probability: 3,
    impact: 3,
    riskLevel: 'medium',
    severity: 'medium',
    status: 'closed',
    owner: 'Satın Alma',
    description: 'Tedarikçi kalite ve teslimat performansı riski',
    mitigationActions: [
      'Alternatif tedarikçi araştırması',
      'Tedarikçi audit programı'
    ],
    currentRiskScore: 3,
    targetRiskScore: 3,
    lastReviewDate: '2024-03-01',
    createdDate: '2023-11-20'
  }
];

// 3. Eğitim Yönetimi Test Verisi
const trainingRecords = [
  {
    id: 'TRN-001',
    title: 'ISO 9001:2015 Farkındalık Eğitimi',
    participant: 'Tüm Personel',
    department: 'Kalite',
    trainer: 'Dış Eğitmen',
    duration: 8,
    status: 'completed',
    completionDate: '2024-01-25',
    certificateIssued: true,
    hasCertificate: true,
    effectiveness: 85,
    feedback: 'Çok faydalı bir eğitimdi',
    nextTrainingDate: '2025-01-25',
    createdDate: '2024-01-20'
  }
];

// 4. Doküman Yönetimi Test Verisi  
const documentManagementData = [
  {
    id: 'DOC-001',
    title: 'Kalite El Kitabı',
    type: 'handbook',
    version: '3.1',
    status: 'approved',
    department: 'Kalite Güvence',
    approver: 'Kalite Müdürü',
    approvalDate: '2024-01-15',
    expiryDate: '2025-01-15',
    reviewDate: '2024-07-15',
    isControlled: true,
    distributionList: ['Tüm Departmanlar'],
    createdDate: '2024-01-10'
  },
  {
    id: 'DOC-002',
    title: 'Üretim Prosedürü',
    type: 'procedure',
    version: '2.3',
    status: 'approved',
    department: 'Üretim',
    approver: 'Üretim Müdürü',
    approvalDate: '2024-02-10',
    expiryDate: '2025-02-10',
    reviewDate: '2024-08-10',
    isControlled: true,
    distributionList: ['Üretim', 'Kalite'],
    createdDate: '2024-02-05'
  },
  {
    id: 'DOC-003',
    title: 'Kalibrasyon Talimatı',
    type: 'instruction',
    version: '1.2',
    status: 'approved',
    department: 'Kalite Kontrol',
    approver: 'Laboratuvar Şefi',
    approvalDate: '2024-01-20',
    expiryDate: '2025-01-20',
    reviewDate: '2024-07-20',
    isControlled: true,
    distributionList: ['Kalite Kontrol'],
    createdDate: '2024-01-15'
  },
  {
    id: 'DOC-004',
    title: 'İş Güvenliği Politikası',
    type: 'policy',
    version: '4.0',
    status: 'approved',
    department: 'İSG',
    approver: 'Genel Müdür',
    approvalDate: '2024-03-01',
    expiryDate: '2025-03-01',
    reviewDate: '2024-09-01',
    isControlled: true,
    distributionList: ['Tüm Departmanlar'],
    createdDate: '2024-02-25'
  },
  {
    id: 'DOC-005',
    title: 'Satın Alma Prosedürü',
    type: 'procedure',
    version: '3.2',
    status: 'draft',
    department: 'Satın Alma',
    approver: '',
    approvalDate: null,
    expiryDate: null,
    reviewDate: null,
    isControlled: false,
    distributionList: [],
    createdDate: '2024-03-10'
  }
];

// 5. Müşteri Geri Bildirim Test Verisi
const customerFeedbacks = [
  {
    id: 'FB-001',
    customerName: 'ABC Makine A.Ş.',
    type: 'complaint',
    subject: 'Ürün kalite sorunu',
    description: 'Teslim edilen parçalarda boyut sapması tespit edildi',
    priority: 'high',
    status: 'resolved',
    assignedTo: 'Kalite Müdürü',
    reportDate: '2024-02-15',
    resolutionDate: '2024-02-25',
    rating: 2,
    category: 'quality',
    actions: [
      'Kök neden analizi yapıldı',
      'Üretim prosesi güncellendi',
      'Müşteriye yeni parti gönderildi'
    ],
    satisfaction: 85,
    createdDate: '2024-02-15'
  }
];

// 6. Ekipman Kalibrasyon Test Verisi
const equipmentCalibration = [
  {
    id: 'EQ-001',
    name: 'Dijital Kumpas',
    serialNumber: 'DK-2023-001',
    type: 'ölçüm',
    location: 'Kalite Kontrol Lab',
    status: 'calibrated',
    lastCalibrationDate: '2024-01-15',
    nextCalibrationDate: '2024-07-15',
    calibrationInterval: 6,
    calibrationResult: 'başarılı',
    accuracy: '±0.02mm',
    responsible: 'Ali Veli',
    certificateNumber: 'CAL-2024-001',
    vendor: 'Ölçüm Teknolojileri A.Ş.',
    createdDate: '2024-01-10'
  },
  {
    id: 'EQ-002',
    name: 'Hassas Terazi',
    serialNumber: 'HT-2023-002',
    type: 'ölçüm',
    location: 'Laboratuvar',
    status: 'calibrated',
    lastCalibrationDate: '2024-02-01',
    nextCalibrationDate: '2024-08-01',
    calibrationInterval: 6,
    calibrationResult: 'başarılı',
    accuracy: '±0.1g',
    responsible: 'Ayşe Yılmaz',
    certificateNumber: 'CAL-2024-002',
    vendor: 'Ölçüm Teknolojileri A.Ş.',
    createdDate: '2024-01-25'
  },
  {
    id: 'EQ-003',
    name: 'Basınç Göstergesi',
    serialNumber: 'BG-2023-003',
    type: 'kontrol',
    location: 'Üretim Hattı 1',
    status: 'calibrated',
    lastCalibrationDate: '2024-01-20',
    nextCalibrationDate: '2024-07-20',
    calibrationInterval: 6,
    calibrationResult: 'başarılı',
    accuracy: '±1%',
    responsible: 'Mehmet Özkan',
    certificateNumber: 'CAL-2024-003',
    vendor: 'Endüstriyel Ölçüm Ltd.',
    createdDate: '2024-01-15'
  },
  {
    id: 'EQ-004',
    name: 'Sıcaklık Sensörü',
    serialNumber: 'SS-2023-004',
    type: 'kontrol',
    location: 'Fırın Ünitesi',
    status: 'overdue',
    lastCalibrationDate: '2023-06-15',
    nextCalibrationDate: '2023-12-15',
    calibrationInterval: 6,
    calibrationResult: 'başarılı',
    accuracy: '±0.5°C',
    responsible: 'Fatma Demir',
    certificateNumber: 'CAL-2023-004',
    vendor: 'Sıcaklık Sistemleri A.Ş.',
    createdDate: '2023-06-10'
  },
  {
    id: 'EQ-005',
    name: 'Mikrometre',
    serialNumber: 'MM-2024-001',
    type: 'ölçüm',
    location: 'Kalite Kontrol',
    status: 'calibrated',
    lastCalibrationDate: '2024-03-01',
    nextCalibrationDate: '2024-09-01',
    calibrationInterval: 6,
    calibrationResult: 'başarılı',
    accuracy: '±0.001mm',
    responsible: 'Hasan Çelik',
    certificateNumber: 'CAL-2024-005',
    vendor: 'Ölçüm Teknolojileri A.Ş.',
    createdDate: '2024-02-25'
  }
];

// LocalStorage'a veri yükleme
try {
  localStorage.setItem('auditManagementData', JSON.stringify(auditManagementData));
  console.log('✅ İç Denetim Yönetimi verisi yüklendi:', auditManagementData.length, 'kayıt');

  localStorage.setItem('riskManagementData', JSON.stringify(riskManagementData));
  console.log('✅ Risk Yönetimi verisi yüklendi:', riskManagementData.length, 'kayıt');

  localStorage.setItem('training-records', JSON.stringify(trainingRecords));
  console.log('✅ Eğitim Yönetimi verisi yüklendi:', trainingRecords.length, 'kayıt');

  localStorage.setItem('documentManagementData', JSON.stringify(documentManagementData));
  console.log('✅ Doküman Yönetimi verisi yüklendi:', documentManagementData.length, 'kayıt');

  localStorage.setItem('customer-feedbacks', JSON.stringify(customerFeedbacks));
  console.log('✅ Müşteri Geri Bildirim verisi yüklendi:', customerFeedbacks.length, 'kayıt');

  localStorage.setItem('equipmentCalibration', JSON.stringify(equipmentCalibration));
  console.log('✅ Ekipman Kalibrasyon verisi yüklendi:', equipmentCalibration.length, 'kayıt');

  console.log('🎉 TÜM TEST VERİLERİ BAŞARIYLA YÜKLENDİ!');
  console.log('🔄 Şimdi Quality Management sayfasını yenileyin veya tekrar açın.');
  
  // Sayfa yenileme önerisi
  if (confirm('Test verileri yüklendi! Quality Management sayfasını yenilemek ister misiniz?')) {
    window.location.reload();
  }
  
} catch (error) {
  console.error('❌ Test verisi yükleme hatası:', error);
} 