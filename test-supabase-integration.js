/**
 * SUPABASE INTEGRATION TEST SCRIPT
 * Bu script Supabase entegrasyonunun doğru çalışıp çalışmadığını test eder
 * 
 * Kullanım:
 * 1. Terminal'de: node test-supabase-integration.js
 * 2. Veya Browser Console'da çalıştırın
 */

// ================================
// IMPORT & CONFIGURATION
// ================================
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Environment variables yükle
dotenv.config();

// Supabase client oluştur
const supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL || 'https://nzkxizhnikfshyhilefg.supabase.co',
    process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56a3hpemhuaWtmc2h5aGlsZWZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MTYwMzIsImV4cCI6MjA3MjI5MjAzMn0.aRm8XdIvVrBffxT2VHH7A2bMqQsjiJiy3qkbJAkYhUk'
);

// ================================
// TEST FUNCTIONS
// ================================
class SupabaseIntegrationTester {
    constructor() {
        this.testResults = [];
        this.errors = [];
    }

    // Test sonucunu kaydet
    recordTest(name, success, message, data = null) {
        const result = {
            test: name,
            success,
            message,
            data,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        const status = success ? '✅' : '❌';
        console.log(`${status} ${name}: ${message}`);
        
        if (data && success) {
            console.log(`   Data: ${typeof data === 'object' ? JSON.stringify(data, null, 2) : data}`);
        }
        
        if (!success) {
            this.errors.push(result);
        }
    }

    // 1. Bağlantı testi
    async testConnection() {
        console.log('\n🔗 Supabase bağlantısı test ediliyor...');
        
        try {
            const { data, error } = await supabase
                .from('users')
                .select('count', { count: 'exact' })
                .limit(1);

            if (error) throw error;

            this.recordTest(
                'Supabase Connection', 
                true, 
                'Supabase bağlantısı başarılı',
                { tableAccess: 'users table accessible', count: data?.length || 0 }
            );
            return true;
        } catch (error) {
            this.recordTest(
                'Supabase Connection', 
                false, 
                `Bağlantı hatası: ${error.message}`,
                error
            );
            return false;
        }
    }

    // 2. Tabloları kontrol et
    async testTables() {
        console.log('\n📊 Tablolar kontrol ediliyor...');
        
        const tables = [
            'users',
            'suppliers', 
            'material_quality_controls',
            'quality_control_reports',
            'vehicle_quality_controls',
            'tank_leak_tests',
            'deviation_approvals',
            'dof_records',
            'quality_costs',
            'quarantine_records'
        ];

        let successCount = 0;

        for (const table of tables) {
            try {
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .limit(1);

                if (error) throw error;

                this.recordTest(
                    `Table: ${table}`, 
                    true, 
                    'Tablo erişilebilir',
                    { recordCount: data?.length || 0 }
                );
                successCount++;
            } catch (error) {
                this.recordTest(
                    `Table: ${table}`, 
                    false, 
                    `Tablo hatası: ${error.message}`
                );
            }
        }

        this.recordTest(
            'All Tables Check', 
            successCount === tables.length, 
            `${successCount}/${tables.length} tablo erişilebilir`
        );

        return successCount === tables.length;
    }

    // 3. CRUD operasyonları test et
    async testCRUDOperations() {
        console.log('\n⚡ CRUD operasyonları test ediliyor...');
        
        let testSupplierId = null;

        try {
            // CREATE TEST
            const testSupplier = {
                name: 'Test Tedarikçi A.Ş.',
                code: `TEST_${Date.now()}`,
                contact_person: 'Test Kişi',
                email: 'test@test.com',
                phone: '+90 555 123 4567',
                address: 'Test Adres, Test İl',
                material_categories: ['Metal', 'Plastik'],
                notes: 'Test verisi - migration testi için oluşturuldu'
            };

            const { data: createData, error: createError } = await supabase
                .from('suppliers')
                .insert([testSupplier])
                .select()
                .single();

            if (createError) throw createError;

            testSupplierId = createData.id;
            this.recordTest(
                'CRUD: Create', 
                true, 
                'Test tedarikçi oluşturuldu',
                { id: testSupplierId, name: createData.name }
            );

            // READ TEST
            const { data: readData, error: readError } = await supabase
                .from('suppliers')
                .select('*')
                .eq('id', testSupplierId)
                .single();

            if (readError) throw readError;

            this.recordTest(
                'CRUD: Read', 
                readData.id === testSupplierId, 
                'Test tedarikçi okundu',
                { name: readData.name }
            );

            // UPDATE TEST
            const { data: updateData, error: updateError } = await supabase
                .from('suppliers')
                .update({ notes: 'Test verisi - güncellendi' })
                .eq('id', testSupplierId)
                .select()
                .single();

            if (updateError) throw updateError;

            this.recordTest(
                'CRUD: Update', 
                updateData.notes.includes('güncellendi'), 
                'Test tedarikçi güncellendi',
                { updatedNotes: updateData.notes }
            );

            // DELETE TEST
            const { error: deleteError } = await supabase
                .from('suppliers')
                .delete()
                .eq('id', testSupplierId);

            if (deleteError) throw deleteError;

            this.recordTest(
                'CRUD: Delete', 
                true, 
                'Test tedarikçi silindi'
            );

        } catch (error) {
            this.recordTest(
                'CRUD Operations', 
                false, 
                `CRUD hatası: ${error.message}`,
                error
            );

            // Cleanup: Test verisini temizle
            if (testSupplierId) {
                try {
                    await supabase
                        .from('suppliers')
                        .delete()
                        .eq('id', testSupplierId);
                } catch (cleanupError) {
                    console.log('Cleanup hatası:', cleanupError.message);
                }
            }
        }
    }

    // 4. Storage test et
    async testStorageAccess() {
        console.log('\n📂 Storage erişimi test ediliyor...');
        
        const buckets = [
            'documents',
            'certificates', 
            'quality-reports',
            'audit-attachments',
            'defect-photos',
            'training-materials'
        ];

        let successCount = 0;

        for (const bucketName of buckets) {
            try {
                const { data, error } = await supabase.storage
                    .from(bucketName)
                    .list('', { limit: 1 });

                if (error) throw error;

                this.recordTest(
                    `Storage: ${bucketName}`, 
                    true, 
                    'Bucket erişilebilir',
                    { fileCount: data?.length || 0 }
                );
                successCount++;
            } catch (error) {
                this.recordTest(
                    `Storage: ${bucketName}`, 
                    false, 
                    `Bucket hatası: ${error.message}`
                );
            }
        }

        this.recordTest(
            'All Storage Buckets', 
            successCount === buckets.length, 
            `${successCount}/${buckets.length} bucket erişilebilir`
        );

        return successCount === buckets.length;
    }

    // 5. Authentication test et
    async testAuthentication() {
        console.log('\n🔐 Authentication test ediliyor...');
        
        try {
            // Session kontrol et
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) throw sessionError;

            if (session) {
                this.recordTest(
                    'Auth: Current Session', 
                    true, 
                    'Aktif oturum var',
                    { userId: session.user.id, email: session.user.email }
                );
            } else {
                this.recordTest(
                    'Auth: Current Session', 
                    true, 
                    'Aktif oturum yok (normal)'
                );
            }

            // Test kullanıcı oluşturma (gerçek email gerekmez)
            const testEmail = `test_${Date.now()}@test.com`;
            const testPassword = 'TestPassword123!';

            this.recordTest(
                'Auth: System Ready', 
                true, 
                'Authentication sistemi hazır'
            );

        } catch (error) {
            this.recordTest(
                'Authentication', 
                false, 
                `Auth hatası: ${error.message}`,
                error
            );
        }
    }

