#!/usr/bin/env node

/**
 * Modül verileri için Supabase Migration Uygulama
 * Tüm modüllerin verilerini saklamak için gerekli tabloları oluşturur
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

// Service role ile bağlantı (RLS bypass için)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function applyModulesMigration() {
    console.log('🚀 Modül verileri migration başlatılıyor...\n');

    try {
        // Migration dosyasını oku
        console.log('📖 Migration dosyası okunuyor...');
        const migrationSQL = readFileSync('supabase_migrations/02_modules_data_schema.sql', 'utf8');
        console.log(`✅ Migration dosyası okundu (${migrationSQL.length} karakter)\n`);

        // SQL komutlarını satır satır ayır ve çalıştır
        console.log('⚡ SQL komutları uygulanıyor...');
        
        // SQL'i komutlara böl (noktalı virgül ile)
        const sqlCommands = migrationSQL
            .split(';')
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

        console.log(`📊 Toplam ${sqlCommands.length} SQL komutu bulundu\n`);

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < sqlCommands.length; i++) {
            const command = sqlCommands[i];
            
            try {
                // Progress göstergesi
                if (i % 10 === 0) {
                    console.log(`⏳ İlerleme: ${i + 1}/${sqlCommands.length} (${Math.round(((i + 1) / sqlCommands.length) * 100)}%)`);
                }

                const { error } = await supabase.rpc('exec_sql', { 
                    sql_query: command 
                });

                if (error) {
                    // Bazı hataları ignore et (already exists gibi)
                    if (error.message.includes('already exists') || 
                        error.message.includes('does not exist') ||
                        error.message.includes('duplicate key')) {
                        console.log(`⚠️ ${i + 1}: ${error.message.substring(0, 100)}...`);
                    } else {
                        console.error(`❌ ${i + 1}: ${error.message}`);
                        errorCount++;
                    }
                } else {
                    successCount++;
                }
            } catch (err) {
                console.error(`❌ ${i + 1}: ${err.message}`);
                errorCount++;
            }
        }

        console.log(`\n📊 Migration Sonuçları:`);
        console.log(`✅ Başarılı: ${successCount}`);
        console.log(`❌ Hatalı: ${errorCount}`);
        console.log(`📝 Toplam: ${sqlCommands.length}\n`);

        // Oluşturulan tabloları kontrol et
        console.log('🔍 Oluşturulan tablolar kontrol ediliyor...');
        
        const expectedTables = [
            'suppliers',
            'supplier_nonconformities', 
            'supplier_defects',
            'supplier_audits',
            'dof_records',
            'quality_costs',
            'quarantine_records',
            'fan_test_records',
            'equipment_calibrations',
            'tank_leak_tests',
            'documents',
            'training_records',
            'training_participants',
            'risk_assessments'
        ];

        for (const tableName of expectedTables) {
            try {
                const { data, error } = await supabase
                    .from(tableName)
                    .select('*', { count: 'exact', head: true });

                if (error) {
                    console.log(`❌ ${tableName}: ${error.message}`);
                } else {
                    console.log(`✅ ${tableName}: Tablo mevcut`);
                }
            } catch (err) {
                console.log(`❌ ${tableName}: ${err.message}`);
            }
        }

        console.log('\n🎉 Modül verileri migration tamamlandı!');
        console.log('📋 Artık tüm modüller Supabase\'de veri saklayabilir.');

    } catch (error) {
        console.error('\n❌ Migration hatası:', error.message);
        process.exit(1);
    }
}

// Ana fonksiyonu çalıştır
applyModulesMigration();
