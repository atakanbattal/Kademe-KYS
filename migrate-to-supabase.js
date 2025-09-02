/**
 * SUPABASE MIGRATION HELPER SCRIPT
 * Bu script mevcut LocalStorage/IndexedDB verilerini Supabase'e aktarır
 * 
 * Kullanım:
 * 1. Browser Developer Console'da çalıştırın
 * 2. Veya Node.js script olarak kullanın
 */

// ================================
// SUPABASE CONFIGURATION
// ================================
const SUPABASE_CONFIG = {
    url: 'https://your-project-id.supabase.co',
    anonKey: 'your-anon-key-here'
};

// ================================
// MIGRATION UTILITIES
// ================================
class SupabaseMigrator {
    constructor(config) {
        this.config = config;
        this.migratedData = {};
        this.errors = [];
    }

    // LocalStorage verilerini oku
    readLocalStorageData() {
        const keys = [
            'suppliers',
            'vehicles', 
            'materialControls',
            'qualityReports',
            'tankTests',
            'deviationApprovals',
            'dofRecords',
            'qualityCosts',
            'quarantineRecords',
            'fanTests',
            'equipmentCalibrations',
            'documents',
            'trainingRecords',
            'riskAssessments',
            'users'
        ];

        const data = {};
        keys.forEach(key => {
            try {
                const stored = localStorage.getItem(key);
                if (stored) {
                    data[key] = JSON.parse(stored);
                    console.log(`📦 ${key}: ${data[key].length} kayıt bulundu`);
                }
            } catch (error) {
                console.error(`❌ ${key} verisi okunamadı:`, error);
                this.errors.push(`LocalStorage ${key} read error: ${error.message}`);
            }
        });

        return data;
    }

    // IndexedDB verilerini oku (Promise tabanlı)
    async readIndexedDBData() {
        const databases = [
            'SupplierQualityDB',
            'VehicleQualityDB', 
            'MaterialQualityDB',
            'QualityReportsDB',
            'TankTestDB',
            'DocumentDB'
        ];

        const data = {};

        for (const dbName of databases) {
            try {
                const dbData = await this.readFromIndexedDB(dbName);
                if (dbData && Object.keys(dbData).length > 0) {
                    data[dbName] = dbData;
                    console.log(`📦 ${dbName}: veri bulundu`);
                }
            } catch (error) {
                console.error(`❌ ${dbName} verisi okunamadı:`, error);
                this.errors.push(`IndexedDB ${dbName} read error: ${error.message}`);
            }
        }

        return data;
    }

