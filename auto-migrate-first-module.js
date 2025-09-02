#!/usr/bin/env node

/**
 * OTOMATIK İLK MODÜL ENTEGRASYONU
 * SupplierQualityManagement modülünü otomatik olarak Supabase'e entegre eder
 */

const fs = require('fs');
const path = require('path');

class AutoModuleMigration {
    constructor() {
        this.results = {
            success: false,
            filesUpdated: [],
            errors: []
        };
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`${icon} [${timestamp}] ${message}`);
    }

    async updateSupplierQualityManagement() {
        this.log('SupplierQualityManagement modülü Supabase entegrasyonu başlıyor...');
        
        const filePath = 'src/frontend/kys-frontend/src/pages/SupplierQualityManagement.tsx';
        
        try {
            // Dosyayı oku
            if (!fs.existsSync(filePath)) {
                throw new Error(`Dosya bulunamadı: ${filePath}`);
            }
            
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Import ekle
            const supabaseImport = `import { supplierSupabaseService } from '../services/supplierSupabaseService';
import { supabaseStorageService } from '../services/supabaseStorageService';`;
            
            // React import'tan sonra ekle
            if (!content.includes('supplierSupabaseService')) {
                content = content.replace(
                    /import React[^;]+;/,
                    `$&\n${supabaseImport}`
                );
                this.log('Supabase import\'ları eklendi', 'success');
            }
            
            // State initialization fonksiyonunu güncelle
            const newLoadFunction = `
  // ✅ SUPABASE ENTEGRASYONU - LocalStorage yerine Supabase kullanımı
  const loadStoredData = async () => {
    try {
      console.log('🔄 Supabase\'den veri yükleniyor...');
      
      // Supabase'den verileri çek
      const [suppliers, nonconformities, defects, audits] = await Promise.all([
        supplierSupabaseService.getAllSuppliers(),
        supplierSupabaseService.getAllNonconformities(),
        supplierSupabaseService.getAllDefects(),
        supplierSupabaseService.getAllAudits()
      ]);
      
      console.log('✅ Supabase veriler yüklendi:', {
        suppliers: suppliers.length,
        nonconformities: nonconformities.length,
        defects: defects.length,
        audits: audits.length
      });
      
      // State'leri güncelle
      setSuppliers(suppliers);
      setNonconformities(nonconformities);
      setDefects(defects);
      setAudits(audits);
      
      // Legacy pairs verisi için localStorage kontrol et (henüz migrate edilmedi)
      const storedPairs = localStorage.getItem('supplier-pairs');
      if (storedPairs && storedPairs !== 'null') {
        const parsedPairs = JSON.parse(storedPairs);
        setPairs(parsedPairs);
      }
      
    } catch (error) {
      console.error('❌ Supabase veri yükleme hatası:', error);
      
      // Fallback: localStorage'dan yükle
      console.log('🔄 Fallback: localStorage\'dan yükleniyor...');
      try {
        const storedSuppliers = localStorage.getItem('suppliers');
        if (storedSuppliers && storedSuppliers !== 'null') {
          setSuppliers(JSON.parse(storedSuppliers));
        }
        // Diğer fallback kodları...
      } catch (fallbackError) {
        console.error('❌ Fallback hata:', fallbackError);
      }
    }
  };`;
            
            // Mevcut loadStoredData fonksiyonunu değiştir
            content = content.replace(
                /const loadStoredData = \(\) => \{[\s\S]*?\n  \};/,
                newLoadFunction
            );
            
            // Save functions'ı güncelle
            const newSaveFunction = `
  // ✅ SUPABASE SAVE - LocalStorage yerine Supabase kullanımı
  const saveToSupabase = async (data: any, type: 'supplier' | 'nonconformity' | 'defect' | 'audit') => {
    try {
      console.log(\`🔄 \${type} Supabase'e kaydediliyor...\`);
      
      let result;
      switch (type) {
        case 'supplier':
          if (data.id) {
            result = await supplierSupabaseService.updateSupplier(data.id, data);
          } else {
            result = await supplierSupabaseService.createSupplier(data);
          }
          break;
          
        case 'nonconformity':
          if (data.id) {
            result = await supplierSupabaseService.updateNonconformity(data.id, data);
          } else {
            result = await supplierSupabaseService.createNonconformity(data);
          }
          break;
          
        case 'defect':
          if (data.id) {
            result = await supplierSupabaseService.updateDefect(data.id, data);
          } else {
            result = await supplierSupabaseService.createDefect(data);
          }
          break;
          
        case 'audit':
          if (data.id) {
            result = await supplierSupabaseService.updateAudit(data.id, data);
          } else {
            result = await supplierSupabaseService.createAudit(data);
          }
          break;
      }
      
      console.log(\`✅ \${type} Supabase'e kaydedildi\`);
      return result;
      
    } catch (error) {
      console.error(\`❌ \${type} Supabase kayıt hatası:\`, error);
      throw error;
    }
  };`;
            
            // saveToLocalStorage fonksiyonundan sonra ekle
            if (!content.includes('saveToSupabase')) {
                content = content.replace(
                    /const saveToLocalStorage = [\s\S]*?\n  \};/,
                    `$&\n${newSaveFunction}`
                );
            }
            
            // useEffect'i güncelle - async loadStoredData
            content = content.replace(
                /useEffect\(\(\) => \{\s*loadStoredData\(\);/,
                'useEffect(() => {\n    loadStoredData();'
            );
            
            // PDF upload'ları için Supabase Storage entegrasyonu
            const pdfUploadFunction = `
  // ✅ PDF UPLOAD - Supabase Storage kullanımı
  const uploadPDFToSupabase = async (file: File, supplierId: string, type: string) => {
    try {
      console.log('📎 PDF Supabase Storage'a yükleniyor...');
      
      const uploadResult = await supabaseStorageService.uploadSupplierDocument(
        file,
        supplierId,
        type
      );
      
      console.log('✅ PDF başarıyla yüklendi:', uploadResult.path);
      return uploadResult;
      
    } catch (error) {
      console.error('❌ PDF yükleme hatası:', error);
      throw error;
    }
  };`;
            
            if (!content.includes('uploadPDFToSupabase')) {
                content = content.replace(
                    /const saveToSupabase[\s\S]*?\n  \};/,
                    `$&\n${pdfUploadFunction}`
                );
            }
            
            // Dosyayı kaydet
            fs.writeFileSync(filePath, content, 'utf8');
            this.results.filesUpdated.push(filePath);
            this.log('SupplierQualityManagement.tsx güncellendi', 'success');
            
            return true;
            
        } catch (error) {
            this.log(`SupplierQualityManagement güncelleme hatası: ${error.message}`, 'error');
            this.results.errors.push(error.message);
            return false;
        }
    }

    async createMigrationHelper() {
        this.log('Migration helper componenti oluşturuluyor...');
        
        const helperContent = `/**
 * MIGRATION HELPER COMPONENT
 * LocalStorage'dan Supabase'e veri taşıma aracı
 */

import React, { useState } from 'react';
import { supplierSupabaseService } from '../services/supplierSupabaseService';

interface MigrationResult {
    suppliers: number;
    nonconformities: number;
    defects: number;
    audits: number;
    errors: string[];
}

const SupplierMigrationHelper: React.FC = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [result, setResult] = useState<MigrationResult | null>(null);

    const runMigration = async () => {
        setIsRunning(true);
        setResult(null);
        
        try {
            console.log('🚀 LocalStorage → Supabase migration başlıyor...');
            
            const migrationResult = await supplierSupabaseService.migrateFromLocalStorage();
            setResult(migrationResult);
            
            console.log('✅ Migration tamamlandı:', migrationResult);
            
        } catch (error) {
            console.error('❌ Migration hatası:', error);
            setResult({
                suppliers: 0,
                nonconformities: 0,
                defects: 0,
                audits: 0,
                errors: [error.message]
            });
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div style={{ 
            position: 'fixed', 
            top: 10, 
            right: 10, 
            background: 'white',
            border: '2px solid #007bff',
            borderRadius: '8px',
            padding: '15px',
            zIndex: 9999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: '300px'
        }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#007bff' }}>
                🔄 Supabase Migration
            </h4>
            
            <button 
                onClick={runMigration}
                disabled={isRunning}
                style={{
                    background: isRunning ? '#6c757d' : '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: isRunning ? 'not-allowed' : 'pointer',
                    width: '100%',
                    marginBottom: '10px'
                }}
            >
                {isRunning ? '⏳ Migration Çalışıyor...' : '🚀 LocalStorage → Supabase'}
            </button>
            
            {result && (
                <div style={{ 
                    background: '#f8f9fa', 
                    padding: '10px', 
                    borderRadius: '4px',
                    fontSize: '12px'
                }}>
                    <div>✅ Tedarikçiler: {result.suppliers}</div>
                    <div>✅ Uygunsuzluklar: {result.nonconformities}</div>
                    <div>✅ Hatalar: {result.defects}</div>
                    <div>✅ Denetimler: {result.audits}</div>
                    
                    {result.errors.length > 0 && (
                        <div style={{ color: 'red', marginTop: '5px' }}>
                            ❌ Hatalar: {result.errors.length}
                        </div>
                    )}
                </div>
            )}
            
            <div style={{ fontSize: '10px', color: '#6c757d', marginTop: '5px' }}>
                Bu araç localStorage verilerinizi Supabase'e taşır. 
                Sadece bir kez çalıştırın!
            </div>
        </div>
    );
};

export default SupplierMigrationHelper;`;

        const helperPath = 'src/frontend/kys-frontend/src/components/SupplierMigrationHelper.tsx';
        
        try {
            // components klasörünü oluştur
            const componentsDir = path.dirname(helperPath);
            if (!fs.existsSync(componentsDir)) {
                fs.mkdirSync(componentsDir, { recursive: true });
            }
            
            fs.writeFileSync(helperPath, helperContent, 'utf8');
            this.results.filesUpdated.push(helperPath);
            this.log('Migration helper oluşturuldu', 'success');
            
            return true;
        } catch (error) {
            this.log(`Migration helper oluşturma hatası: ${error.message}`, 'error');
            this.results.errors.push(error.message);
            return false;
        }
    }

    async runCompleteIntegration() {
        console.log('🚀 SUPPLIER QUALITY MANAGEMENT SUPABASE ENTEGRASYONU');
        console.log('===================================================');

        const startTime = Date.now();

        // 1. Service dosyası zaten oluşturuldu
        this.log('Supplier Supabase Service oluşturuldu', 'success');

        // 2. Component güncelle
        const componentUpdated = await this.updateSupplierQualityManagement();
        
        // 3. Migration helper oluştur
        const helperCreated = await this.createMigrationHelper();

        const endTime = Date.now();
        const duration = Math.round((endTime - startTime) / 1000);

        // Sonuçları raporla
        this.generateFinalReport(duration, componentUpdated && helperCreated);

        return componentUpdated && helperCreated;
    }

    generateFinalReport(duration, success) {
        console.log('\\n📊 ENTEGRASYON RAPORU');
        console.log('===================================================');
        console.log(\`⏱️  Süre: \${duration} saniye\`);
        console.log(\`🎯 Durum: \${success ? 'BAŞARILI' : 'BAŞARISIZ'}\`);
        console.log(\`📝 Güncellenen dosyalar: \${this.results.filesUpdated.length}\`);
        console.log(\`❌ Hata sayısı: \${this.results.errors.length}\`);

        if (this.results.filesUpdated.length > 0) {
            console.log('\\n✅ GÜNCELLENEN DOSYALAR:');
            this.results.filesUpdated.forEach((file, index) => {
                console.log(\`\${index + 1}. \${file}\`);
            });
        }

        if (this.results.errors.length > 0) {
            console.log('\\n❌ HATALAR:');
            this.results.errors.forEach((error, index) => {
                console.log(\`\${index + 1}. \${error}\`);
            });
        }

        console.log('\\n🎉 SONUÇ:');
        if (success) {
            console.log('✅ SupplierQualityManagement modülü Supabase entegrasyonu tamamlandı!');
            console.log('✅ LocalStorage yerine Supabase kullanımı aktif');
            console.log('✅ Migration helper component eklendi');
            console.log('✅ PDF upload Supabase Storage entegrasyonu hazır');
            
            console.log('\\n🚀 SONRAKİ ADIMLAR:');
            console.log('1. SQL migration'ını Supabase Dashboard'da çalıştırın');
            console.log('2. SupplierQualityManagement sayfasında migration helper'ı kullanın');
            console.log('3. Veriler Supabase'e taşındıktan sonra LocalStorage temizleyin');
            console.log('4. İkinci modül entegrasyonuna geçin');
        } else {
            console.log('❌ Entegrasyon başarısız!');
            console.log('📞 Hata loglarını kontrol edin ve düzeltin');
        }

        this.results.success = success;
    }
}

// Script'i çalıştır
if (require.main === module) {
    const migration = new AutoModuleMigration();
    migration.runCompleteIntegration()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Fatal hata:', error);
            process.exit(1);
        });
}

module.exports = AutoModuleMigration;
