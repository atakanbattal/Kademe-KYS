// ============================================
// ULTIMATE PDF KALICILIK TEST SİSTEMİ V3.0
// ============================================
// Bu script PDF dosyalarının online modda kalıcı olup olmadığını test eder
// Kullanım: Browser console'a kopyalayıp çalıştırın

console.log('🚀 ULTIMATE PDF KALICILIK TEST SİSTEMİ V3.0 BAŞLATIYOR...');

// 🔍 1. DOCUMENT MANAGEMENT TEST FONKSİYONLARI
const testDocumentManagementPDFs = () => {
  console.log('\n📄 DOCUMENT MANAGEMENT PDF TEST BAŞLADI');
  
  try {
    // localStorage verilerini kontrol et
    const dmDocs = localStorage.getItem('dm-documents');
    const dmBackup = localStorage.getItem('dm-documents-backup');
    const dmGeneral = localStorage.getItem('documentManagementData');
    
    console.log('🔍 Storage Keys Kontrol:');
    console.log('  - dm-documents:', dmDocs ? 'VAR' : 'YOK');
    console.log('  - dm-documents-backup:', dmBackup ? 'VAR' : 'YOK');
    console.log('  - documentManagementData:', dmGeneral ? 'VAR' : 'YOK');
    
    if (!dmDocs) {
      console.log('❌ DM: Hiç belge bulunamadı!');
      return { status: 'FAIL', reason: 'No documents found' };
    }
    
    const parsedDocs = JSON.parse(dmDocs);
    console.log('📊 DM: Toplam belge sayısı:', parsedDocs.length);
    
    // PDF'li belgeleri kontrol et
    const docsWithPDF = parsedDocs.filter(doc => doc.pdfFile && doc.pdfFileName);
    console.log('📄 DM: PDF\'li belge sayısı:', docsWithPDF.length);
    
    if (docsWithPDF.length === 0) {
      console.log('⚠️ DM: PDF\'li belge bulunamadı!');
      return { status: 'WARNING', reason: 'No PDFs found' };
    }
    
    // Her PDF'nin bütünlüğünü kontrol et
    docsWithPDF.forEach((doc, index) => {
      console.log(`📄 DM PDF ${index + 1}:`, {
        name: doc.name,
        fileName: doc.pdfFileName,
        size: doc.pdfSize ? (doc.pdfSize / 1024).toFixed(2) + ' KB' : 'N/A',
        hasBase64: doc.pdfFile ? 'VAR (' + doc.pdfFile.length + ' chars)' : 'YOK'
      });
      
      // Base64 format kontrolü
      if (doc.pdfFile && !doc.pdfFile.startsWith('data:application/pdf;base64,')) {
        console.log('❌ DM: PDF format hatası!', doc.name);
      }
    });
    
    console.log('✅ DM: PDF test tamamlandı');
    return { status: 'SUCCESS', count: docsWithPDF.length };
    
  } catch (error) {
    console.error('❌ DM PDF test hatası:', error);
    return { status: 'ERROR', error: error.message };
  }
};

// 🔍 2. SUPPLIER QUALITY MANAGEMENT TEST FONKSİYONLARI
const testSupplierQualityPDFs = () => {
  console.log('\n🏭 SUPPLIER QUALITY MANAGEMENT PDF TEST BAŞLADI');
  
  try {
    // localStorage verilerini kontrol et
    const audits = localStorage.getItem('supplier-audits');
    const auditsBackup = localStorage.getItem('supplier-audits-backup');
    const auditsEmergency = localStorage.getItem('supplier-audits-emergency');
    
    console.log('🔍 Storage Keys Kontrol:');
    console.log('  - supplier-audits:', audits ? 'VAR' : 'YOK');
    console.log('  - supplier-audits-backup:', auditsBackup ? 'VAR' : 'YOK');
    console.log('  - supplier-audits-emergency:', auditsEmergency ? 'VAR' : 'YOK');
    
    if (!audits) {
      console.log('❌ SQM: Hiç denetim kaydı bulunamadı!');
      return { status: 'FAIL', reason: 'No audits found' };
    }
    
    const parsedAudits = JSON.parse(audits);
    console.log('📊 SQM: Toplam denetim sayısı:', parsedAudits.length);
    
    // Attachment'lı denetimleri kontrol et
    let totalAttachments = 0;
    let totalPDFs = 0;
    
    parsedAudits.forEach((audit, auditIndex) => {
      if (audit.attachments && audit.attachments.length > 0) {
        console.log(`🗂️ SQM Audit ${auditIndex + 1}:`, {
          auditId: audit.id,
          attachmentCount: audit.attachments.length
        });
        
        audit.attachments.forEach((attachment, attachIndex) => {
          totalAttachments++;
          
          console.log(`  📎 Attachment ${attachIndex + 1}:`, {
            name: attachment.name,
            type: attachment.type,
            size: attachment.size ? (attachment.size / 1024).toFixed(2) + ' KB' : 'N/A',
            hasUrl: attachment.url ? 'VAR (' + attachment.url.length + ' chars)' : 'YOK'
          });
          
          // PDF kontrolü
          if (attachment.type === 'application/pdf' || attachment.name.toLowerCase().endsWith('.pdf')) {
            totalPDFs++;
            
            // Base64 format kontrolü
            if (attachment.url && !attachment.url.startsWith('data:application/pdf;base64,')) {
              console.log('❌ SQM: PDF format hatası!', attachment.name);
            }
          }
        });
      }
    });
    
    console.log('📊 SQM: Toplam attachment sayısı:', totalAttachments);
    console.log('📄 SQM: Toplam PDF sayısı:', totalPDFs);
    
    if (totalPDFs === 0) {
      console.log('⚠️ SQM: PDF bulunamadı!');
      return { status: 'WARNING', reason: 'No PDFs found' };
    }
    
    console.log('✅ SQM: PDF test tamamlandı');
    return { status: 'SUCCESS', count: totalPDFs };
    
  } catch (error) {
    console.error('❌ SQM PDF test hatası:', error);
    return { status: 'ERROR', error: error.message };
  }
};

