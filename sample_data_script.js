// ✅ Tedarikçi Kalite Yönetimi - Örnek Veriler
// Bu kodu browser console'da çalıştır: F12 -> Console -> Yapıştır -> Enter

const mockSuppliers = [
  {
    id: 'SUP001',
    name: 'MetalTech Sanayi A.Ş.',
    taxNumber: '1234567890',
    contact: {
      email: 'info@metaltech.com',
      phone: '+90 212 555 0001',
      address: 'İstanbul, Türkiye',
      contactPerson: 'Mehmet Yılmaz',
    },
    supplyType: 'hammadde',
    status: 'onaylı',
    isActive: true,
    registrationDate: '2024-01-15',
    lastEvaluationDate: '2025-01-15',
    currentScore: 87,
    riskLevel: 'düşük',
    certifications: ['ISO 9001', 'ISO 14001', 'OHSAS 18001'],
    performanceMetrics: {
      totalOrders: 45,
      onTimeDeliveryRate: 89,
      lateDeliveries: 5,
      averageDeliveryTime: 5.2,
      monthlyTrend: [
        { month: 'Oca', deliveryScore: 85, qualityScore: 88, totalScore: 87 },
        { month: 'Şub', deliveryScore: 87, qualityScore: 85, totalScore: 86 },
        { month: 'Mar', deliveryScore: 91, qualityScore: 92, totalScore: 92 },
      ]
    },
    qualityMetrics: {
      totalDeliveredQty: 15420,
      nonConformingQty: 89,
      nonConformanceRate: 0.58,
      totalDOFs: 3,
      totalComplaints: 1,
      qualityScore: 88,
      monthlyTrend: [
        { month: 'Oca', deliveryScore: 85, qualityScore: 88, totalScore: 87 },
        { month: 'Şub', deliveryScore: 87, qualityScore: 85, totalScore: 86 },
        { month: 'Mar', deliveryScore: 91, qualityScore: 92, totalScore: 92 },
      ]
    },
    alternativeSupplierIds: ['SUP003'],
    category: 'stratejik',
    contractInfo: {
      contractNumber: 'CTR-2023-001',
      startDate: '2023-01-01',
      endDate: '2024-12-31',
      contractValue: 2500000,
      paymentTerms: '30 gün',
      deliveryTerms: 'FOB İstanbul',
      status: 'aktif'
    },
    auditInfo: {
      lastAuditDate: '2023-06-15',
      nextAuditDate: '2024-06-15',
      auditScore: 87,
      auditStatus: 'planlandı',
      auditType: 'yıllık',
      findings: [],
      correctedFindings: 2,
      totalFindings: 4
    },
    monthlyOrders: [
      {
        month: 'Şubat',
        year: 2025,
        orderCount: 8,
        totalValue: 450000,
        onTimeDeliveries: 7,
        lateDeliveries: 1,
        averageDeliveryDays: 5.2,
        orders: [
          {
            orderId: 'ORD-2025-001',
            orderDate: '2025-02-05',
            requestedDate: '2025-02-10',
            actualDeliveryDate: '2025-02-10',
            deliveryStatus: 'teslim_edildi',
            orderValue: 75000,
            itemCount: 150,
            description: 'Çelik profil malzeme'
          }
        ]
      }
    ]
  },
  {
    id: 'SUP002',
    name: 'KaliteParts Ltd.',
    taxNumber: '0987654321',
    contact: {
      email: 'kalite@parts.com',
      phone: '+90 232 555 0002',
      address: 'İzmir, Türkiye',
      contactPerson: 'Ayşe Kaya',
    },
    supplyType: 'yan_sanayi',
    status: 'onaylı',
    isActive: true,
    registrationDate: '2023-08-20',
    lastEvaluationDate: '2025-01-10',
    currentScore: 76,
    riskLevel: 'orta',
    certifications: ['ISO 9001', 'TS 16949'],
    performanceMetrics: {
      totalOrders: 32,
      onTimeDeliveryRate: 78,
      lateDeliveries: 7,
      averageDeliveryTime: 6.8,
      monthlyTrend: [
        { month: 'Oca', deliveryScore: 75, qualityScore: 78, totalScore: 77 },
        { month: 'Şub', deliveryScore: 76, qualityScore: 74, totalScore: 75 },
        { month: 'Mar', deliveryScore: 77, qualityScore: 76, totalScore: 76 },
      ]
    },
    qualityMetrics: {
      totalDeliveredQty: 8750,
      nonConformingQty: 175,
      nonConformanceRate: 2.0,
      totalDOFs: 5,
      totalComplaints: 3,
      qualityScore: 75,
      monthlyTrend: [
        { month: 'Oca', deliveryScore: 75, qualityScore: 78, totalScore: 77 },
        { month: 'Şub', deliveryScore: 76, qualityScore: 74, totalScore: 75 },
        { month: 'Mar', deliveryScore: 77, qualityScore: 76, totalScore: 76 },
      ]
    },
    alternativeSupplierIds: ['SUP003'],
    category: 'kritik',
    contractInfo: {
      contractNumber: 'CTR-2022-005',
      startDate: '2022-08-20',
      endDate: '2024-08-20',
      contractValue: 1800000,
      paymentTerms: '45 gün',
      deliveryTerms: 'CIF İzmir',
      status: 'aktif'
    },
    auditInfo: {
      lastAuditDate: '2023-08-15',
      nextAuditDate: '2024-08-15',
      auditScore: 76,
      auditStatus: 'planlandı',
      auditType: 'yıllık',
      findings: [],
      correctedFindings: 1,
      totalFindings: 3
    },
    monthlyOrders: [
      {
        month: 'Şubat',
        year: 2025,
        orderCount: 5,
        totalValue: 280000,
        onTimeDeliveries: 4,
        lateDeliveries: 1,
        averageDeliveryDays: 6.8,
        orders: []
      }
    ]
  },
  {
    id: 'SUP003',
    name: 'ElektroTech A.Ş.',
    taxNumber: '1122334455',
    contact: {
      email: 'info@elektrotech.com',
      phone: '+90 312 555 0003',
      address: 'Ankara, Türkiye',
      contactPerson: 'Can Özkan',
    },
    supplyType: 'yan_sanayi',
    status: 'alternatif',
    isActive: true,
    registrationDate: '2024-06-10',
    lastEvaluationDate: '2025-01-05',
    currentScore: 82,
    riskLevel: 'düşük',
    certifications: ['ISO 9001', 'CE'],
    isAlternative: true,
    primarySupplierId: 'SUP002',
    performanceMetrics: {
      totalOrders: 12,
      onTimeDeliveryRate: 85,
      lateDeliveries: 2,
      averageDeliveryTime: 4.8,
      monthlyTrend: [
        { month: 'Oca', deliveryScore: 80, qualityScore: 85, totalScore: 82 },
        { month: 'Şub', deliveryScore: 82, qualityScore: 83, totalScore: 83 },
        { month: 'Mar', deliveryScore: 84, qualityScore: 86, totalScore: 85 },
      ]
    },
    qualityMetrics: {
      totalDeliveredQty: 3200,
      nonConformingQty: 32,
      nonConformanceRate: 1.0,
      totalDOFs: 1,
      totalComplaints: 0,
      qualityScore: 85,
      monthlyTrend: [
        { month: 'Oca', deliveryScore: 80, qualityScore: 85, totalScore: 82 },
        { month: 'Şub', deliveryScore: 82, qualityScore: 83, totalScore: 83 },
        { month: 'Mar', deliveryScore: 84, qualityScore: 86, totalScore: 85 },
      ]
    },
    category: 'rutin',
    contractInfo: {
      contractNumber: 'CTR-2023-012',
      startDate: '2023-06-10',
      endDate: '2025-06-10',
      contractValue: 950000,
      paymentTerms: '30 gün',
      deliveryTerms: 'EXW Ankara',
      status: 'aktif'
    },
    auditInfo: {
      lastAuditDate: '2023-12-20',
      nextAuditDate: '2024-12-20',
      auditScore: 82,
      auditStatus: 'tamamlandı',
      auditType: 'yıllık',
      findings: [],
      correctedFindings: 1,
      totalFindings: 1
    },
    monthlyOrders: [
      {
        month: 'Şubat',
        year: 2025,
        orderCount: 3,
        totalValue: 125000,
        onTimeDeliveries: 3,
        lateDeliveries: 0,
        averageDeliveryDays: 4.8,
        orders: []
      }
    ]
  },
  {
    id: 'SUP004',
    name: 'TestTech Ürün Değerlendirme Ltd.',
    taxNumber: '5566778899',
    contact: {
      email: 'degerlendirme@testtech.com',
      phone: '+90 216 555 0004',
      address: 'İstanbul, Türkiye',
      contactPerson: 'Zeynep Demir',
    },
    supplyType: 'hizmet',
    status: 'değerlendirmede',
    isActive: false,
    registrationDate: '2025-01-20',
    lastEvaluationDate: '2025-02-25',
    currentScore: 65,
    riskLevel: 'orta',
    certifications: ['ISO 9001'],
    performanceMetrics: {
      totalOrders: 3,
      onTimeDeliveryRate: 67,
      lateDeliveries: 1,
      averageDeliveryTime: 8.2,
      monthlyTrend: [
        { month: 'Oca', deliveryScore: 60, qualityScore: 70, totalScore: 65 },
        { month: 'Şub', deliveryScore: 65, qualityScore: 68, totalScore: 67 },
        { month: 'Mar', deliveryScore: 70, qualityScore: 72, totalScore: 71 },
      ]
    },
    qualityMetrics: {
      totalDeliveredQty: 850,
      nonConformingQty: 25,
      nonConformanceRate: 2.9,
      totalDOFs: 2,
      totalComplaints: 1,
      qualityScore: 70,
      monthlyTrend: [
        { month: 'Oca', deliveryScore: 60, qualityScore: 70, totalScore: 65 },
        { month: 'Şub', deliveryScore: 65, qualityScore: 68, totalScore: 67 },
        { month: 'Mar', deliveryScore: 70, qualityScore: 72, totalScore: 71 },
      ]
    },
    category: 'genel',
    contractInfo: {
      contractNumber: 'CTR-2024-003',
      startDate: '2024-01-20',
      endDate: '2025-01-20',
      contractValue: 650000,
      paymentTerms: '60 gün',
      deliveryTerms: 'DDP İstanbul',
      status: 'yenilenecek'
    },
    auditInfo: {
      lastAuditDate: '2024-01-25',
      nextAuditDate: '2025-01-25',
      auditScore: 65,
      auditStatus: 'devam_ediyor',
      auditType: 'özel',
      findings: [],
      correctedFindings: 0,
      totalFindings: 2
    },
    monthlyOrders: [
      {
        month: 'Şubat',
        year: 2025,
        orderCount: 2,
        totalValue: 85000,
        onTimeDeliveries: 1,
        lateDeliveries: 1,
        averageDeliveryDays: 8.2,
        orders: []
      }
    ]
  },
  {
    id: 'SUP005',
    name: 'ProKalite Makina Ltd.',
    taxNumber: '2233445566',
    contact: {
      email: 'info@prokalite.com',
      phone: '+90 224 555 0005',
      address: 'Bursa, Türkiye',
      contactPerson: 'Ahmet Şahin',
    },
    supplyType: 'yan_sanayi',
    status: 'onaylı',
    isActive: true,
    registrationDate: '2024-03-15',
    lastEvaluationDate: '2025-01-30',
    currentScore: 91,
    riskLevel: 'düşük',
    certifications: ['ISO 9001', 'ISO 14001', 'TS 16949'],
    performanceMetrics: {
      totalOrders: 28,
      onTimeDeliveryRate: 95,
      lateDeliveries: 1,
      averageDeliveryTime: 3.8,
      monthlyTrend: [
        { month: 'Ara', deliveryScore: 92, qualityScore: 90, totalScore: 91 },
        { month: 'Oca', deliveryScore: 94, qualityScore: 93, totalScore: 93 },
        { month: 'Şub', deliveryScore: 96, qualityScore: 95, totalScore: 95 },
      ]
    },
    qualityMetrics: {
      totalDeliveredQty: 12500,
      nonConformingQty: 45,
      nonConformanceRate: 0.36,
      totalDOFs: 1,
      totalComplaints: 0,
      qualityScore: 93,
      monthlyTrend: [
        { month: 'Ara', deliveryScore: 92, qualityScore: 90, totalScore: 91 },
        { month: 'Oca', deliveryScore: 94, qualityScore: 93, totalScore: 93 },
        { month: 'Şub', deliveryScore: 96, qualityScore: 95, totalScore: 95 },
      ]
    },
    alternativeSupplierIds: ['SUP006', 'SUP007'],
    category: 'stratejik',
    contractInfo: {
      contractNumber: 'CTR-2024-015',
      startDate: '2024-03-15',
      endDate: '2026-03-15',
      contractValue: 3200000,
      paymentTerms: '30 gün',
      deliveryTerms: 'FOB Bursa',
      status: 'aktif'
    },
    auditInfo: {
      lastAuditDate: '2024-09-15',
      nextAuditDate: '2025-09-15',
      auditScore: 91,
      auditStatus: 'planlandı',
      auditType: 'yıllık',
      findings: [],
      correctedFindings: 1,
      totalFindings: 1
    },
    monthlyOrders: [
      {
        month: 'Şubat',
        year: 2025,
        orderCount: 12,
        totalValue: 650000,
        onTimeDeliveries: 12,
        lateDeliveries: 0,
        averageDeliveryDays: 3.8,
        orders: []
      }
    ]
  },
  {
    id: 'SUP006',
    name: 'YeniTech Alternatif A.Ş.',
    taxNumber: '3344556677',
    contact: {
      email: 'alternativ@yenitech.com',
      phone: '+90 262 555 0006',
      address: 'Kocaeli, Türkiye',
      contactPerson: 'Fatma Özdemir',
    },
    supplyType: 'yan_sanayi',
    status: 'alternatif',
    isActive: true,
    registrationDate: '2024-08-01',
    lastEvaluationDate: '2025-02-01',
    currentScore: 78,
    riskLevel: 'orta',
    certifications: ['ISO 9001'],
    isAlternative: true,
    primarySupplierId: 'SUP005',
    performanceMetrics: {
      totalOrders: 8,
      onTimeDeliveryRate: 87,
      lateDeliveries: 1,
      averageDeliveryTime: 4.2,
      monthlyTrend: [
        { month: 'Ara', deliveryScore: 75, qualityScore: 78, totalScore: 77 },
        { month: 'Oca', deliveryScore: 78, qualityScore: 80, totalScore: 79 },
        { month: 'Şub', deliveryScore: 80, qualityScore: 82, totalScore: 81 },
      ]
    },
    qualityMetrics: {
      totalDeliveredQty: 2850,
      nonConformingQty: 57,
      nonConformanceRate: 2.0,
      totalDOFs: 2,
      totalComplaints: 1,
      qualityScore: 78,
      monthlyTrend: [
        { month: 'Ara', deliveryScore: 75, qualityScore: 78, totalScore: 77 },
        { month: 'Oca', deliveryScore: 78, qualityScore: 80, totalScore: 79 },
        { month: 'Şub', deliveryScore: 80, qualityScore: 82, totalScore: 81 },
      ]
    },
    category: 'rutin',
    contractInfo: {
      contractNumber: 'CTR-2024-028',
      startDate: '2024-08-01',
      endDate: '2025-08-01',
      contractValue: 850000,
      paymentTerms: '45 gün',
      deliveryTerms: 'CIF Kocaeli',
      status: 'aktif'
    },
    auditInfo: {
      lastAuditDate: '2024-12-15',
      nextAuditDate: '2025-12-15',
      auditScore: 78,
      auditStatus: 'planlandı',
      auditType: 'yıllık',
      findings: [],
      correctedFindings: 0,
      totalFindings: 2
    },
    monthlyOrders: [
      {
        month: 'Şubat',
        year: 2025,
        orderCount: 3,
        totalValue: 185000,
        onTimeDeliveries: 2,
        lateDeliveries: 1,
        averageDeliveryDays: 4.2,
        orders: []
      }
    ]
  },
  {
    id: 'SUP007',
    name: 'MegaSupply Lojistik Ltd.',
    taxNumber: '4455667788',
    contact: {
      email: 'mega@supply.com',
      phone: '+90 232 555 0007',
      address: 'İzmir, Türkiye',
      contactPerson: 'Osman Kılıç',
    },
    supplyType: 'lojistik',
    status: 'alternatif',
    isActive: true,
    registrationDate: '2024-11-10',
    lastEvaluationDate: '2025-02-15',
    currentScore: 85,
    riskLevel: 'düşük',
    certifications: ['ISO 9001', 'ISO 14001'],
    isAlternative: true,
    primarySupplierId: 'SUP005',
    performanceMetrics: {
      totalOrders: 15,
      onTimeDeliveryRate: 93,
      lateDeliveries: 1,
      averageDeliveryTime: 2.5,
      monthlyTrend: [
        { month: 'Ara', deliveryScore: 88, qualityScore: 85, totalScore: 87 },
        { month: 'Oca', deliveryScore: 90, qualityScore: 87, totalScore: 89 },
        { month: 'Şub', deliveryScore: 92, qualityScore: 88, totalScore: 90 },
      ]
    },
    qualityMetrics: {
      totalDeliveredQty: 8500,
      nonConformingQty: 68,
      nonConformanceRate: 0.8,
      totalDOFs: 1,
      totalComplaints: 0,
      qualityScore: 88,
      monthlyTrend: [
        { month: 'Ara', deliveryScore: 88, qualityScore: 85, totalScore: 87 },
        { month: 'Oca', deliveryScore: 90, qualityScore: 87, totalScore: 89 },
        { month: 'Şub', deliveryScore: 92, qualityScore: 88, totalScore: 90 },
      ]
    },
    category: 'kritik',
    contractInfo: {
      contractNumber: 'CTR-2024-035',
      startDate: '2024-11-10',
      endDate: '2025-11-10',
      contractValue: 1250000,
      paymentTerms: '30 gün',
      deliveryTerms: 'DDP İzmir',
      status: 'aktif'
    },
    auditInfo: {
      lastAuditDate: '2025-01-20',
      nextAuditDate: '2026-01-20',
      auditScore: 85,
      auditStatus: 'tamamlandı',
      auditType: 'yıllık',
      findings: [],
      correctedFindings: 1,
      totalFindings: 1
    },
    monthlyOrders: [
      {
        month: 'Şubat',
        year: 2025,
        orderCount: 6,
        totalValue: 320000,
        onTimeDeliveries: 6,
        lateDeliveries: 0,
        averageDeliveryDays: 2.5,
        orders: []
      }
    ]
  }
];

