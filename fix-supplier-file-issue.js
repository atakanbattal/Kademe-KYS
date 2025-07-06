// SupplierQualityManagement modülü dosya yönetimi sorunu çözümü
// Bu script localStorage'daki verileri kontrol eder ve düzeltir

console.log('🔍 Supplier Quality Management - Dosya Sorunu Analizi Başlıyor...');

// localStorage kontrolü
function analyzeLocalStorage() {
  const audits = localStorage.getItem('supplier-audits');
  const auditsBackup = localStorage.getItem('supplier-audits-backup');
  
  console.log('📊 localStorage Analizi:');
  console.log('- supplier-audits:', audits ? 'Mevcut' : 'Yok');
  console.log('- supplier-audits-backup:', auditsBackup ? 'Mevcut' : 'Yok');
  
  if (audits) {
    try {
      const parsed = JSON.parse(audits);
      const auditsWithFiles = parsed.filter(audit => audit.attachments && audit.attachments.length > 0);
      const totalFiles = parsed.reduce((total, audit) => total + (audit.attachments?.length || 0), 0);
      const invalidFiles = parsed
        .flatMap(audit => audit.attachments || [])
        .filter(att => !att.url || !att.url.startsWith('data:'));
        
      console.log('📋 Audit Verisi Analizi:');
      console.log('- Toplam audit:', parsed.length);
      console.log('- Dosyalı audit:', auditsWithFiles.length);
      console.log('- Toplam dosya:', totalFiles);
      console.log('- Bozuk dosya:', invalidFiles.length);
      
      if (invalidFiles.length > 0) {
        console.warn('⚠️ SORUN BULUNDU: Bozuk dosya verileri mevcut');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Audit verisi parse hatası:', error);
      return false;
    }
  }
  
  return true;
}

// localStorage temizleme ve test
function fixLocalStorage() {
  console.log('🔧 localStorage Düzeltme Başlıyor...');
  
  // Mevcut verileri backup'la
  const currentAudits = localStorage.getItem('supplier-audits');
  if (currentAudits) {
    localStorage.setItem('supplier-audits-emergency-backup', currentAudits);
    console.log('💾 Acil durum backup\'ı oluşturuldu');
  }
  
  // Bozuk verileri temizle
  try {
    if (currentAudits) {
      const parsed = JSON.parse(currentAudits);
      
      // Dosya verilerini doğrula ve düzelt
      const fixedAudits = parsed.map(audit => ({
        ...audit,
        attachments: (audit.attachments || []).filter(att => 
          att.url && att.url.startsWith('data:') && att.name && att.type
        )
      }));
      
      // Düzeltilmiş veriyi kaydet
      localStorage.setItem('supplier-audits', JSON.stringify(fixedAudits));
      localStorage.setItem('supplier-audits-backup', JSON.stringify(fixedAudits));
      localStorage.setItem('supplier-audits-timestamp', Date.now().toString());
      
      console.log('✅ localStorage düzeltildi');
      return true;
    }
  } catch (error) {
    console.error('❌ localStorage düzeltme hatası:', error);
    return false;
  }
  
  return true;
}

// Sorun tespiti ve çözümü
const isHealthy = analyzeLocalStorage();
if (!isHealthy) {
  console.log('🔧 Sorun tespit edildi, düzeltme başlıyor...');
  fixLocalStorage();
  
  // Tekrar kontrol et
  const isFixedHealthy = analyzeLocalStorage();
  if (isFixedHealthy) {
    console.log('✅ SORUN ÇÖZÜLDü! Sayfa yenilendi.');
    alert('Dosya sorunu çözüldü! Sayfa yenileniyor...');
    window.location.reload();
  } else {
    console.log('❌ Sorun çözülemedi. Manuel müdahale gerekli.');
    alert('Sorun çözülemedi. Lütfen aşağıdaki adımları uygulayın:\n1. F12 ile Developer Tools açın\n2. Application > Local Storage > localhost\n3. supplier-audits anahtarını silin\n4. Sayfayı yenileyin');
  }
} else {
  console.log('✅ localStorage sağlıklı görünüyor');
  
  // Dosya URL'lerini kontrol et
  const audits = JSON.parse(localStorage.getItem('supplier-audits') || '[]');
  const hasFiles = audits.some(audit => audit.attachments && audit.attachments.length > 0);
  
  if (hasFiles) {
    console.log('📁 Dosyalar mevcut. Görüntüleme sorunu farklı sebeplerden olabilir.');
    console.log('💡 Çözüm önerileri:');
    console.log('1. Tarayıcı popup engelini kontrol edin');
    console.log('2. Tarayıcı cache\'ini temizleyin');
    console.log('3. Farklı tarayıcıda test edin');
  } else {
    console.log('📁 Hiç dosya bulunamadı. Normal durum.');
  }
}

console.log('🎯 Analiz tamamlandı.');
