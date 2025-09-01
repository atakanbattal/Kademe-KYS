#!/usr/bin/env node

/**
 * Yeni Kullanıcı ve Kullanıcı Güncellemeleri
 * Bu script yeni kullanıcı ekler ve mevcut kullanıcıları günceller
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

async function updateUsers() {
    console.log('🔄 Kullanıcı işlemleri başlatılıyor...\n');

    try {
        // 1. Yeni kullanıcı ekle
        console.log('👤 Yeni kullanıcı ekleniyor: Mustafa Büyükköktaş');
        
        // Şifreyi hashle
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('mustafa1234', salt);

        // Backend users tablosuna ekle
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
                name: 'Mustafa Büyükköktaş',
                email: 'mustafa.buyukkokten@kademe.com.tr',
                password_hash: passwordHash,
                role: 'quality',
                department: 'Kalite Kontrol Şefi',
                is_active: true
            })
            .select()
            .single();

        if (insertError) {
            if (insertError.message.includes('duplicate key')) {
                console.log(`⚠️ Kullanıcı zaten mevcut: mustafa.buyukkokten@kademe.com.tr`);
            } else {
                console.error(`❌ Mustafa kullanıcısı oluşturulamadı:`, insertError.message);
            }
        } else {
            console.log(`✅ Backend'de başarıyla oluşturuldu: Mustafa Büyükköktaş`);
            console.log(`   ID: ${newUser.id}`);
        }

        // Supabase Authentication'a da ekle
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: 'mustafa.buyukkokten@kademe.com.tr',
            password: 'mustafa1234',
            email_confirm: true,
            user_metadata: {
                name: 'Mustafa Büyükköktaş',
                department: 'Kalite Kontrol Şefi',
                role: 'quality'
            }
        });

        if (authError) {
            if (authError.message.includes('already registered')) {
                console.log(`⚠️ Kullanıcı zaten Auth sisteminde mevcut: mustafa.buyukkokten@kademe.com.tr`);
            } else {
                console.error(`❌ Mustafa Auth sistemine eklenemedi:`, authError.message);
            }
        } else {
            console.log(`✅ Auth sisteminde başarıyla oluşturuldu: Mustafa Büyükköktaş\n`);
        }

        // 2. Atakan Battal'ı güncelle
        console.log('🔄 Atakan Battal güncelleniyor...');
        const { data: atakanUpdate, error: atakanError } = await supabase
            .from('users')
            .update({
                department: 'Kalite Kontrol ve Güvence Müdür Yardımcısı'
            })
            .eq('email', 'atakan.battal@kademe.com.tr')
            .select()
            .single();

        if (atakanError) {
            console.error(`❌ Atakan güncellenemedi:`, atakanError.message);
        } else {
            console.log(`✅ Atakan Battal güncellendi: ${atakanUpdate.department}`);
        }

        // 3. Hasan Yavuz'u güncelle
        console.log('🔄 Hasan Yavuz güncelleniyor...');
        const { data: hasanUpdate, error: hasanError } = await supabase
            .from('users')
            .update({
                department: 'Kalite Güvence Uzmanı'
            })
            .eq('email', 'hasan.yavuz@kademe.com.tr')
            .select()
            .single();

        if (hasanError) {
            console.error(`❌ Hasan güncellenemedi:`, hasanError.message);
        } else {
            console.log(`✅ Hasan Yavuz güncellendi: ${hasanUpdate.department}\n`);
        }

        // 4. Güncel kullanıcı listesini göster
        console.log('📋 Güncel Kullanıcı Listesi:');
        const { data: allUsers, error: listError } = await supabase
            .from('users')
            .select('id, name, email, role, department, is_active, created_at')
            .order('created_at', { ascending: true });

        if (listError) {
            console.error('❌ Kullanıcı listesi alınamadı:', listError.message);
        } else {
            allUsers?.forEach((user, index) => {
                console.log(`${index + 1}. ${user.name} (${user.email})`);
                console.log(`   Departman: ${user.department} | Role: ${user.role} | Active: ${user.is_active}`);
                console.log(`   Created: ${new Date(user.created_at).toLocaleString('tr-TR')}\n`);
            });
        }

        console.log('🎉 Tüm kullanıcı işlemleri başarıyla tamamlandı!');
        console.log('\n🔐 Giriş Bilgileri:');
        console.log('• Atakan Battal: atakan.battal@kademe.com.tr / atakan1234');
        console.log('• Hasan Yavuz: hasan.yavuz@kademe.com.tr / hasan1234');
        console.log('• Mustafa Büyükköktaş: mustafa.buyukkokten@kademe.com.tr / mustafa1234');

    } catch (error) {
        console.error('\n❌ Kullanıcı işlemleri hatası:', error.message);
        process.exit(1);
    }
}

// Ana fonksiyonu çalıştır
updateUsers();