    // IndexedDB'den veri okuma helper
    readFromIndexedDB(dbName) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName);
            
            request.onerror = () => reject(request.error);
            
            request.onsuccess = () => {
                const db = request.result;
                const data = {};
                
                const storeNames = Array.from(db.objectStoreNames);
                let completed = 0;
                
                if (storeNames.length === 0) {
                    resolve(data);
                    return;
                }
                
                storeNames.forEach(storeName => {
                    const transaction = db.transaction([storeName], 'readonly');
                    const store = transaction.objectStore(storeName);
                    const getAllRequest = store.getAll();
                    
                    getAllRequest.onsuccess = () => {
                        data[storeName] = getAllRequest.result;
                        completed++;
                        
                        if (completed === storeNames.length) {
                            db.close();
                            resolve(data);
                        }
                    };
                    
                    getAllRequest.onerror = () => {
                        console.error(`Error reading store ${storeName}`);
                        completed++;
                        
                        if (completed === storeNames.length) {
                            db.close();
                            resolve(data);
                        }
                    };
                });
            };
        });
    }

    // Veri dönüşümü (local format -> Supabase format)
    transformDataForSupabase(localData) {
        const transformed = {};

        // Suppliers transformation
        if (localData.suppliers) {
            transformed.suppliers = localData.suppliers.map(supplier => ({
                supplier_code: supplier.code || supplier.supplierCode,
                supplier_name: supplier.name || supplier.supplierName,
                contact_person: supplier.contactPerson,
                email: supplier.email,
                phone: supplier.phone,
                address: supplier.address,
                supplier_type: supplier.type || 'material',
                quality_rating: supplier.qualityRating || 0,
                is_active: supplier.isActive !== false,
                notes: supplier.notes
            }));
        }

        // Vehicles transformation
        if (localData.vehicles) {
            transformed.vehicle_quality_controls = localData.vehicles.map(vehicle => ({
                vehicle_name: vehicle.vehicleName,
                vehicle_model: vehicle.vehicleModel,
                serial_number: vehicle.serialNumber,
                customer_name: vehicle.customerName,
                sps_number: vehicle.spsNumber,
                production_date: vehicle.productionDate,
                description: vehicle.description,
                current_status: vehicle.currentStatus || 'production',
                defects: vehicle.defects || [],
                status_history: vehicle.statusHistory || []
            }));
        }

        // Material Controls transformation
        if (localData.materialControls) {
            transformed.material_quality_controls = localData.materialControls.map(material => ({
                material_code: material.materialCode,
                material_name: material.materialName,
                supplier_id: material.supplierId, // Bu ID mapping gerekebilir
                supplier_name: material.supplierName,
                batch_number: material.batchNumber,
                received_date: material.receivedDate,
                inspection_date: material.inspectionDate,
                inspector_id: material.inspectorId, // Bu ID mapping gerekebilir
                certificate_number: material.certificateNumber,
                certificate_properties: material.certificateProperties || [],
                status: material.status || 'pending'
            }));
        }

        // Quality Reports transformation
        if (localData.qualityReports) {
            transformed.quality_control_reports = localData.qualityReports.map(report => ({
                material_quality_control_id: report.materialControlId,
                material_code: report.materialCode,
                material_name: report.materialName,
                supplier_name: report.supplierName,
                batch_number: report.batchNumber,
                test_operator: report.testOperator,
                quality_controller: report.qualityController,
                overall_quality_grade: report.overallGrade,
                standard_reference: report.standardReference,
                test_results: report.testResults || {},
                conclusion: report.conclusion,
                created_by: report.createdBy
            }));
        }

        return transformed;
    }

    // Supabase'e veri yükleme
    async uploadToSupabase(transformedData) {
        console.log('🚀 Supabase\'e veri yükleme başlıyor...');

        const results = {};

        for (const [tableName, records] of Object.entries(transformedData)) {
            if (!records || records.length === 0) continue;

            try {
                console.log(`📤 ${tableName} tablosuna ${records.length} kayıt yükleniyor...`);
                
                // Batch insert (her seferinde 100 kayıt)
                const batchSize = 100;
                let uploaded = 0;

                for (let i = 0; i < records.length; i += batchSize) {
                    const batch = records.slice(i, i + batchSize);
                    
                    const response = await fetch(`${this.config.url}/rest/v1/${tableName}`, {
                        method: 'POST',
                        headers: {
                            'apikey': this.config.anonKey,
                            'Authorization': `Bearer ${this.config.anonKey}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify(batch)
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`HTTP ${response.status}: ${errorText}`);
                    }

                    uploaded += batch.length;
                    console.log(`✅ ${tableName}: ${uploaded}/${records.length} yüklendi`);
                }

                results[tableName] = {
                    success: true,
                    uploaded: uploaded,
                    total: records.length
                };

            } catch (error) {
                console.error(`❌ ${tableName} yüklenirken hata:`, error);
                results[tableName] = {
                    success: false,
                    error: error.message,
                    total: records.length
                };
                this.errors.push(`Upload ${tableName} error: ${error.message}`);
            }
        }

        return results;
    }

    // Ana migration fonksiyonu
    async migrate() {
        console.log('🔄 Migration başlıyor...');
        
        try {
            // 1. Local verileri oku
            console.log('📖 Local veriler okunuyor...');
            const localStorageData = this.readLocalStorageData();
            const indexedDBData = await this.readIndexedDBData();

            // 2. Verileri birleştir
            const allLocalData = { ...localStorageData, ...indexedDBData };
            
            if (Object.keys(allLocalData).length === 0) {
                console.log('⚠️ Local veri bulunamadı');
                return { success: false, message: 'No local data found' };
            }

            // 3. Supabase formatına dönüştür
            console.log('🔄 Veriler dönüştürülüyor...');
            const transformedData = this.transformDataForSupabase(allLocalData);

            // 4. Supabase'e yükle
            const uploadResults = await this.uploadToSupabase(transformedData);

            // 5. Sonuçları raporla
            this.generateReport(uploadResults);

            return {
                success: this.errors.length === 0,
                results: uploadResults,
                errors: this.errors
            };

        } catch (error) {
            console.error('💥 Migration hatası:', error);
            return {
                success: false,
                error: error.message,
                errors: this.errors
            };
        }
    }

    // Migration raporu oluştur
    generateReport(results) {
        console.log('\n📊 MIGRATION RAPORU');
        console.log('====================');

        let totalSuccess = 0;
        let totalFailed = 0;
        let totalRecords = 0;

        for (const [tableName, result] of Object.entries(results)) {
            const status = result.success ? '✅' : '❌';
            const uploaded = result.uploaded || 0;
            const total = result.total || 0;
            
            console.log(`${status} ${tableName}: ${uploaded}/${total}`);
            
            if (result.success) {
                totalSuccess += uploaded;
            } else {
                totalFailed += total;
                console.log(`   Error: ${result.error}`);
            }
            
            totalRecords += total;
        }

        console.log('====================');
        console.log(`📈 Toplam: ${totalRecords} kayıt`);
        console.log(`✅ Başarılı: ${totalSuccess} kayıt`);
        console.log(`❌ Başarısız: ${totalFailed} kayıt`);
        console.log(`📊 Başarı oranı: ${Math.round((totalSuccess / totalRecords) * 100)}%`);

        if (this.errors.length > 0) {
            console.log('\n❌ HATALAR:');
            this.errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        }
    }

    // Local verileri temizle (migration sonrası)
    cleanupLocalData() {
        const confirm = window.confirm(
            '⚠️ Local veriler temizlenecek. Bu işlem geri alınamaz. Devam edilsin mi?'
        );

        if (!confirm) return false;

        // LocalStorage temizle
        const localStorageKeys = [
            'suppliers', 'vehicles', 'materialControls', 'qualityReports',
            'tankTests', 'deviationApprovals', 'dofRecords', 'qualityCosts',
            'quarantineRecords', 'fanTests', 'equipmentCalibrations',
            'documents', 'trainingRecords', 'riskAssessments', 'users'
        ];

        localStorageKeys.forEach(key => {
            localStorage.removeItem(key);
        });

        // IndexedDB temizle
        const dbNames = [
            'SupplierQualityDB', 'VehicleQualityDB', 'MaterialQualityDB',
            'QualityReportsDB', 'TankTestDB', 'DocumentDB'
        ];

        dbNames.forEach(dbName => {
            indexedDB.deleteDatabase(dbName);
        });

        console.log('🧹 Local veriler temizlendi');
        return true;
    }
}

// ================================
// SCRIPT EXECUTION
// ================================

// Browser'da çalıştırmak için
if (typeof window !== 'undefined') {
    // Global scope'a ekle
    window.SupabaseMigrator = SupabaseMigrator;
    
    // Hızlı başlatma fonksiyonu
    window.startMigration = async function() {
        const migrator = new SupabaseMigrator(SUPABASE_CONFIG);
        const result = await migrator.migrate();
        
        if (result.success) {
            console.log('🎉 Migration başarıyla tamamlandı!');
            
            const cleanup = confirm('Local veriler temizlensin mi?');
            if (cleanup) {
                migrator.cleanupLocalData();
            }
        } else {
            console.log('💥 Migration başarısız oldu. Hataları kontrol edin.');
        }
        
        return result;
    };

    console.log(`
🚀 SUPABASE MIGRATION HELPER HAZIR

Kullanım:
1. SUPABASE_CONFIG değişkenini güncelleyin
2. startMigration() fonksiyonunu çalıştırın

Örnek:
> startMigration()
    `);
}

// Node.js'de çalıştırmak için
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SupabaseMigrator;
}

// ================================
// MANUAL MIGRATION EXAMPLE
// ================================

/*
// Manuel migration örneği:
const migrator = new SupabaseMigrator({
    url: 'https://your-project.supabase.co',
    anonKey: 'your-anon-key'
});

migrator.migrate().then(result => {
    if (result.success) {
        console.log('Migration başarılı!');
    } else {
        console.log('Migration başarısız:', result.errors);
    }
});
*/
