/**
 * Modül Verileri için Supabase Servisi
 * localStorage yerine Supabase kullanarak veri saklama ve yönetme
 */

import { supabase } from '../config/supabase';

// Generic tip tanımları
export interface BaseRecord {
    id?: string;
    created_at?: string;
    updated_at?: string;
    created_by?: string;
}

// Supplier modülü için tip tanımları
export interface Supplier extends BaseRecord {
    supplier_code: string;
    supplier_name: string;
    contact_person?: string;
    email?: string;
    phone?: string;
    address?: string;
    supplier_type?: string;
    quality_rating?: number;
    certification_level?: string;
    is_active?: boolean;
    risk_level?: string;
    notes?: string;
}

export interface SupplierNonconformity extends BaseRecord {
    supplier_id: string;
    nonconformity_date: string;
    nonconformity_type: string;
    description: string;
    severity?: string;
    status?: string;
    corrective_action?: string;
    responsible_person?: string;
    due_date?: string;
    closed_date?: string;
}

export interface SupplierDefect extends BaseRecord {
    supplier_id: string;
    defect_date: string;
    defect_type: string;
    product_code?: string;
    quantity_defective?: number;
    total_quantity?: number;
    defect_rate?: number;
    cost_impact?: number;
    root_cause?: string;
    corrective_action?: string;
    status?: string;
}

export interface SupplierAudit extends BaseRecord {
    supplier_id: string;
    audit_date: string;
    audit_type: string;
    auditor_name?: string;
    audit_score?: number;
    findings?: string;
    recommendations?: string;
    next_audit_date?: string;
    certificate_valid_until?: string;
    status?: string;
}

// DOF 8D için tip tanımları
export interface DOFRecord extends BaseRecord {
    dof_number: string;
    problem_description: string;
    customer_name?: string;
    product_code?: string;
    problem_date?: string;
    priority_level?: string;
    status?: string;
    team_members?: string[];
    step_1_team?: string;
    step_2_problem?: string;
    step_3_interim_action?: string;
    step_4_root_cause?: string;
    step_5_permanent_action?: string;
    step_6_implementation?: string;
    step_7_prevention?: string;
    step_8_closure?: string;
    completion_percentage?: number;
    estimated_cost?: number;
    actual_cost?: number;
    due_date?: string;
    closed_date?: string;
}

// Karantina için tip tanımları
export interface QuarantineRecord extends BaseRecord {
    quarantine_number: string;
    part_code: string;
    part_name: string;
    quantity: number;
    unit?: string;
    quarantine_reason: string;
    responsible_department?: string;
    supplier_name?: string;
    production_order?: string;
    inspection_type?: string;
    inspection_date?: string;
    inspector_name?: string;
    inspection_results?: string;
    material_type?: string;
    vehicle_model?: string;
    location?: string;
    status?: string;
    disposition?: string;
    disposition_reason?: string;
    release_date?: string;
    notes?: string;
    customer_name?: string;
    drawing_number?: string;
    revision?: string;
    priority?: string;
    estimated_cost?: number;
    risk_level?: string;
    immediate_action?: string;
    containment_action?: string;
    root_cause?: string;
    preventive_action?: string;
}

