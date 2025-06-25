// ✅ Departman İsimleri Düzeltme Script'i
// Bu script localStorage'daki hatalı departman isimlerini düzeltir

console.log('🔧 Departman İsimleri Düzeltme Script\'i başlatılıyor...');

function fixDepartmentNames() {
  try {
    // localStorage'dan veriyi al
    const existingData = localStorage.getItem('kys-cost-management-data');
    if (!existingData) {
      console.log('❌ localStorage\'da veri bulunamadı');
      return false;
    }

    const data = JSON.parse(existingData);
    if (!Array.isArray(data) || data.length === 0) {
      console.log('❌ Geçersiz veri formatı');
      return false;
    }

    console.log(`📊 ${data.length} kayıt bulundu`);

    // Hatalı departman isimlerini doğru olanlarla eşleştir
    const departmentMigrationMap = {
      'Idari_isler': 'idari_isler',
      'İdari_isler': 'idari_isler', 
      'Idari isler': 'idari_isler',
      'İdari isler': 'idari_isler',
      'Satis_sonrasi': 'satis_sonrasi_hizmetler',
      'satis_sonrasi': 'satis_sonrasi_hizmetler',
      'Satis sonrasi': 'satis_sonrasi_hizmetler',
      'satış_sonrası': 'satis_sonrasi_hizmetler',
      'elektrikhane': 'elektrikhane',
      'Elektrikhane': 'elektrikhane',
      'bukum': 'bukum',
      'Bukum': 'bukum',
      'Büküm': 'bukum'
    };

    let migrationCount = 0;
    const fixedData = data.map(item => {
      if (item.birim && departmentMigrationMap[item.birim]) {
        console.log(`📝 Düzeltme: "${item.birim}" → "${departmentMigrationMap[item.birim]}"`);
        migrationCount++;
        return {
          ...item,
          birim: departmentMigrationMap[item.birim]
        };
      }
      return item;
    });

    if (migrationCount > 0) {
      // Düzeltilmiş veriyi localStorage'a kaydet
      localStorage.setItem('kys-cost-management-data', JSON.stringify(fixedData));
      
      // Backup oluştur
      const timestamp = new Date().toISOString();
      localStorage.setItem('kys-cost-management-data-backup', JSON.stringify({
        data: fixedData,
        timestamp,
        version: '2.1-fixed-names'
      }));

      console.log(`✅ ${migrationCount} departman ismi düzeltildi ve kaydedildi!`);
      
      // Migration bayrağını set et
      localStorage.setItem('department-names-migration-applied', 'true');
      
      return true;
    } else {
      console.log('ℹ️ Düzeltilecek departman ismi bulunamadı');
      return false;
    }

  } catch (error) {
    console.error('❌ Script hatası:', error);
    return false;
  }
}

// Script'i çalıştır
const result = fixDepartmentNames();

if (result) {
  console.log('🎉 Departman isimleri başarıyla düzeltildi!');
  console.log('🔄 Lütfen sayfayı yenileyin veya uygulamayı yeniden başlatın.');
} else {
  console.log('⚠️ Düzeltme işlemi tamamlanamadı');
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { fixDepartmentNames };
} 