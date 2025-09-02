#!/usr/bin/env node

/**
 * OTOMATIK SQL MIGRATION RUNNER
 * Bu script SQL dosyasını kopyalar ve kullanıcıya tam otomatik talimatlar verir
 */

const fs = require('fs');
const { execSync } = require('child_process');

async function runMigrationSetup() {
    console.log('🚀 OTOMATIK SQL MIGRATION BAŞLATILIYOR');
    console.log('=====================================');

    try {
        // SQL dosyasını oku
        const sqlContent = fs.readFileSync('COMPLETE_MIGRATION_SINGLE_FILE.sql', 'utf8');
        
        console.log('✅ SQL dosyası okundu');
        console.log('✅ Toplam satır sayısı:', sqlContent.split('\n').length);
        
        // Clipboard'a kopyalamaya çalış (macOS)
        try {
            execSync(`echo "${sqlContent.replace(/"/g, '\\"')}" | pbcopy`);
            console.log('✅ SQL kodu clipboard\'a kopyalandı!');
            console.log('');
            console.log('🎯 ŞİMDİ YAPMANIZ GEREKEN:');
            console.log('1. https://supabase.com/dashboard adresine gidin');
            console.log('2. Projenizi seçin (nzkxizhnikfshyhilefg)');
            console.log('3. Sol menüden "SQL Editor" sekmesine tıklayın');
            console.log('4. Cmd+V (veya Ctrl+V) ile SQL kodunu yapıştırın');
            console.log('5. "RUN" butonuna basın');
            console.log('');
            console.log('⚡ SONUÇ: 10 tablo + triggerlar + indexler otomatik oluşturulacak!');
        } catch (error) {
            console.log('⚠️ Clipboard kopyalama başarısız, manuel copy-paste gerekiyor');
            console.log('');
            console.log('🎯 MANUEL ADIMLAR:');
            console.log('1. COMPLETE_MIGRATION_SINGLE_FILE.sql dosyasını açın');
            console.log('2. Tüm içeriği kopyalayın (Cmd+A, Cmd+C)');
            console.log('3. https://supabase.com/dashboard > SQL Editor\'e gidin');
            console.log('4. SQL kodunu yapıştırın ve RUN butonuna basın');
        }

        console.log('');
        console.log('📊 OLUŞTURULACAK YAPILAR:');
        console.log('✅ 10 Ana Tablo (users, suppliers, vehicle_quality_controls, vb.)');
        console.log('✅ 9 Enum Type (user_role, quality_control_status, vb.)');
        console.log('✅ 11 Performance Index');
        console.log('✅ 10 RLS Security Policy');
        console.log('✅ 10 Auto-Update Trigger');
        console.log('✅ 4 Business Logic Function');
        console.log('');
        console.log('🎉 Migration tamamlandıktan sonra tüm modülleriniz Supabase ile çalışmaya hazır!');
        
        return true;
        
    } catch (error) {
        console.error('❌ Hata:', error.message);
        return false;
    }
}

// Script'i çalıştır
if (require.main === module) {
    runMigrationSetup()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Fatal hata:', error);
            process.exit(1);
        });
}

module.exports = runMigrationSetup;
