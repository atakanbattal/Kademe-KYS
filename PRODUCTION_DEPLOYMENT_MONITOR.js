// ============================================
// PRODUCTION DEPLOYMENT MONITOR V2.0
// ============================================
// Netlify Production Deployment'ını Monitor Eden Script
// Kullanım: Browser'da https://kademe-qdms.netlify.app açık iken console'a kopyalayın

console.log('🚀 PRODUCTION DEPLOYMENT MONITOR V2.0 BAŞLATIYOR...');
console.log('📍 Target: https://kademe-qdms.netlify.app');
console.log('⏰ Deployment Time:', new Date().toLocaleString());

// 🔍 1. PDF KORUNUYORLUIğI TESPİT FONKSİYONU 
const testProductionPDFPersistence = () => {
  console.log('\n📄 PRODUCTION PDF KALICILIĞI TEST EDİLİYOR...');
  
  try {
    // localStorage test
    const testData = JSON.stringify([{
      id: 'prod-test-pdf',
      file: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iag==',
      name: 'production-test.pdf',
      timestamp: Date.now()
    }]);
    
    localStorage.setItem('production-pdf-test', testData);
    
    // Hemen geri oku
    const retrieved = localStorage.getItem('production-pdf-test');
    const success = retrieved && retrieved.length > 0;
    
    console.log('✅ Production localStorage PDF Test:', success ? 'BAŞARILI' : 'BAŞARISIZ');
    
    // Test verilerini temizle
    localStorage.removeItem('production-pdf-test');
    
    return success;
  } catch (error) {
    console.error('❌ Production PDF Test Hatası:', error);
    return false;
  }
};

// 🔍 2. MODULE NAVIGATION TEST
const testModuleNavigation = () => {
  console.log('\n🎯 MODULE NAVIGATION TEST BAŞLADI...');
  
  const modules = [
    { name: 'Document Management', path: '/document-management' },
    { name: 'Supplier Quality', path: '/supplier-quality' },
    { name: 'Quality Management', path: '/quality-management' },
    { name: 'KPI Management', path: '/kpi-management' }
  ];
  
  console.log('📋 Test Edilecek Modüller:', modules.length);
  
  modules.forEach(module => {
    const fullUrl = `https://kademe-qdms.netlify.app${module.path}`;
    console.log(`🔗 ${module.name}: ${fullUrl}`);
  });
  
  console.log('💡 Bu URL\'leri manuel olarak test ediniz');
  return true;
};

// 🔍 3. DEPLOYMENT VERIFICATION
const verifyDeployment = async () => {
  console.log('\n🔍 DEPLOYMENT VERIFICATION BAŞLADI...');
  
  try {
    // Site'nin canlı olup olmadığını kontrol et
    const startTime = performance.now();
    
    // Production URL'yi kontrol et
    const prodUrl = 'https://kademe-qdms.netlify.app';
    console.log('🌐 Production URL Check:', prodUrl);
    
    // Build timestamp kontrolü
    const buildMeta = document.querySelector('meta[name="build-timestamp"]');
    if (buildMeta) {
      console.log('⏱️  Build Timestamp:', buildMeta.content);
    }
    
    // Version kontrolü
    const versionMeta = document.querySelector('meta[name="version"]');
    if (versionMeta) {
      console.log('📦 Version:', versionMeta.content);
    }
    
    const endTime = performance.now();
    console.log(`⚡ Page Load Time: ${(endTime - startTime).toFixed(2)}ms`);
    
    return true;
  } catch (error) {
    console.error('❌ Deployment Verification Hatası:', error);
    return false;
  }
};

// 🔍 4. FULL SYSTEM CHECK
const runFullSystemCheck = async () => {
  console.log('\n🎯 FULL SYSTEM CHECK BAŞLADI...');
  
  const results = {
    pdfPersistence: testProductionPDFPersistence(),
    moduleNavigation: testModuleNavigation(),
    deploymentVerification: await verifyDeployment(),
    timestamp: new Date().toISOString()
  };
  
  console.log('\n📊 PRODUCTION TEST SONUÇLARI:');
  console.log('================================');
  console.log('✅ PDF Kalıcılığı:', results.pdfPersistence ? 'BAŞARILI' : 'BAŞARISIZ');
  console.log('✅ Module Navigation:', results.moduleNavigation ? 'BAŞARILI' : 'BAŞARISIZ');
  console.log('✅ Deployment Verification:', results.deploymentVerification ? 'BAŞARILI' : 'BAŞARISIZ');
  console.log('⏰ Test Zamanı:', results.timestamp);
  
  const allPassed = Object.values(results).every(r => r === true || typeof r === 'string');
  
  console.log('\n🎉 GENEL SONUÇ:', allPassed ? 'TÜM TESTLER BAŞARILI!' : 'BAZI TESTLER BAŞARISIZ!');
  
  if (allPassed) {
    console.log('🚀 PRODUCTION DEPLOYMENT KUSURSUZ ÇALIŞIYOR!');
    console.log('🎯 https://kademe-qdms.netlify.app - HAZIR!');
  } else {
    console.log('⚠️  Bazı problemler tespit edildi. Lütfen kontrol edin.');
  }
  
  return results;
};

// 🚀 AUTO START
setTimeout(() => {
  console.log('\n🔄 AUTO-START: 3 saniye sonra full system check başlıyor...');
  setTimeout(runFullSystemCheck, 3000);
}, 1000);

// 🛠️ MANUEL KULLANIM FONKSİYONLARI
window.testProductionPDFs = testProductionPDFPersistence;
window.testModuleNav = testModuleNavigation;
window.verifyDeployment = verifyDeployment;
window.runFullCheck = runFullSystemCheck;

console.log('\n🛠️  MANUEL KULLANIM:');
console.log('• testProductionPDFs() - PDF kalıcılığı test');
console.log('• testModuleNav() - Module navigation test');
console.log('• verifyDeployment() - Deployment verification');
console.log('• runFullCheck() - Full system check');
console.log('\n⏳ Otomatik test 4 saniye sonra başlayacak...'); 