// 🔍 3. LOCALSTORAGE GENEL SAĞLIK KONTROLÜ
const checkLocalStorageHealth = () => {
  console.log('\n💾 LOCALSTORAGE SAĞLIK KONTROLÜ');
  
  try {
    let totalSize = 0;
    let keyCount = 0;
    const relevantKeys = [];
    
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        keyCount++;
        const value = localStorage[key];
        totalSize += value.length;
        
        // PDF sistemleri ile ilgili anahtarları belirle
        if (key.includes('documents') || key.includes('audits') || key.includes('supplier')) {
          relevantKeys.push({
            key: key,
            size: (value.length / 1024).toFixed(2) + ' KB',
            itemCount: value.startsWith('[') ? JSON.parse(value).length : 'N/A'
          });
        }
      }
    }
    
    console.log('📊 localStorage Özeti:');
    console.log('  - Toplam anahtar sayısı:', keyCount);
    console.log('  - Toplam boyut:', (totalSize / 1024 / 1024).toFixed(2), 'MB');
    console.log('  - Kapasite kullanımı:', ((totalSize / (5 * 1024 * 1024)) * 100).toFixed(2) + '%');
    
    console.log('\n📋 İlgili Anahtarlar:');
    relevantKeys.forEach(item => {
      console.log(`  - ${item.key}: ${item.size} (${item.itemCount} items)`);
    });
    
    if (totalSize > 4 * 1024 * 1024) { // 4MB
      console.log('⚠️ localStorage kapasitesi %80 doldu!');
      return { status: 'WARNING', usage: (totalSize / (5 * 1024 * 1024)) * 100 };
    }
    
    console.log('✅ localStorage sağlık kontrolü tamamlandı');
    return { status: 'SUCCESS', usage: (totalSize / (5 * 1024 * 1024)) * 100 };
    
  } catch (error) {
    console.error('❌ localStorage sağlık kontrolü hatası:', error);
    return { status: 'ERROR', error: error.message };
  }
};

// 🔍 4. SAYFA YENİLEME DAYANIKLILIK TESTİ
const testPageRefreshPersistence = () => {
  console.log('\n🔄 SAYFA YENİLEME DAYANIKLILIK TESTİ');
  
  // Mevcut durumu kaydet
  const beforeRefresh = {
    dmDocs: localStorage.getItem('dm-documents'),
    audits: localStorage.getItem('supplier-audits'),
    timestamp: Date.now()
  };
  
  console.log('📊 Yenileme öncesi durum:');
  console.log('  - DM Docs:', beforeRefresh.dmDocs ? JSON.parse(beforeRefresh.dmDocs).length + ' docs' : 'YOK');
  console.log('  - Audits:', beforeRefresh.audits ? JSON.parse(beforeRefresh.audits).length + ' audits' : 'YOK');
  
  // Test verilerini localStorage'a kaydet
  localStorage.setItem('pdf-persistence-test-before', JSON.stringify(beforeRefresh));
  
  console.log('⚡ Manuel sayfa yenileme gerekli!');
  console.log('📝 Yenileme sonrası bu scripti tekrar çalıştırın:');
  console.log('    testPageRefreshResult()');
  
  return { status: 'PENDING', message: 'Manual page refresh required' };
};