const mockDOFs = [
  {
    id: 'DOF001',
    supplierId: 'SUP001',
    dofNumber: 'DOF-2025-001',
    title: 'Malzeme Boyut Uygunsuzluğu',
    description: 'Teslim edilen parçaların ölçüleri tolerans dışında',
    severity: 'major',
    status: 'yanıt_bekliyor',
    createdDate: '2025-02-20',
    dueDate: '2025-02-27',
    responseTime: undefined,
    isAutoNotified: true,
  },
  {
    id: 'DOF002',
    supplierId: 'SUP002',
    dofNumber: 'DOF-2025-002',
    title: 'Yüzey Kalitesi Sorunu',
    description: 'Boyalı yüzeylerde kabarcık ve çizik tespit edildi',
    severity: 'kritik',
    status: 'açık',
    createdDate: '2025-02-22',
    dueDate: '2025-02-25',
    responseTime: undefined,
    isAutoNotified: true,
  },
  {
    id: 'DOF003',
    supplierId: 'SUP003',
    dofNumber: 'DOF-2025-003',
    title: 'Teslimat Gecikmesi',
    description: 'Planlanan teslimat tarihinden 5 gün gecikme',
    severity: 'minor',
    status: 'kapatıldı',
    createdDate: '2025-02-15',
    dueDate: '2025-02-22',
    closedDate: '2025-02-21',
    responseTime: 6,
    rootCause: 'Hammadde tedarik sorunu',
    correctiveAction: 'Alternatif hammadde tedarikçisi bulundu',
    preventiveAction: 'Çift kaynak stratejisi uygulandı',
    isAutoNotified: true,
  },
  {
    id: 'DOF004',
    supplierId: 'SUP004',
    dofNumber: 'DOF-2025-004',
    title: 'Hizmet Kalitesi Eksikliği',
    description: 'Test raporlarında eksik bilgiler tespit edildi',
    severity: 'major',
    status: 'açık',
    createdDate: '2025-02-23',
    dueDate: '2025-03-01',
    responseTime: undefined,
    isAutoNotified: true,
  },
  {
    id: 'DOF005',
    supplierId: 'SUP002',
    dofNumber: 'DOF-2025-005',
    title: 'Sertifika Eksikliği',
    description: 'Malzeme sertifikası teslim edilmedi',
    severity: 'major',
    status: 'yanıt_bekliyor',
    createdDate: '2025-02-23',
    dueDate: '2025-03-02',
    responseTime: undefined,
    isAutoNotified: true,
  },
];

