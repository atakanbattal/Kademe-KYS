#!/usr/bin/env node

/**
 * Mustafa'yı Supabase Authentication'a Ekleme
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Supabase configuration with service role key for admin operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56a3hpemhuaWtmc2h5aGlsZWZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjcxNjAzMiwiZXhwIjoyMDcyMjkyMDMyfQ.22xhkrcxviakmu1PYJke-P4WNXDfPDCZMMi8Z5WnRFU';

// Service role ile bağlantı (Admin API için)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function addMustafaToAuth() {
    console.log('🔄 Mustafa Auth sistemine ekleniyor...\n');

    try {
        // Önce mevcut durumu kontrol et
        const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
        
        if (listError) {
            console.error('❌ Auth kullanıcı listesi alınamadı:', listError.message);
            return;
        }

        const mustafaExists = existingUsers?.users?.find(u => u.email === 'mustafa.buyukkokten@kademe.com.tr');
        
        if (mustafaExists) {
            console.log('⚠️ Mustafa zaten Auth sisteminde mevcut');
            console.log(`   Auth ID: ${mustafaExists.id}`);
            console.log(`   Email: ${mustafaExists.email}`);
            console.log(`   Email Confirmed: ${mustafaExists.email_confirmed_at ? 'Evet' : 'Hayır'}\n`);
        } else {
            // Supabase Authentication'a kullanıcı ekle
            const { data, error } = await supabase.auth.admin.createUser({
                email: 'mustafa.buyukkokten@kademe.com.tr',
                password: 'mustafa1234',
                email_confirm: true,
                user_metadata: {
                    name: 'Mustafa Büyükköktaş',
                    department: 'Kalite Kontrol Şefi',
                    role: 'quality'
                }
            });

            if (error) {
                console.error(`❌ Mustafa Auth sistemine eklenemedi:`, error.message);
            } else {
                console.log(`✅ Mustafa Auth sisteminde başarıyla oluşturuldu`);
                console.log(`   Auth ID: ${data.user?.id}`);
                console.log(`   Email: ${data.user?.email}\n`);
            }
        }

        // Güncel Auth kullanıcıları listesi
        console.log('📋 Supabase Auth Kullanıcıları:');
        const { data: allAuthUsers } = await supabase.auth.admin.listUsers();
        
        allAuthUsers?.users?.forEach((user, index) => {
            console.log(`${index + 1}. ${user.user_metadata?.name || 'Ad Belirtilmemiş'} (${user.email})`);
            console.log(`   ID: ${user.id}`);
            console.log(`   Department: ${user.user_metadata?.department || 'Belirtilmemiş'}`);
            console.log(`   Email Confirmed: ${user.email_confirmed_at ? 'Evet' : 'Hayır'}\n`);
        });

        console.log('🎉 İşlem tamamlandı!');
        
    } catch (error) {
        console.error('\n❌ Auth işlemi hatası:', error.message);
        process.exit(1);
    }
}

// Ana fonksiyonu çalıştır
addMustafaToAuth();