// 🔍 5. SAYFA YENİLEME SONUCU TEST FONKSİYONU
const testPageRefreshResult = () => {
  console.log('\n🔄 SAYFA YENİLEME SONUÇ TESTİ');
  
  try {
    const beforeData = localStorage.getItem('pdf-persistence-test-before');
    if (!beforeData) {
      console.log('❌ Yenileme öncesi test verisi bulunamadı!');
      return { status: 'ERROR', reason: 'No before data found' };
    }
    
    const before = JSON.parse(beforeData);
    const after = {
      dmDocs: localStorage.getItem('dm-documents'),
      audits: localStorage.getItem('supplier-audits'),
      timestamp: Date.now()
    };
    
    console.log('📊 Karşılaştırma:');
    console.log('ÖNCE:');
    console.log('  - DM Docs:', before.dmDocs ? JSON.parse(before.dmDocs).length + ' docs' : 'YOK');
    console.log('  - Audits:', before.audits ? JSON.parse(before.audits).length + ' audits' : 'YOK');
    console.log('SONRA:');
    console.log('  - DM Docs:', after.dmDocs ? JSON.parse(after.dmDocs).length + ' docs' : 'YOK');
    console.log('  - Audits:', after.audits ? JSON.parse(after.audits).length + ' audits' : 'YOK');
    
    // Karşılaştır
    const dmDocsMatch = before.dmDocs === after.dmDocs;
    const auditsMatch = before.audits === after.audits;
    
    console.log('\n✅ SONUÇLAR:');
    console.log('  - DM Docs kalıcı:', dmDocsMatch ? '✅ EVET' : '❌ HAYIR');
    console.log('  - Audits kalıcı:', auditsMatch ? '✅ EVET' : '❌ HAYIR');
    
    if (dmDocsMatch && auditsMatch) {
      console.log('🎉 TÜM PDF\'LER KALICI - TEST BAŞARILI!');
      return { status: 'SUCCESS', persistent: true };
    } else {
      console.log('⚠️ BAZI PDF\'LER KAYBOLDU - TEST BAŞARISIZ!');
      return { status: 'FAIL', persistent: false };
    }
    
  } catch (error) {
    console.error('❌ Sayfa yenileme sonuç test hatası:', error);
    return { status: 'ERROR', error: error.message };
  } finally {
    // Test verilerini temizle
    localStorage.removeItem('pdf-persistence-test-before');
  }
};

// 🎯 6. KOMPLET TEST SUITE
const runCompletePDFTest = () => {
  console.log('🚀='.repeat(60));
  console.log('🎯 ULTIMATE PDF KALICILIK TEST SUITE V3.0');
  console.log('🚀='.repeat(60));
  
  const results = {
    documentManagement: testDocumentManagementPDFs(),
    supplierQuality: testSupplierQualityPDFs(),
    localStorageHealth: checkLocalStorageHealth(),
    timestamp: new Date().toISOString()
  };
  
  console.log('\n🏁 TEST SONUÇLARI:');
  console.log('='.repeat(50));
  console.log('📄 Document Management:', results.documentManagement.status);
  console.log('🏭 Supplier Quality:', results.supplierQuality.status);
  console.log('💾 localStorage Sağlığı:', results.localStorageHealth.status);
  console.log('='.repeat(50));
  
  // Genel durum
  const allSuccess = Object.values(results).every(result => 
    result.status === 'SUCCESS' || result.status === 'WARNING'
  );
  
  if (allSuccess) {
    console.log('🎉 TÜM TESTLER BAŞARILI! PDF\'LER KORUNIYOR!');
  } else {
    console.log('⚠️ BAZI TESTLER BAŞARISIZ! PDF KORUMA PROBLEMİ VAR!');
  }
  
  console.log('\n📋 Detaylı sonuçlar için:\n  - testDocumentManagementPDFs()\n  - testSupplierQualityPDFs()\n  - checkLocalStorageHealth()');
  console.log('\n🔄 Sayfa yenileme testi için:\n  - testPageRefreshPersistence() -> yenile -> testPageRefreshResult()');
  
  return results;
};

// Global'e ekle
window.testDocumentManagementPDFs = testDocumentManagementPDFs;
window.testSupplierQualityPDFs = testSupplierQualityPDFs;
window.checkLocalStorageHealth = checkLocalStorageHealth;
window.testPageRefreshPersistence = testPageRefreshPersistence;
window.testPageRefreshResult = testPageRefreshResult;
window.runCompletePDFTest = runCompletePDFTest;

console.log('✅ ULTIMATE PDF TEST SİSTEMİ YÜKLENDİ!');
console.log('🎯 Başlamak için: runCompletePDFTest()'); 