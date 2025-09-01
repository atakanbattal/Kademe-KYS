#!/usr/bin/env node

/**
 * Admin Kullanıcı Oluşturma Scripti
 * Bu script Supabase'e admin kullanıcıları ekler
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
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

// Oluşturulacak kullanıcılar
const adminUsers = [
    {
        name: 'Atakan Battal',
        email: 'atakan.battal@kademe.com.tr',
        password: 'atakan1234',
        role: 'admin',
        department: 'Bilgi İşlem'
    },
    {
        name: 'Hasan Yavuz',
        email: 'hasan.yavuz@kademe.com.tr',
        password: 'hasan1234',
        role: 'admin',
        department: 'Kalite Güvence'
    }
];

async function createAdminUsers() {
    console.log('🔄 Admin kullanıcıları oluşturuluyor...\n');

    try {
        for (const userData of adminUsers) {
            console.log(`👤 ${userData.name} (${userData.email}) oluşturuluyor...`);

            // Önce kullanıcının var olup olmadığını kontrol et
            const { data: existingUser, error: checkError } = await supabase
                .from('users')
                .select('id, email')
                .eq('email', userData.email)
                .single();

            if (existingUser) {
                console.log(`⚠️ Kullanıcı zaten mevcut: ${userData.email}`);
                continue;
            }

            // Şifreyi hashle
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(userData.password, salt);

            // Kullanıcıyı oluştur
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert({
                    name: userData.name,
                    email: userData.email,
                    password_hash: passwordHash,
                    role: userData.role,
                    department: userData.department,
                    is_active: true
                })
                .select()
                .single();

            if (insertError) {
                console.error(`❌ ${userData.email} oluşturulamadı:`, insertError.message);
                continue;
            }

            console.log(`✅ Başarıyla oluşturuldu: ${userData.name}`);
            console.log(`   ID: ${newUser.id}`);
            console.log(`   Email: ${newUser.email}`);
            console.log(`   Role: ${newUser.role}`);
            console.log(`   Department: ${newUser.department}\n`);
        }

        console.log('🎉 Admin kullanıcıları başarıyla oluşturuldu!');
        
        // Kullanıcı listesini göster
        console.log('\n📋 Mevcut kullanıcılar:');
        const { data: allUsers, error: listError } = await supabase
            .from('users')
            .select('id, name, email, role, department, is_active, created_at')
            .order('created_at', { ascending: true });

        if (listError) {
            console.error('❌ Kullanıcı listesi alınamadı:', listError.message);
        } else {
            allUsers?.forEach((user, index) => {
                console.log(`${index + 1}. ${user.name} (${user.email})`);
                console.log(`   Role: ${user.role} | Department: ${user.department} | Active: ${user.is_active}`);
                console.log(`   Created: ${new Date(user.created_at).toLocaleString('tr-TR')}\n`);
            });
        }

        console.log('🚀 Simdi backend API ile login testi yapabilirsiniz:');
        console.log('\n📡 Test komutlari:');
        console.log('curl -X POST http://localhost:5003/api/auth/login \\');
        console.log('  -H "Content-Type: application/json" \\');
        console.log('  -d \'{"email": "atakan.battal@kademe.com.tr", "password": "atakan1234"}\'');
        
        console.log('\ncurl -X POST http://localhost:5003/api/auth/login \\');
        console.log('  -H "Content-Type: application/json" \\');
        console.log('  -d \'{"email": "hasan.yavuz@kademe.com.tr", "password": "hasan1234"}\'');

    } catch (error) {
        console.error('\n❌ Admin kullanıcı oluşturma hatası:', error.message);
        process.exit(1);
    }
}

// Ana fonksiyonu çalıştır
createAdminUsers();
