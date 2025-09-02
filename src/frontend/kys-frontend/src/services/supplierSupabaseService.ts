/**
 * SUPPLIER QUALITY MANAGEMENT - SUPABASE SERVICE
 * SupplierQualityManagement modülü için tam Supabase entegrasyonu
 * LocalStorage'ı tamamen değiştirir
 */

import { supabase } from '../config/supabase';
import { kysSupabaseService } from './supabaseService';

// ================================
// TYPE DEFINITIONS
// ================================

export interface Supplier {
    id?: string;
    name: string;
    code: string;
    contact_person: string;
    email: string;
    phone: string;
    address: string;
    is_active?: boolean;
    material_categories: string[];
    notes?: string;
    // Legacy fields for compatibility
    companyName?: string;
    qualificationStatus?: string;
    status?: string;
    currentScore?: number;
    created_at?: string;
    updated_at?: string;
}

export interface SupplierNonconformity {
    id?: string;
    supplier_id: string;
    supplier_name: string;
    nonconformity_number: string;
    detected_date: string;
    material_code?: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    corrective_action?: string;
    responsible_person?: string;
    due_date?: string;
    closed_date?: string;
    root_cause?: string;
    created_at?: string;
    updated_at?: string;
}

export interface SupplierDefect {
    id?: string;
    supplier_id: string;
    supplier_name: string;
    defect_number: string;
    detected_date: string;
    material_code?: string;
    batch_number?: string;
    defect_type: string;
    description: string;
    quantity_affected: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    cost_impact?: number;
    corrective_action?: string;
    preventive_action?: string;
    responsible_person?: string;
    created_at?: string;
    updated_at?: string;
}

export interface SupplierAudit {
    id?: string;
    supplier_id: string;
    supplier_name: string;
    audit_number: string;
    audit_type: 'internal' | 'external' | 'certification' | 'surveillance';
    planned_date: string;
    actual_date?: string;
    auditor_name: string;
    audit_scope: string;
    status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
    findings: any[];
    score?: number;
    grade?: string;
    next_audit_date?: string;
    certificate_expiry?: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
}

// ================================
// SUPPLIER SERVICE CLASS
// ================================

class SupplierSupabaseService {
    
    // ================================
    // SUPPLIER OPERATIONS
    // ================================
    
    async getAllSuppliers(): Promise<Supplier[]> {
        try {
            const { data, error } = await supabase
                .from('suppliers')
                .select('*')
                .order('name');
                
            if (error) throw error;
            
            // Legacy fields için mapping
            return data.map(supplier => ({
                ...supplier,
                companyName: supplier.name, // Legacy compatibility
                qualificationStatus: supplier.is_active ? 'qualified' : 'pending',
                status: supplier.is_active ? 'approved' : 'pending'
            }));
        } catch (error) {
            console.error('❌ Tedarikçiler yüklenirken hata:', error);
            throw error;
        }
    }
    
    async getSupplierById(id: string): Promise<Supplier | null> {
        try {
            const { data, error } = await supabase
                .from('suppliers')
                .select('*')
                .eq('id', id)
                .single();
                
            if (error) throw error;
            
            return {
                ...data,
                companyName: data.name,
                qualificationStatus: data.is_active ? 'qualified' : 'pending',
                status: data.is_active ? 'approved' : 'pending'
            };
        } catch (error) {
            console.error('❌ Tedarikçi yüklenirken hata:', error);
            return null;
        }
    }
    
    async createSupplier(supplier: Omit<Supplier, 'id'>): Promise<Supplier> {
        try {
            const supplierData = {
                name: supplier.companyName || supplier.name,
                code: supplier.code,
                contact_person: supplier.contact_person,
                email: supplier.email,
                phone: supplier.phone,
                address: supplier.address,
                material_categories: supplier.material_categories || [],
                notes: supplier.notes,
                is_active: true
            };
            
            const { data, error } = await supabase
                .from('suppliers')
                .insert([supplierData])
                .select()
                .single();
                
            if (error) throw error;
            
            console.log('✅ Yeni tedarikçi oluşturuldu:', data.name);
            return {
                ...data,
                companyName: data.name,
                qualificationStatus: 'qualified',
                status: 'approved'
            };
        } catch (error) {
            console.error('❌ Tedarikçi oluşturulurken hata:', error);
            throw error;
        }
    }
    
