// ✅ MODÜL VERİ ENTEGRASYON SİSTEMİ
// Bu sistem tüm modüllerin merkezi veri sistemi ile senkronizasyonunu sağlar

import { dataSyncManager } from './DataSyncManager';

// ✅ MODÜL VERİ ENTEGRATÖRÜ
class ModuleDataIntegrator {
  private static instance: ModuleDataIntegrator;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): ModuleDataIntegrator {
    if (!ModuleDataIntegrator.instance) {
      ModuleDataIntegrator.instance = new ModuleDataIntegrator();
    }
    return ModuleDataIntegrator.instance;
  }

  // ✅ TÜM MODÜLLERLE ENTEGRASYON
  public initializeAllModules(): void {
    if (this.isInitialized) {
      console.log('📊 Modül entegrasyonu zaten tamamlanmış');
      return;
    }

    console.log('🚀 MERKEZI VERİ SİSTEMİ ENTEGRASYONU BAŞLADI...');

    try {
      // 1. Dashboard modülü entegrasyonu
      this.integrateDashboard();
      
      // 2. DÖF/8D modülü entegrasyonu
      this.integrateDOF8D();
      
      // 3. Tedarikçi modülleri entegrasyonu
      this.integrateSupplierModules();
      
      // 4. KPI modülü entegrasyonu
      this.integrateKPI();
      
      // 5. Kalite maliyet modülü entegrasyonu
      this.integrateQualityCost();
      
      // 6. Araç kalite modülü entegrasyonu
      this.integrateVehicleQuality();
      
      // 7. Denetim modülleri entegrasyonu
      this.integrateAuditModules();

      this.isInitialized = true;
      
      console.log('✅ TÜM MODÜLLER MERKEZI VERİ SİSTEMİNE ENTEGRE EDİLDİ!');
      console.log('📊 Entegrasyon özeti:', dataSyncManager.getDebugInfo());
      
    } catch (error) {
      console.error('❌ Modül entegrasyonu hatası:', error);
    }
  }

  // ✅ DASHBOARD ENTEGRASYONU
  private integrateDashboard(): void {
    console.log('📊 Dashboard modülü entegre ediliyor...');
    
    // Dashboard'daki tüm KPI kartları merkezi sistemden çekecek
    const dashboardData = {
      dofData: dataSyncManager.getDOFData(),
      supplierData: dataSyncManager.getSupplierData(),
      qualityCostData: dataSyncManager.getQualityCostData(),
      vehicleData: dataSyncManager.getVehicleQualityData(),
      auditData: dataSyncManager.getAuditData()
    };

    // localStorage'a entegre edilmiş verileri kaydet
    localStorage.setItem('dashboardIntegratedData', JSON.stringify(dashboardData));
    
    console.log('✅ Dashboard entegrasyonu tamamlandı');
  }

  // ✅ DÖF/8D ENTEGRASYONU
  private integrateDOF8D(): void {
    console.log('📝 DÖF/8D modülü entegre ediliyor...');
    
    const dofData = dataSyncManager.getDOFData();
    
    // Mevcut DÖF kayıtlarını temizle ve merkezi verilerle değiştir
    localStorage.removeItem('dofRecords');
    localStorage.setItem('dofRecords', JSON.stringify(dofData.records));
    
    // DÖF özet bilgilerini kaydet
    localStorage.setItem('dofSummary', JSON.stringify({
      total: dofData.total,
      open: dofData.open,
      closed: dofData.closed,
      overdue: dofData.overdue,
      closureRate: dofData.closureRate,
      averageClosureTime: dofData.averageClosureTime
    }));
    
    console.log('✅ DÖF/8D entegrasyonu tamamlandı');
  }

  // ✅ TEDARİKÇİ MODÜLÜ ENTEGRASYONU
  private integrateSupplierModules(): void {
    console.log('🏭 Tedarikçi modülleri entegre ediliyor...');
    
    const supplierData = dataSyncManager.getSupplierData();
    
    // Tedarikçi kayıtlarını güncel verilerle değiştir
    localStorage.removeItem('suppliers');
    localStorage.removeItem('supplierQualityManagementData');
    localStorage.removeItem('supplierAuditManagementData');
    
    localStorage.setItem('suppliers', JSON.stringify(supplierData.records));
    localStorage.setItem('supplierSummary', JSON.stringify({
      total: supplierData.total,
      approved: supplierData.approved,
      alternative: supplierData.alternative,
      evaluation: supplierData.evaluation,
      avgRating: supplierData.avgRating,
      rejectionRate: supplierData.rejectionRate
    }));
    
    console.log('✅ Tedarikçi modülleri entegrasyonu tamamlandı');
  }

  // ✅ KPI ENTEGRASYONU
  private integrateKPI(): void {
    console.log('📈 KPI modülü entegre ediliyor...');
    
    // KPI hesaplamaları için merkezi veri kaynaklarını ayarla
    const allData = dataSyncManager.getAllData();
    
    localStorage.setItem('kpiDataSources', JSON.stringify({
      dofData: allData.dof,
      supplierData: allData.suppliers,
      qualityCostData: allData.qualityCost,
      vehicleData: allData.vehicleQuality,
      auditData: allData.audits,
      lastSync: allData.performance.lastUpdate
    }));
    
    console.log('✅ KPI entegrasyonu tamamlandı');
  }

  // ✅ KALİTE MALİYET ENTEGRASYONU
  private integrateQualityCost(): void {
    console.log('💰 Kalite maliyet modülü entegre ediliyor...');
    
    const qualityCostData = dataSyncManager.getQualityCostData();
    
    localStorage.removeItem('qualityCostRecords');
    localStorage.setItem('qualityCostRecords', JSON.stringify(qualityCostData.records));
    localStorage.setItem('qualityCostSummary', JSON.stringify({
      totalCost: qualityCostData.totalCost,
      reworkCost: qualityCostData.reworkCost,
      scrapCost: qualityCostData.scrapCost,
      wasteCost: qualityCostData.wasteCost,
      costRatio: qualityCostData.costRatio
    }));
    
    console.log('✅ Kalite maliyet entegrasyonu tamamlandı');
  }

  // ✅ ARAÇ KALİTE ENTEGRASYONU
  private integrateVehicleQuality(): void {
    console.log('🚗 Araç kalite modülü entegre ediliyor...');
    
    const vehicleData = dataSyncManager.getVehicleQualityData();
    
    localStorage.removeItem('vehicleRecords');
    localStorage.setItem('vehicleRecords', JSON.stringify(vehicleData.records));
    localStorage.setItem('vehicleQualitySummary', JSON.stringify({
      totalVehicles: vehicleData.totalVehicles,
      defectiveVehicles: vehicleData.defectiveVehicles,
      defectRate: vehicleData.defectRate,
      inspectionCompliance: vehicleData.inspectionCompliance
    }));
    
    console.log('✅ Araç kalite entegrasyonu tamamlandı');
  }

  // ✅ DENETİM MODÜLÜ ENTEGRASYONU
  private integrateAuditModules(): void {
    console.log('🔍 Denetim modülleri entegre ediliyor...');
    
    const auditData = dataSyncManager.getAuditData();
    
    localStorage.removeItem('auditRecords');
    localStorage.setItem('auditRecords', JSON.stringify(auditData.records));
    localStorage.setItem('auditSummary', JSON.stringify({
      total: auditData.total,
      completed: auditData.completed,
      pending: auditData.pending,
      complianceRate: auditData.complianceRate,
      avgScore: auditData.avgScore
    }));
    
    console.log('✅ Denetim modülleri entegrasyonu tamamlandı');
  }

  // ✅ VERİ SENKRONIZASYONU TETİKLE
  public syncAllData(): void {
    console.log('🔄 Veri senkronizasyonu başlatıldı...');
    
    // Merkezi sistemi güncelle
    dataSyncManager.syncAllModules();
    
    // Tüm modülleri yeniden entegre et
    this.isInitialized = false;
    this.initializeAllModules();
    
    console.log('✅ Veri senkronizasyonu tamamlandı');
  }

  // ✅ ENTEGRASYON DURUMU KONTROLÜ
  public getIntegrationStatus() {
    return {
      isInitialized: this.isInitialized,
      centralDataStatus: dataSyncManager.getDebugInfo(),
      lastSync: new Date().toISOString(),
      modules: {
        dashboard: !!localStorage.getItem('dashboardIntegratedData'),
        dof: !!localStorage.getItem('dofSummary'),
        suppliers: !!localStorage.getItem('supplierSummary'),
        kpi: !!localStorage.getItem('kpiDataSources'),
        qualityCost: !!localStorage.getItem('qualityCostSummary'),
        vehicle: !!localStorage.getItem('vehicleQualitySummary'),
        audit: !!localStorage.getItem('auditSummary')
      }
    };
  }

  // ✅ ENTEGRASYON TEMİZLE
  public resetIntegration(): void {
    console.log('🧹 Entegrasyon temizleniyor...');
    
    // Tüm entegrasyon verilerini temizle
    const integratedKeys = [
      'dashboardIntegratedData',
      'dofSummary',
      'supplierSummary', 
      'kpiDataSources',
      'qualityCostSummary',
      'vehicleQualitySummary',
      'auditSummary'
    ];
    
    integratedKeys.forEach(key => localStorage.removeItem(key));
    
    this.isInitialized = false;
    
    console.log('✅ Entegrasyon temizlendi');
  }
}

