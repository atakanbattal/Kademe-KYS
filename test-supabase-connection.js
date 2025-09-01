#!/usr/bin/env node

/**
 * Supabase Connection Test Script
 * Bu script Supabase bağlantısını test eder ve temel CRUD işlemlerini kontrol eder.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ SUPABASE_URL ve SUPABASE_ANON_KEY ortam değişkenleri gerekli!');
    console.log('💡 .env dosyasını oluşturun ve Supabase bilgilerinizi ekleyin.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('🔄 Supabase bağlantısı test ediliyor...\n');

    try {
        // 1. Temel bağlantı testi
        console.log('1️⃣ Temel bağlantı testi...');
        const { data, error } = await supabase
            .from('users')
            .select('count', { count: 'exact', head: true });
        
        if (error) {
            throw error;
        }

        console.log('✅ Bağlantı başarılı! Veritabanına erişilebiliyor.');
        console.log(`📊 Users tablosunda ${data?.[0]?.count || 0} kayıt bulunuyor.\n`);

        // 2. Tablo yapısı kontrolü
        console.log('2️⃣ Tablo yapısı kontrolü...');
        const tables = ['users', 'suppliers', 'material_quality_controls', 'quality_control_reports', 
                       'vehicle_quality_controls', 'tank_leak_tests', 'deviation_approvals'];
        
        for (const table of tables) {
            try {
                const { error: tableError } = await supabase
                    .from(table)
                    .select('*')
                    .limit(1);
                
                if (tableError) {
                    console.log(`❌ ${table} tablosu bulunamadı veya erişilemiyor`);
                } else {
                    console.log(`✅ ${table} tablosu mevcut`);
                }
            } catch (err) {
                console.log(`❌ ${table} tablosu kontrol edilemedi:`, err.message);
            }
        }

        // 3. Test kullanıcısı oluşturma (opsiyonel)
        console.log('\n3️⃣ Test kullanıcısı oluşturma...');
        try {
            const testUser = {
                name: 'Test Kullanıcı',
                email: 'test@example.com',
                password_hash: '$2a$10$test.hash.for.development',
                role: 'viewer',
                department: 'Test Departmanı',
                is_active: true
            };

            // Önce mevcut test kullanıcısını kontrol et
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('email', testUser.email)
                .single();

            if (existingUser) {
                console.log('✅ Test kullanıcısı zaten mevcut');
            } else {
                const { data: newUser, error: insertError } = await supabase
                    .from('users')
                    .insert(testUser)
                    .select()
                    .single();

                if (insertError) {
                    throw insertError;
                }

                console.log('✅ Test kullanıcısı başarıyla oluşturuldu:', newUser.name);
            }
        } catch (err) {
            console.log('⚠️ Test kullanıcısı oluşturulamadı:', err.message);
            console.log('💡 Bu normal olabilir - RLS politikaları aktif olabilir.');
        }

        // 4. Enum kontrolleri
        console.log('\n4️⃣ Enum türleri kontrolü...');
        try {
            const { data: enums, error: enumError } = await supabase
                .rpc('get_enum_values', { enum_name: 'user_role' });
            
            if (!enumError && enums) {
                console.log('✅ user_role enum değerleri:', enums);
            } else {
                console.log('⚠️ Enum değerleri alınamadı - manuel kontrol gerekebilir');
            }
        } catch (err) {
            console.log('⚠️ Enum kontrolü yapılamadı:', err.message);
        }

        console.log('\n🎉 Supabase entegrasyonu başarıyla tamamlandı!');
        console.log('🚀 Artık backend\'i başlatabilirsiniz:');
        console.log('   cd src/backend');
        console.log('   npm run dev');
        
    } catch (error) {
        console.error('\n❌ Supabase bağlantı hatası:', error.message);
        console.log('\n🔧 Kontrol edilecek noktalar:');
        console.log('1. SUPABASE_URL doğru mu?');
        console.log('2. SUPABASE_ANON_KEY doğru mu?');
        console.log('3. Supabase projesinde migration çalıştırıldı mı?');
        console.log('4. RLS politikaları doğru yapılandırıldı mı?');
        process.exit(1);
    }
}

// Ana fonksiyonu çalıştır
testConnection();