// ✅ Verileri localStorage'a kaydet
localStorage.setItem('suppliers', JSON.stringify(mockSuppliers));
localStorage.setItem('supplierDOFRecords', JSON.stringify(mockDOFs));

// ✅ Başarı mesajı
console.log('🎉 TEDARİKÇİ KALİTE YÖNETİMİ - ÖRNEK VERİLER YÜKLENDİ!');
console.log('📊 Yüklenen veriler:');
console.log(`   • ${mockSuppliers.length} Tedarikçi`);
console.log(`   • ${mockDOFs.length} DÖF Kaydı`);
console.log(`   • ${mockSuppliers.filter(s => s.status === 'onaylı').length} Onaylı Tedarikçi`);
console.log(`   • ${mockSuppliers.filter(s => s.status === 'alternatif').length} Alternatif Tedarikçi`);
console.log(`   • ${mockSuppliers.filter(s => s.status === 'değerlendirmede').length} Değerlendirmede`);
console.log(`   • ${mockDOFs.filter(d => d.status === 'açık' || d.status === 'yanıt_bekliyor').length} Açık DÖF`);
console.log('🔄 Sayfayı yenileyin veya modüle tekrar gidin!');

// ✅ Otomatik sayfa yenileme (opsiyonel)
// window.location.reload(); 