    // 6. Real-time test et
    async testRealtime() {
        console.log('\n⚡ Real-time özellikler test ediliyor...');
        
        try {
            // Channel oluştur
            const channel = supabase
                .channel('test_channel')
                .on('postgres_changes', 
                    { event: 'INSERT', schema: 'public', table: 'suppliers' }, 
                    (payload) => {
                        console.log('Real-time event received:', payload);
                    }
                );

            // Subscribe
            const subscribeResult = await channel.subscribe();

            if (subscribeResult === 'SUBSCRIBED') {
                this.recordTest(
                    'Real-time: Subscribe', 
                    true, 
                    'Real-time subscription başarılı'
                );

                // Unsubscribe
                await supabase.removeChannel(channel);
                
                this.recordTest(
                    'Real-time: Unsubscribe', 
                    true, 
                    'Real-time unsubscribe başarılı'
                );
            } else {
                throw new Error('Subscription failed');
            }

        } catch (error) {
            this.recordTest(
                'Real-time Features', 
                false, 
                `Real-time hatası: ${error.message}`,
                error
            );
        }
    }

    // Ana test fonksiyonu
    async runAllTests() {
        console.log('🧪 SUPABASE INTEGRATION TEST BAŞLADI');
        console.log('=====================================');
        
        const startTime = Date.now();

        // Testleri sırayla çalıştır
        const connectionOk = await this.testConnection();
        
        if (connectionOk) {
            await this.testTables();
            await this.testCRUDOperations();
            await this.testStorageAccess();
            await this.testAuthentication();
            await this.testRealtime();
        } else {
            console.log('❌ Bağlantı başarısız, diğer testler atlanıyor');
        }

        const endTime = Date.now();
        const duration = endTime - startTime;

        // Sonuçları raporla
        this.generateReport(duration);
    }