    async updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier> {
        try {
            const updateData: any = {};
            
            if (updates.name || updates.companyName) {
                updateData.name = updates.name || updates.companyName;
            }
            if (updates.code) updateData.code = updates.code;
            if (updates.contact_person) updateData.contact_person = updates.contact_person;
            if (updates.email) updateData.email = updates.email;
            if (updates.phone) updateData.phone = updates.phone;
            if (updates.address) updateData.address = updates.address;
            if (updates.material_categories) updateData.material_categories = updates.material_categories;
            if (updates.notes !== undefined) updateData.notes = updates.notes;
            if (updates.is_active !== undefined) updateData.is_active = updates.is_active;
            
            const { data, error } = await supabase
                .from('suppliers')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();
                
            if (error) throw error;
            
            console.log('✅ Tedarikçi güncellendi:', data.name);
            return {
                ...data,
                companyName: data.name,
                qualificationStatus: data.is_active ? 'qualified' : 'pending',
                status: data.is_active ? 'approved' : 'pending'
            };
        } catch (error) {
            console.error('❌ Tedarikçi güncellenirken hata:', error);
            throw error;
        }
    }
    
    async deleteSupplier(id: string): Promise<boolean> {
        try {
            // Soft delete - is_active = false
            const { error } = await supabase
                .from('suppliers')
                .update({ is_active: false })
                .eq('id', id);
                
            if (error) throw error;
            
            console.log('✅ Tedarikçi pasifleştirildi');
            return true;
        } catch (error) {
            console.error('❌ Tedarikçi silinirken hata:', error);
            return false;
        }
    }
    
    // ================================
    // NONCONFORMITY OPERATIONS
    // ================================
    
    async getAllNonconformities(): Promise<SupplierNonconformity[]> {
        try {
            const { data, error } = await supabase
                .from('supplier_nonconformities')
                .select('*')
                .order('detected_date', { ascending: false });
                
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Uygunsuzluklar yüklenirken hata:', error);
            return [];
        }
    }
    
    async createNonconformity(nonconformity: Omit<SupplierNonconformity, 'id'>): Promise<SupplierNonconformity> {
        try {
            const { data, error } = await supabase
                .from('supplier_nonconformities')
                .insert([nonconformity])
                .select()
                .single();
                
            if (error) throw error;
            
            console.log('✅ Yeni uygunsuzluk kaydı oluşturuldu');
            return data;
        } catch (error) {
            console.error('❌ Uygunsuzluk oluşturulurken hata:', error);
            throw error;
        }
    }
    
    async updateNonconformity(id: string, updates: Partial<SupplierNonconformity>): Promise<SupplierNonconformity> {
        try {
            const { data, error } = await supabase
                .from('supplier_nonconformities')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
                
            if (error) throw error;
            
            console.log('✅ Uygunsuzluk güncellendi');
            return data;
        } catch (error) {
            console.error('❌ Uygunsuzluk güncellenirken hata:', error);
            throw error;
        }
    }
    
    // ================================
    // DEFECT OPERATIONS
    // ================================
    
    async getAllDefects(): Promise<SupplierDefect[]> {
        try {
            const { data, error } = await supabase
                .from('supplier_defects')
                .select('*')
                .order('detected_date', { ascending: false });
                
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Hatalar yüklenirken hata:', error);
            return [];
        }
    }
    
    async createDefect(defect: Omit<SupplierDefect, 'id'>): Promise<SupplierDefect> {
        try {
            const { data, error } = await supabase
                .from('supplier_defects')
                .insert([defect])
                .select()
                .single();
                
            if (error) throw error;
            
            console.log('✅ Yeni hata kaydı oluşturuldu');
            return data;
        } catch (error) {
            console.error('❌ Hata oluşturulurken hata:', error);
            throw error;
        }
    }
    
    async updateDefect(id: string, updates: Partial<SupplierDefect>): Promise<SupplierDefect> {
        try {
            const { data, error } = await supabase
                .from('supplier_defects')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
                
            if (error) throw error;
            
            console.log('✅ Hata güncellendi');
            return data;
        } catch (error) {
            console.error('❌ Hata güncellenirken hata:', error);
            throw error;
        }
    }
    
