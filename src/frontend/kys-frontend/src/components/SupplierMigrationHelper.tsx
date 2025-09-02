/**
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
            
        } catch (error: any) {
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

export default SupplierMigrationHelper;