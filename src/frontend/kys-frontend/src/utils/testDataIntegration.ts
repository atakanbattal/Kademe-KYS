// ✅ VERİ ENTEGRASYON TEST SİSTEMİ
// Bu dosya veri tutarlılığını test eder

import { dataSyncManager } from './DataSyncManager';
import { moduleDataIntegrator, getIntegrationReport } from './ModuleDataIntegrator';

// ✅ VERİ TUTARLILIğI TEST SİSTEMİ
export const testDataConsistency = () => {
  console.log('🧪 VERİ TUTARLILIĞI TEST EDİLİYOR...');
  
  const results = {
    success: true,
    tests: [] as Array<{name: string, status: 'PASS' | 'FAIL', details: string}>
  };

  // Test 1: Merkezi veri sistemi çalışıyor mu?
  try {
    const debugInfo = dataSyncManager.getDebugInfo();
    results.tests.push({
      name: 'Merkezi Veri Sistemi',
      status: debugInfo.syncStatus === 'synced' ? 'PASS' : 'FAIL',
      details: `Sync Status: ${debugInfo.syncStatus}, Version: ${debugInfo.dataVersion}`
    });
  } catch (error) {
    results.tests.push({
      name: 'Merkezi Veri Sistemi',
      status: 'FAIL',
      details: 'Sistem erişilemiyor: ' + error
    });
    results.success = false;
  }

  // Test 2: DÖF verileri tutarlı mı?
  try {
    const dofData = dataSyncManager.getDOFData();
    const isConsistent = dofData.total === (dofData.open + dofData.closed);
    results.tests.push({
      name: 'DÖF Veri Tutarlılığı',
      status: isConsistent ? 'PASS' : 'FAIL',
      details: `Total: ${dofData.total}, Open: ${dofData.open}, Closed: ${dofData.closed}`
    });
    
    if (!isConsistent) results.success = false;
  } catch (error) {
    results.tests.push({
      name: 'DÖF Veri Tutarlılığı',
      status: 'FAIL',
      details: 'DÖF verileri alınamadı: ' + error
    });
    results.success = false;
  }

  // Test 3: Tedarikçi verileri tutarlı mı?
  try {
    const supplierData = dataSyncManager.getSupplierData();
    const isConsistent = supplierData.total === (supplierData.approved + supplierData.alternative + supplierData.evaluation);
    results.tests.push({
      name: 'Tedarikçi Veri Tutarlılığı',
      status: isConsistent ? 'PASS' : 'FAIL',
      details: `Total: ${supplierData.total}, Approved: ${supplierData.approved}, Alternative: ${supplierData.alternative}, Evaluation: ${supplierData.evaluation}`
    });
    
    if (!isConsistent) results.success = false;
  } catch (error) {
    results.tests.push({
      name: 'Tedarikçi Veri Tutarlılığı',
      status: 'FAIL',
      details: 'Tedarikçi verileri alınamadı: ' + error
    });
    results.success = false;
  }

  // Test 4: Entegrasyon durumu
  try {
    const integrationStatus = getIntegrationReport();
    const modulesIntegrated = Object.values(integrationStatus.modules).filter(Boolean).length;
    const totalModules = Object.keys(integrationStatus.modules).length;
    
    results.tests.push({
      name: 'Modül Entegrasyonu',
      status: integrationStatus.isInitialized ? 'PASS' : 'FAIL',
      details: `${modulesIntegrated}/${totalModules} modül entegre edildi`
    });
    
    if (!integrationStatus.isInitialized) results.success = false;
  } catch (error) {
    results.tests.push({
      name: 'Modül Entegrasyonu',
      status: 'FAIL',
      details: 'Entegrasyon durumu alınamadı: ' + error
    });
    results.success = false;
  }

  // Test sonuçlarını göster
  console.log('📊 VERİ TUTARLILIĞI TEST SONUÇLARI:');
  console.log(`✅ Genel Durum: ${results.success ? 'BAŞARILI' : 'BAŞARISIZ'}`);
  console.log('📋 Test Detayları:');
  
  results.tests.forEach((test, index) => {
    const icon = test.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${index + 1}. ${test.name}: ${test.status}`);
    console.log(`   ${test.details}`);
  });

  return results;
};

// ✅ HIZLI VERİ GÖRÜNTÜLEME
export const showDataSummary = () => {
  console.log('📊 MERKEZI VERİ ÖZETİ:');
  
  try {
    const allData = dataSyncManager.getAllData();
    
    console.log('🔥 DÖF/8D Verileri:', {
      toplam: allData.dof.total,
      açık: allData.dof.open,
      kapalı: allData.dof.closed,
      gecikmiş: allData.dof.overdue,
      kapanmaOranı: allData.dof.closureRate + '%',
      ortalamaSüre: allData.dof.averageClosureTime + ' gün'
    });

    console.log('🏭 Tedarikçi Verileri:', {
      toplam: allData.suppliers.total,
      onaylı: allData.suppliers.approved,
      alternatif: allData.suppliers.alternative,
      değerlendirmede: allData.suppliers.evaluation,
      ortalamaPuan: allData.suppliers.avgRating,
      redOranı: allData.suppliers.rejectionRate + '%'
    });

    console.log('💰 Kalite Maliyet Verileri:', {
      toplamMaliyet: allData.qualityCost.totalCost.toLocaleString('tr-TR') + ' ₺',
      yendenİşlemeMaliyeti: allData.qualityCost.reworkCost.toLocaleString('tr-TR') + ' ₺',
      hurdaMaliyeti: allData.qualityCost.scrapCost.toLocaleString('tr-TR') + ' ₺',
      maliyetOranı: allData.qualityCost.costRatio + '%'
    });

    console.log('🚗 Araç Kalite Verileri:', {
      toplamAraç: allData.vehicleQuality.totalVehicles,
      hatalıAraç: allData.vehicleQuality.defectiveVehicles,
      hataOranı: allData.vehicleQuality.defectRate + '%',
      muayeneUygunluk: allData.vehicleQuality.inspectionCompliance + '%'
    });

    console.log('🔍 Denetim Verileri:', {
      toplamDenetim: allData.audits.total,
      tamamlanan: allData.audits.completed,
      bekleyen: allData.audits.pending,
      uygunlukOranı: allData.audits.complianceRate + '%',
      ortalamaPuan: allData.audits.avgScore
    });

    console.log('⏱️ Performans Bilgileri:', {
      sonGüncelleme: allData.performance.lastUpdate,
      veriSürümü: allData.performance.dataVersion,
      senkronizasyonDurumu: allData.performance.syncStatus
    });

  } catch (error) {
    console.error('❌ Veri özeti alınamadı:', error);
  }
};

// ✅ ENTEGRASYON DURUMUNU GÖSTER
export const showIntegrationStatus = () => {
  console.log('🔧 ENTEGRASYON DURUMU:');
  
  try {
    const status = getIntegrationReport();
    
    console.log(`📊 Başlatma Durumu: ${status.isInitialized ? '✅ Tamamlandı' : '❌ Başlatılmadı'}`);
    console.log(`⏰ Son Sync: ${status.lastSync}`);
    console.log('📦 Modül Durumları:');
    
    Object.entries(status.modules).forEach(([moduleName, isIntegrated]) => {
      const icon = isIntegrated ? '✅' : '❌';
      console.log(`  ${icon} ${moduleName}: ${isIntegrated ? 'Entegre' : 'Entegre Değil'}`);
    });

    console.log('🎯 Merkezi Veri Durumu:', status.centralDataStatus);
    
  } catch (error) {
    console.error('❌ Entegrasyon durumu alınamadı:', error);
  }
};

// ✅ MANUEL SENKRONIZASYON TETİKLE
export const forceDataSync = () => {
  console.log('🔄 MANUEL VERİ SENKRONİZASYONU BAŞLATILIYOR...');
  
  try {
    // Tüm veriyi senkronize et
    moduleDataIntegrator.syncAllData();
    
    console.log('✅ Manuel senkronizasyon tamamlandı');
    
    // Sonucu test et
    setTimeout(() => {
      testDataConsistency();
    }, 1000);
    
  } catch (error) {
    console.error('❌ Manuel senkronizasyon hatası:', error);
  }
};

// ✅ BROWSER CONSOLE İÇİN GLOBAL FONKSIYONLAR
declare global {
  interface Window {
    testDataConsistency: () => any;
    showDataSummary: () => void;
    showIntegrationStatus: () => void;
    forceDataSync: () => void;
  }
}

// Global erişim için window objesine ekle
if (typeof window !== 'undefined') {
  window.testDataConsistency = testDataConsistency;
  window.showDataSummary = showDataSummary;
  window.showIntegrationStatus = showIntegrationStatus;
  window.forceDataSync = forceDataSync;
}

// Export default object
const testDataIntegrationExports = {
  testDataConsistency,
  showDataSummary,
  showIntegrationStatus,
  forceDataSync
};

export default testDataIntegrationExports; 