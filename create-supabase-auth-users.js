#!/usr/bin/env node

/**
 * Supabase Authentication Kullanıcı Oluşturma Scripti
 * Bu script Supabase Authentication sistemine kullanıcıları ekler
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Supabase configuration with service role key for admin operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56a3hpemhuaWtmc2h5aGlsZWZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjcxNjAzMiwiZXhwIjoyMDcyMjkyMDMyfQ.22xhkrcxviakmu1PYJke-P4WNXDfPDCZMMi8Z5WnRFU';

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ SUPABASE_URL ve Service Role Key gerekli!');
    process.exit(1);
}

// Service role ile bağlantı (Admin API için)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Oluşturulacak kullanıcılar
const usersToCreate = [
    {
        email: 'atakan.battal@kademe.com.tr',
        password: 'atakan1234',
        user_metadata: {
            name: 'Atakan Battal',
            department: 'Bilgi İşlem',
            role: 'admin'
        }
    },
    {
        email: 'hasan.yavuz@kademe.com.tr', 
        password: 'hasan1234',
        user_metadata: {
            name: 'Hasan Yavuz',
            department: 'Kalite Güvence',
            role: 'admin'
        }
    }
];

async function createSupabaseAuthUsers() {
    console.log('🔄 Supabase Authentication kullanıcıları oluşturuluyor...\n');

    try {
        for (const userData of usersToCreate) {
            console.log(`👤 ${userData.user_metadata.name} (${userData.email}) Auth sistemine ekleniyor...`);

            // Supabase Authentication'a kullanıcı ekle
            const { data, error } = await supabase.auth.admin.createUser({
                email: userData.email,
                password: userData.password,
                email_confirm: true, // Email otomatik onaylanmış
                user_metadata: userData.user_metadata
            });

            if (error) {
                if (error.message.includes('already registered')) {
                    console.log(`⚠️ Kullanıcı zaten Auth sisteminde mevcut: ${userData.email}`);
                } else {
                    console.error(`❌ ${userData.email} Auth sistemine eklenemedi:`, error.message);
                }
                continue;
            }

            console.log(`✅ Auth sisteminde başarıyla oluşturuldu: ${userData.user_metadata.name}`);
            console.log(`   Auth ID: ${data.user?.id}`);
            console.log(`   Email: ${data.user?.email}`);
            console.log(`   Email Confirmed: ${data.user?.email_confirmed_at ? 'Evet' : 'Hayır'}\n`);
        }

        console.log('🎉 Supabase Authentication kullanıcıları başarıyla oluşturuldu!');
        
        // Auth kullanıcı listesini göster
        console.log('\n📋 Supabase Auth Kullanıcıları:');
        const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();

        if (listError) {
            console.error('❌ Auth kullanıcı listesi alınamadı:', listError.message);
        } else {
            authUsers?.users?.forEach((user, index) => {
                console.log(`${index + 1}. ${user.user_metadata?.name || 'Ad Belirtilmemiş'} (${user.email})`);
                console.log(`   ID: ${user.id}`);
                console.log(`   Email Confirmed: ${user.email_confirmed_at ? 'Evet' : 'Hayır'}`);
                console.log(`   Last Sign In: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('tr-TR') : 'Hiç'}\n`);
            });
        }

        console.log('🚀 Artık kullanıcılar hem backend API hem de Supabase Auth ile giriş yapabilir!');
        console.log('\n🌐 Frontend login test adresi: http://localhost:3005');
        
    } catch (error) {
        console.error('\n❌ Supabase Auth kullanıcı oluşturma hatası:', error.message);
        process.exit(1);
    }
}

// Ana fonksiyonu çalıştır
createSupabaseAuthUsers();
