// Context7 - KULLANICI TALEBİ: SAMPLE DATA ASLA YÜKLENMESİN - GÜÇLÜ TEMİZLİK SİSTEMİ
// Bu dosya artık örnek veri üretmek yerine KALICI TEMİZLİK yapar

// TAMAMEN BOŞ SAMPLE DATA - HİÇBİR ÖRNEK VERİ YOK
export const sampleDOFRecords = [
  // KULLANICI TALEBİ: HİÇBİR SAMPLE DATA YÜKLENMEYECEk
];

// Context7 - KULLANICI KORUMA: SADECE KESİN SAMPLE DATA TEMİZLİK - GERÇEk VERİ KORUMA
export function addSampleDOFRecordsToLocalStorage() {
  try {
    console.log('🛡️ Context7 - KORUMALI Sample Data Temizlik başlatılıyor...');
    
    // 1. Mevcut localStorage'daki SADECE kesin sample data'ları temizle
    const existingData = localStorage.getItem('dofRecords');
    if (existingData) {
      const parsedData = JSON.parse(existingData);
      console.log(`📊 Context7 - ${parsedData.length} kayıt kontrol ediliyor...`);
      
      // KULLANICI KORUMA: Sadece kesin sample data'ları temizle
      const cleanData = parsedData.filter(record => {
        // SADECE ÇOK SPESİFİK VE KESİN SAMPLE DATA TESPİTİ
        const isDefinitelySampleData = 
          // Sadece metadata flag'li kayıtlar
          (record.metadata && (
            record.metadata.cleanupDate ||
            record.metadata.cleanupVersion ||
            record.metadata.isSampleData === true ||
            record.metadata.isTestData === true
          )) ||
          
          // Sadece kesin test ID'leri
          record.id?.includes('SAMPLE') ||
          record.id?.includes('TEST') ||
          record.id?.includes('EXAMPLE') ||
          record.id?.includes('DEMO') ||
          
          // Sadece test user'ları (tam eşleşme)
          record.responsible === 'Test User' ||
          record.responsible === 'Sample User' ||
          record.responsible === 'Demo User';
        
        if (isDefinitelySampleData) {
          console.log('🗑️ Context7 - Kesin sample data silindi:', record.id);
          return false;
        }
        
        // KULLANICI KORUMA: Gerçek verileri koru
        console.log('🛡️ Context7 - Gerçek kullanıcı verisi korundu:', record.id);
        return true;
      });
      
      const removedCount = parsedData.length - cleanData.length;
      if (removedCount > 0) {
        localStorage.setItem('dofRecords', JSON.stringify(cleanData));
        console.log(`✅ Context7 - ${removedCount} kesin sample data temizlendi`);
        console.log(`🛡️ Context7 - ${cleanData.length} gerçek kullanıcı kaydı korundu`);
      } else {
        console.log('✅ Context7 - Sample data bulunamadı, tüm veriler gerçek kullanıcı verisi');
      }
    } else {
      console.log('📝 Context7 - localStorage boş');
    }
    
    // 2. Diğer sample data key'lerini de temizle
    const keysToClean = [
      'sampleDataLoaded',
      'dofSampleDataAdded', 
      'sampleDOFRecords',
      'testDOFRecords',
      'exampleDOFRecords'
    ];
    
    keysToClean.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`🗑️ Context7 - Sample data key silindi: ${key}`);
      }
    });
    
    console.log('🚫 Context7 - SAMPLE DATA ASLA YÜKLENMEYECEK - TEMİZLİK TAMAMLANDI');
    return true;
    
  } catch (error) {
    console.error('❌ Context7 - Sample data temizlik hatası:', error);
    return false;
  }
}

// Context7 - Bu fonksiyon da sample data yüklemek yerine temizlik yapar
export const loadSampleData = () => {
  console.log('🚫 Context7 - loadSampleData çağrıldı ama SAMPLE DATA YÜKLENMEYECEk');
  return addSampleDOFRecordsToLocalStorage(); // Temizlik yap
};

// Context7 - Export default da temizlik fonksiyonu
export default {
  sampleDOFRecords: [],
  addSampleDOFRecordsToLocalStorage,
  loadSampleData
}; 