    // ================================
    // AUDIT OPERATIONS  
    // ================================
    
    async getAllAudits(): Promise<SupplierAudit[]> {
        try {
            const { data, error } = await supabase
                .from('supplier_audits')
                .select('*')
                .order('planned_date', { ascending: false });
                
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Denetimler yüklenirken hata:', error);
            return [];
        }
    }
    
    async createAudit(audit: Omit<SupplierAudit, 'id'>): Promise<SupplierAudit> {
        try {
            const { data, error } = await supabase
                .from('supplier_audits')
                .insert([audit])
                .select()
                .single();
                
            if (error) throw error;
            
            console.log('✅ Yeni denetim kaydı oluşturuldu');
            return data;
        } catch (error) {
            console.error('❌ Denetim oluşturulurken hata:', error);
            throw error;
        }
    }
    
    async updateAudit(id: string, updates: Partial<SupplierAudit>): Promise<SupplierAudit> {
        try {
            const { data, error } = await supabase
                .from('supplier_audits')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
                
            if (error) throw error;
            
            console.log('✅ Denetim güncellendi');
            return data;
        } catch (error) {
            console.error('❌ Denetim güncellenirken hata:', error);
            throw error;
        }
    }
    
    // ================================
    // MIGRATION HELPERS
    // ================================
    
    async migrateFromLocalStorage(): Promise<{
        suppliers: number;
        nonconformities: number;
        defects: number;
        audits: number;
        errors: string[];
    }> {
        const results = {
            suppliers: 0,
            nonconformities: 0,
            defects: 0,
            audits: 0,
            errors: [] as string[]
        };
        
        try {
            // Suppliers migration
            const storedSuppliers = localStorage.getItem('suppliers');
            if (storedSuppliers && storedSuppliers !== 'null') {
                try {
                    const suppliers = JSON.parse(storedSuppliers);
                    for (const supplier of suppliers) {
                        try {
                            await this.createSupplier(supplier);
                            results.suppliers++;
                        } catch (error: any) {
                            results.errors.push(`Supplier migration error: ${error.message}`);
                        }
                    }
                } catch (error: any) {
                    results.errors.push(`Suppliers parse error: ${error.message}`);
                }
            }
            
            // Nonconformities migration
            const storedNonconformities = localStorage.getItem('supplier-nonconformities');
            if (storedNonconformities && storedNonconformities !== 'null') {
                try {
                    const nonconformities = JSON.parse(storedNonconformities);
                    for (const nc of nonconformities) {
                        try {
                            await this.createNonconformity(nc);
                            results.nonconformities++;
                        } catch (error: any) {
                            results.errors.push(`Nonconformity migration error: ${error.message}`);
                        }
                    }
                } catch (error: any) {
                    results.errors.push(`Nonconformities parse error: ${error.message}`);
                }
            }
            
            // Defects migration
            const storedDefects = localStorage.getItem('supplier-defects');
            if (storedDefects && storedDefects !== 'null') {
                try {
                    const defects = JSON.parse(storedDefects);
                    for (const defect of defects) {
                        try {
                            await this.createDefect(defect);
                            results.defects++;
                        } catch (error: any) {
                            results.errors.push(`Defect migration error: ${error.message}`);
                        }
                    }
                } catch (error: any) {
                    results.errors.push(`Defects parse error: ${error.message}`);
                }
            }
            
            // Audits migration
            const storedAudits = localStorage.getItem('supplier-audits');
            if (storedAudits && storedAudits !== 'null') {
                try {
                    const audits = JSON.parse(storedAudits);
                    for (const audit of audits) {
                        try {
                            await this.createAudit(audit);
                            results.audits++;
                        } catch (error: any) {
                            results.errors.push(`Audit migration error: ${error.message}`);
                        }
                    }
                } catch (error: any) {
                    results.errors.push(`Audits parse error: ${error.message}`);
                }
            }
            
            console.log('✅ LocalStorage migration completed:', results);
            return results;
            
        } catch (error: any) {
            results.errors.push(`Migration error: ${error.message}`);
            console.error('❌ Migration failed:', error);
            return results;
        }
    }
}

// ================================
// EXPORT SINGLETON
// ================================

export const supplierSupabaseService = new SupplierSupabaseService();
export default supplierSupabaseService;