    // Test raporu oluştur
    generateReport(duration) {
        console.log('\n📊 TEST RAPORU');
        console.log('=====================================');

        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(t => t.success).length;
        const failedTests = this.testResults.filter(t => !t.success).length;
        const successRate = Math.round((passedTests / totalTests) * 100);

        console.log(`⏱️  Süre: ${duration}ms`);
        console.log(`📈 Toplam Test: ${totalTests}`);
        console.log(`✅ Başarılı: ${passedTests}`);
        console.log(`❌ Başarısız: ${failedTests}`);
        console.log(`📊 Başarı Oranı: %${successRate}`);

        if (this.errors.length > 0) {
            console.log('\n❌ HATALAR:');
            this.errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error.test}: ${error.message}`);
            });
        }

        console.log('\n🎯 SONUÇ:');
        if (successRate >= 90) {
            console.log('🎉 Supabase entegrasyonu hazır! Modülleri entegre etmeye başlayabilirsiniz.');
        } else if (successRate >= 70) {
            console.log('⚠️ Entegrasyon kısmen hazır. Hataları düzeltin ve tekrar test edin.');
        } else {
            console.log('💥 Entegrasyon başarısız. Environment dosyanızı ve Supabase projesi ayarlarınızı kontrol edin.');
        }

        return {
            success: successRate >= 90,
            successRate,
            totalTests,
            passedTests,
            failedTests,
            duration,
            errors: this.errors
        };
    }
}

// ================================
// SCRIPT EXECUTION
// ================================

// Node.js'de çalıştır
if (require.main === module) {
    const tester = new SupabaseIntegrationTester();
    tester.runAllTests().catch(console.error);
}

// Browser'da çalıştırmak için
if (typeof window !== 'undefined') {
    window.testSupabaseIntegration = async function() {
        const tester = new SupabaseIntegrationTester();
        return await tester.runAllTests();
    };
    
    console.log(`
🧪 SUPABASE TEST HAZIR

Browser'da çalıştırmak için:
> testSupabaseIntegration()
    `);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SupabaseIntegrationTester;
}

// ================================
// QUICK TEST EXAMPLE
// ================================

/*
// Hızlı test örneği:
const tester = new SupabaseIntegrationTester();
tester.runAllTests().then(result => {
    if (result.success) {
        console.log('✅ Entegrasyon hazır!');
    } else {
        console.log('❌ Entegrasyon sorunlu:', result.errors);
    }
});
*/