// Generic CRUD operasyonları
class ModuleDataService {
    // Generic GET all records
    async getAll<T extends BaseRecord>(tableName: string): Promise<T[]> {
        try {
            console.log(`📥 ${tableName} tablosundan veriler getiriliyor...`);
            
            const { data, error } = await supabase
                .from(tableName)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error(`❌ ${tableName} verileri getirilemedi:`, error);
                throw error;
            }

            console.log(`✅ ${tableName} verileri başarıyla getirildi: ${data?.length || 0} kayıt`);
            return data || [];
        } catch (error) {
            console.error(`❌ ${tableName} GET ALL hatası:`, error);
            return [];
        }
    }

    // Generic GET by ID
    async getById<T extends BaseRecord>(tableName: string, id: string): Promise<T | null> {
        try {
            const { data, error } = await supabase
                .from(tableName)
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error(`❌ ${tableName} kayıt bulunamadı (ID: ${id}):`, error);
                return null;
            }

            return data;
        } catch (error) {
            console.error(`❌ ${tableName} GET BY ID hatası:`, error);
            return null;
        }
    }

    // Generic CREATE
    async create<T extends BaseRecord>(tableName: string, record: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T | null> {
        try {
            console.log(`➕ ${tableName} tablosuna yeni kayıt ekleniyor...`);
            
            const { data, error } = await supabase
                .from(tableName)
                .insert(record)
                .select()
                .single();

            if (error) {
                console.error(`❌ ${tableName} kayıt eklenemedi:`, error);
                throw error;
            }

            console.log(`✅ ${tableName} kaydı başarıyla eklendi:`, data?.id);
            return data;
        } catch (error) {
            console.error(`❌ ${tableName} CREATE hatası:`, error);
            return null;
        }
    }

    // Generic UPDATE
    async update<T extends BaseRecord>(tableName: string, id: string, updates: Partial<T>): Promise<T | null> {
        try {
            console.log(`🔄 ${tableName} kaydı güncelleniyor (ID: ${id})...`);
            
            const { data, error } = await supabase
                .from(tableName)
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error(`❌ ${tableName} kayıt güncellenemedi:`, error);
                throw error;
            }

            console.log(`✅ ${tableName} kaydı başarıyla güncellendi:`, data?.id);
            return data;
        } catch (error) {
            console.error(`❌ ${tableName} UPDATE hatası:`, error);
            return null;
        }
    }

    // Generic DELETE
    async delete(tableName: string, id: string): Promise<boolean> {
        try {
            console.log(`🗑️ ${tableName} kaydı siliniyor (ID: ${id})...`);
            
            const { error } = await supabase
                .from(tableName)
                .delete()
                .eq('id', id);

            if (error) {
                console.error(`❌ ${tableName} kayıt silinemedi:`, error);
                throw error;
            }

            console.log(`✅ ${tableName} kaydı başarıyla silindi`);
            return true;
        } catch (error) {
            console.error(`❌ ${tableName} DELETE hatası:`, error);
            return false;
        }
    }

    // SUPPLIER SPECIFIC METHODS
    async getSuppliers(): Promise<Supplier[]> {
        return this.getAll<Supplier>('suppliers');
    }

    async createSupplier(supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier | null> {
        return this.create<Supplier>('suppliers', supplier);
    }

    async updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier | null> {
        return this.update<Supplier>('suppliers', id, updates);
    }

    async deleteSupplier(id: string): Promise<boolean> {
        return this.delete('suppliers', id);
    }

    // SUPPLIER NONCONFORMITIES
    async getSupplierNonconformities(supplierId?: string): Promise<SupplierNonconformity[]> {
        try {
            let query = supabase
                .from('supplier_nonconformities')
                .select('*')
                .order('nonconformity_date', { ascending: false });

            if (supplierId) {
                query = query.eq('supplier_id', supplierId);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Supplier nonconformities getirilemedi:', error);
            return [];
        }
    }

    async createSupplierNonconformity(nonconformity: Omit<SupplierNonconformity, 'id' | 'created_at' | 'updated_at'>): Promise<SupplierNonconformity | null> {
        return this.create<SupplierNonconformity>('supplier_nonconformities', nonconformity);
    }

    // SUPPLIER DEFECTS
    async getSupplierDefects(supplierId?: string): Promise<SupplierDefect[]> {
        try {
            let query = supabase
                .from('supplier_defects')
                .select('*')
                .order('defect_date', { ascending: false });

            if (supplierId) {
                query = query.eq('supplier_id', supplierId);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Supplier defects getirilemedi:', error);
            return [];
        }
    }

    async createSupplierDefect(defect: Omit<SupplierDefect, 'id' | 'created_at' | 'updated_at'>): Promise<SupplierDefect | null> {
        return this.create<SupplierDefect>('supplier_defects', defect);
    }

    // SUPPLIER AUDITS
    async getSupplierAudits(supplierId?: string): Promise<SupplierAudit[]> {
        try {
            let query = supabase
                .from('supplier_audits')
                .select('*')
                .order('audit_date', { ascending: false });

            if (supplierId) {
                query = query.eq('supplier_id', supplierId);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Supplier audits getirilemedi:', error);
            return [];
        }
    }

    async createSupplierAudit(audit: Omit<SupplierAudit, 'id' | 'created_at' | 'updated_at'>): Promise<SupplierAudit | null> {
        return this.create<SupplierAudit>('supplier_audits', audit);
    }

    // DOF RECORDS
    async getDOFRecords(): Promise<DOFRecord[]> {
        return this.getAll<DOFRecord>('dof_records');
    }

    async createDOFRecord(dofRecord: Omit<DOFRecord, 'id' | 'created_at' | 'updated_at'>): Promise<DOFRecord | null> {
        return this.create<DOFRecord>('dof_records', dofRecord);
    }

    async updateDOFRecord(id: string, updates: Partial<DOFRecord>): Promise<DOFRecord | null> {
        return this.update<DOFRecord>('dof_records', id, updates);
    }

    // QUARANTINE RECORDS
    async getQuarantineRecords(): Promise<QuarantineRecord[]> {
        return this.getAll<QuarantineRecord>('quarantine_records');
    }

    async createQuarantineRecord(quarantineRecord: Omit<QuarantineRecord, 'id' | 'created_at' | 'updated_at'>): Promise<QuarantineRecord | null> {
        return this.create<QuarantineRecord>('quarantine_records', quarantineRecord);
    }

    async updateQuarantineRecord(id: string, updates: Partial<QuarantineRecord>): Promise<QuarantineRecord | null> {
        return this.update<QuarantineRecord>('quarantine_records', id, updates);
    }

    // VERİ MİGRASYONU - localStorage'dan Supabase'e
    async migrateFromLocalStorage(module: string): Promise<void> {
        try {
            console.log(`🔄 ${module} modülü localStorage'dan Supabase'e migrate ediliyor...`);

            switch (module) {
                case 'suppliers':
                    await this.migrateSupplierData();
                    break;
                case 'dof':
                    await this.migrateDOFData();
                    break;
                case 'quarantine':
                    await this.migrateQuarantineData();
                    break;
                default:
                    console.log(`⚠️ ${module} modülü için migration tanımlanmamış`);
            }
        } catch (error) {
            console.error(`❌ ${module} migration hatası:`, error);
        }
    }

    private async migrateSupplierData(): Promise<void> {
        try {
            // localStorage'dan verileri al
            const suppliersData = localStorage.getItem('suppliers');
            const nonconformitiesData = localStorage.getItem('supplier-nonconformities');
            const defectsData = localStorage.getItem('supplier-defects');
            const auditsData = localStorage.getItem('supplier-audits');

            // Suppliers
            if (suppliersData) {
                const suppliers = JSON.parse(suppliersData);
                console.log(`📦 ${suppliers.length} tedarikçi migrate ediliyor...`);
                
                for (const supplier of suppliers) {
                    await this.createSupplier({
                        supplier_code: supplier.supplierCode || supplier.supplier_code,
                        supplier_name: supplier.supplierName || supplier.supplier_name,
                        contact_person: supplier.contactPerson || supplier.contact_person,
                        email: supplier.email,
                        phone: supplier.phone,
                        address: supplier.address,
                        supplier_type: supplier.supplierType || 'material',
                        quality_rating: supplier.qualityRating || 0,
                        certification_level: supplier.certificationLevel,
                        is_active: supplier.isActive !== false,
                        risk_level: supplier.riskLevel || 'low',
                        notes: supplier.notes
                    });
                }
            }

            console.log('✅ Supplier data migration tamamlandı');
        } catch (error) {
            console.error('❌ Supplier migration hatası:', error);
        }
    }

    private async migrateDOFData(): Promise<void> {
        try {
            const dofData = localStorage.getItem('dofRecords');
            if (dofData) {
                const dofRecords = JSON.parse(dofData);
                console.log(`📦 ${dofRecords.length} DOF kaydı migrate ediliyor...`);
                
                for (const record of dofRecords) {
                    await this.createDOFRecord({
                        dof_number: record.dofNumber || record.dof_number,
                        problem_description: record.problemDescription || record.problem_description,
                        customer_name: record.customerName,
                        product_code: record.productCode,
                        problem_date: record.problemDate,
                        priority_level: record.priorityLevel || 'medium',
                        status: record.status || 'open',
                        completion_percentage: record.completionPercentage || 0
                    });
                }
            }
            console.log('✅ DOF data migration tamamlandı');
        } catch (error) {
            console.error('❌ DOF migration hatası:', error);
        }
    }

    private async migrateQuarantineData(): Promise<void> {
        try {
            const quarantineData = localStorage.getItem('quarantine_management_data');
            if (quarantineData) {
                const quarantineRecords = JSON.parse(quarantineData);
                console.log(`📦 ${quarantineRecords.length} karantina kaydı migrate ediliyor...`);
                
                for (const record of quarantineRecords) {
                    await this.createQuarantineRecord({
                        quarantine_number: record.quarantineNumber || record.quarantine_number,
                        part_code: record.partCode || record.part_code,
                        part_name: record.partName || record.part_name,
                        quantity: record.quantity,
                        quarantine_reason: record.quarantineReason || record.quarantine_reason,
                        responsible_department: record.responsibleDepartment,
                        supplier_name: record.supplierName,
                        status: record.status || 'quarantined'
                    });
                }
            }
            console.log('✅ Quarantine data migration tamamlandı');
        } catch (error) {
            console.error('❌ Quarantine migration hatası:', error);
        }
    }
}

// Singleton instance
export const moduleDataService = new ModuleDataService();
