#!/usr/bin/env node

/**
 * Migration Uygulama Scripti
 * Bu script migration dosyasını Supabase'e uygular
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';
dotenv.config();

// Supabase configuration with service role key for admin operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56a3hpemhuaWtmc2h5aGlsZWZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjcxNjAzMiwiZXhwIjoyMDcyMjkyMDMyfQ.22xhkrcxviakmu1PYJke-P4WNXDfPDCZMMi8Z5WnRFU';

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ SUPABASE_URL ve Service Role Key gerekli!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function applyMigration() {
    console.log('🔄 Migration dosyası uygulanıyor...\n');

    try {
        // Migration dosyasını oku
        const migrationPath = './supabase_migrations/01_initial_schema.sql';
        console.log('📖 Migration dosyası okunuyor:', migrationPath);
        
        let migrationSQL;
        try {
            migrationSQL = readFileSync(migrationPath, 'utf8');
            console.log('✅ Migration dosyası başarıyla okundu');
        } catch (error) {
            console.error('❌ Migration dosyası okunamadı:', error.message);
            process.exit(1);
        }

        // SQL'i parçalara böl (çünkü bazı komutlar ayrı çalıştırılmalı)
        const sqlCommands = migrationSQL
            .split(';')
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

        console.log(`🔧 ${sqlCommands.length} SQL komutu tespit edildi\n`);

        // Her SQL komutunu sırayla çalıştır
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < sqlCommands.length; i++) {
            const sql = sqlCommands[i] + ';';
            
            try {
                console.log(`⏳ ${i + 1}/${sqlCommands.length}: SQL komutu çalıştırılıyor...`);
                
                const { data, error } = await supabase.rpc('execute_sql', {
                    query: sql
                });

                if (error) {
                    // Bazı hatalar normal olabilir (örn: extension zaten var)
                    if (error.message.includes('already exists') || 
                        error.message.includes('does not exist') ||
                        error.message.includes('permission denied')) {
                        console.log(`⚠️ Beklenen hata (devam ediliyor): ${error.message.substring(0, 100)}...`);
                    } else {
                        console.error(`❌ SQL hatası: ${error.message.substring(0, 200)}...`);
                        errorCount++;
                    }
                } else {
                    console.log(`✅ Başarılı`);
                    successCount++;
                }
                
                // Rate limiting için kısa bekleme
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.error(`❌ Komut ${i + 1} hatası:`, error.message.substring(0, 200));
                errorCount++;
            }
        }

        console.log(`\n📊 Migration Sonuçları:`);
        console.log(`✅ Başarılı: ${successCount}`);
        console.log(`❌ Hatalı: ${errorCount}`);

        // Manual SQL execution için alternatif yöntem
        console.log('\n🔧 Alternatif Yöntem:');
        console.log('Migration otomatik olarak tamamlanamadıysa, aşağıdaki adımları takip edin:');
        console.log('1. Supabase Dashboard\'a gidin: https://supabase.com/dashboard/project/nzkxizhnikfshyhilefg');
        console.log('2. Sol menüden "SQL Editor" sekmesine tıklayın');
        console.log('3. supabase_migrations/01_initial_schema.sql dosyasının içeriğini kopyalayın');
        console.log('4. SQL Editor\'e yapıştırın ve "Run" butonuna tıklayın');

        console.log('\n🎉 Migration işlemi tamamlandı!');

    } catch (error) {
        console.error('\n❌ Migration hatası:', error.message);
        process.exit(1);
    }
}

// RPC function tanımla
async function createExecuteSqlFunction() {
    try {
        const createFunctionSQL = `
        CREATE OR REPLACE FUNCTION execute_sql(query TEXT)
        RETURNS JSON AS $$
        BEGIN
            EXECUTE query;
            RETURN json_build_object('success', true);
        EXCEPTION WHEN OTHERS THEN
            RETURN json_build_object('error', SQLERRM);
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        `;

        const { error } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });
        if (error) {
            console.log('⚠️ RPC function oluşturulamadı, manuel migration gerekli');
        }
    } catch (e) {
        console.log('⚠️ RPC function oluşturulamadı, manuel migration gerekli');
    }
}

// Ana fonksiyonu çalıştır
applyMigration();
