/**
 * QUALITY COST MANAGEMENT - QUICK SUPABASE INTEGRATION
 * Ana QualityCostManagement modülüne hızlı Supabase entegrasyonu ekler
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const QUALITY_COST_FILE = path.join(PROJECT_ROOT, 'src/frontend/kys-frontend/src/pages/QualityCostManagement.tsx');

console.log('🚀 Quality Cost Management Supabase entegrasyonu başlıyor...');

try {
    // Ana QualityCostManagement dosyasını oku
    let content = fs.readFileSync(QUALITY_COST_FILE, 'utf8');
    
    // İki temel ekleme yapmamız gerekiyor:
    // 1. Import eklenmesi (zaten yapıldı)
    // 2. Main return içine Migration Helper eklenmesi
    
    // Main return'ün başlangıcını bul
    const returnPatterns = [
        '  return (',
        '  return(',
        '\treturn (',
        '\treturn('
    ];
    
    let insertPosition = -1;
    let foundPattern = '';
    
    for (const pattern of returnPatterns) {
        const index = content.indexOf(pattern);
        if (index > 7000 && index < 20000) { // Ana function'ın return'ü olması için kabaca range
            insertPosition = index;
            foundPattern = pattern;
            break;
        }
    }
    
    if (insertPosition === -1) {
        console.error('❌ Ana return statement bulunamadı');
        process.exit(1);
    }
    
    console.log(`✅ Ana return statement bulundu: ${insertPosition}`);
    console.log(`📍 Pattern: "${foundPattern}"`);
    
    // Return'ün hemen sonrasındaki Box'ı bul
    const returnStart = insertPosition + foundPattern.length;
    const boxStart = content.indexOf('<Box', returnStart);
    
    if (boxStart === -1) {
        console.error('❌ Ana Box component bulunamadı');
        process.exit(1);
    }
    
    // Box'ın açılış tag'ının sonunu bul
    const boxTagEnd = content.indexOf('>', boxStart) + 1;
    
    // Migration Helper'ı Box'ın hemen içine ekle
    const migrationHelperCode = `
      {/* ✅ SUPABASE SENKRONIZASYON HELPER - REAL-TIME DATA SYNC */}
      <QualityCostMigrationHelper />
`;
    
    // İçeriği güncelle
    const newContent = content.slice(0, boxTagEnd) + migrationHelperCode + content.slice(boxTagEnd);
    
    // Dosyayı kaydet
    fs.writeFileSync(QUALITY_COST_FILE, newContent, 'utf8');
    
    console.log('✅ QualityCostMigrationHelper başarıyla eklendi!');
    console.log('📍 Ekleme pozisyonu:', boxTagEnd);
    
    // LocalStorage dependency bulup Supabase service ile replace et
    let replacements = 0;
    
    // localStorage okuma işlemlerini Supabase service ile değiştir
    const localStoragePatterns = [
        {
            old: "localStorage.getItem('kys-cost-management-data')",
            new: "await qualityCostSupabaseService.getAllQualityCosts()"
        },
        {
            old: "JSON.parse(localStorage.getItem('kys-cost-management-data') || '[]')",
            new: "await qualityCostSupabaseService.getAllQualityCosts()"
        }
    ];
    
    console.log('🔄 LocalStorage kullanımları tespit ediliyor...');
    
    for (const pattern of localStoragePatterns) {
        const count = (newContent.match(new RegExp(pattern.old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        if (count > 0) {
            console.log(`📦 "${pattern.old}" - ${count} adet bulundu`);
            replacements += count;
        }
    }
    
    console.log(`📊 Toplam ${replacements} localStorage kullanımı tespit edildi`);
    console.log('⚠️  Manuel değiştirme gerekebilir (async/await uyumluluğu için)');
    
    console.log('\n🎯 SONRAKİ ADIMLAR:');
    console.log('1. ✅ QualityCostMigrationHelper eklendi');
    console.log('2. 🔄 LocalStorage → Supabase migration\'u manuel kontrol edin');
    console.log('3. 🚀 Uygulamayı başlatın ve Migration Helper\'ı kullanın');
    console.log('4. 📱 Real-time senkronizasyonu aktifleştirin');
    
    console.log('\n✨ Quality Cost Management artık Supabase-ready!');

} catch (error) {
    console.error('❌ Entegrasyon hatası:', error.message);
    process.exit(1);
}