// ✅ GLOBAL ERİŞİM
export const moduleDataIntegrator = ModuleDataIntegrator.getInstance();

// ✅ OTOMATİK ENTEGRASYON (Uygulama başladığında çalışır)
export const initializeDataIntegration = () => {
  console.log('🎯 Otomatik veri entegrasyonu başlatılıyor...');
  
  // ✅ DELAYED ASYNC BAŞLAT - UI loading'i engellemeyecek şekilde
  setTimeout(() => {
    try {
      moduleDataIntegrator.initializeAllModules();
      console.log('✅ Veri entegrasyonu tamamlandı');
    } catch (error) {
      console.error('❌ Veri entegrasyonu hatası:', error);
      // Hata durumunda daha uzun süre bekleyip tekrar dene
      setTimeout(() => {
        try {
          console.log('🔄 Veri entegrasyonu yeniden deneniyor...');
          moduleDataIntegrator.initializeAllModules();
        } catch (retryError) {
          console.error('❌ Veri entegrasyonu tekrar denemesi başarısız:', retryError);
        }
      }, 5000);
    }
  }, 1000); // 1 saniye gecikme ile - UI'nin tamamen yüklenmesini bekle
};

// ✅ MANUEL ENTEGRASYON TETİKLEME
export const triggerManualSync = () => {
  console.log('🔄 Manuel senkronizasyon tetiklendi');
  moduleDataIntegrator.syncAllData();
};

// ✅ ENTEGRASYON DURUM RAPORU
export const getIntegrationReport = () => {
  return moduleDataIntegrator.getIntegrationStatus();
};

export default ModuleDataIntegrator; 