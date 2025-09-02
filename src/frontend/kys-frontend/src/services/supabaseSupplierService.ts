import { supabase } from '../config/supabase';
import { kysSupabaseService } from './supabaseService';

// Supplier modülü için Supabase entegrasyonu
export interface SupplierData {
    id?: string;
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
    created_by?: string;
    created_at?: string;
    updated_at?: string;
}

export interface SupplierNonconformity {
    id?: string;
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
    created_by?: string;
}

export interface SupplierDefect {
    id?: string;
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
    created_by?: string;
}

export interface SupplierAudit {
    id?: string;
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
    created_by?: string;
}

class SupplierSupabaseService {
    // Suppliers CRUD Operations
    async getAllSuppliers(): Promise<SupplierData[]> {
        try {
            const { data, error } = await supabase
                .from('suppliers')
                .select('*')
                .order('supplier_name');

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            throw error;
        }
    }

    async getActiveSuppliers(): Promise<SupplierData[]> {
        try {
            const { data, error } = await supabase
                .from('suppliers')
                .select('*')
                .eq('is_active', true)
                .order('supplier_name');

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching active suppliers:', error);
            throw error;
        }
    }

    async getSupplierById(id: string): Promise<SupplierData | null> {
        try {
            const { data, error } = await supabase
                .from('suppliers')
                .select('*')
                .eq('id', id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } catch (error) {
            console.error('Error fetching supplier:', error);
            throw error;
        }
    }

    async createSupplier(supplier: Omit<SupplierData, 'id'>): Promise<SupplierData> {
        try {
            const { data, error } = await supabase
                .from('suppliers')
                .insert([supplier])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating supplier:', error);
            throw error;
        }
    }

    async updateSupplier(id: string, updates: Partial<SupplierData>): Promise<SupplierData> {
        try {
            const { data, error } = await supabase
                .from('suppliers')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating supplier:', error);
            throw error;
        }
    }

    async deleteSupplier(id: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('suppliers')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting supplier:', error);
            throw error;
        }
    }

    async searchSuppliers(searchTerm: string): Promise<SupplierData[]> {
        try {
            const { data, error } = await supabase
                .from('suppliers')
                .select('*')
                .or(`supplier_name.ilike.%${searchTerm}%,supplier_code.ilike.%${searchTerm}%,contact_person.ilike.%${searchTerm}%`)
                .order('supplier_name');

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error searching suppliers:', error);
            throw error;
        }
    }

    // Supplier Nonconformities CRUD Operations
    async getSupplierNonconformities(supplierId: string): Promise<SupplierNonconformity[]> {
        try {
            const { data, error } = await supabase
                .from('supplier_nonconformities')
                .select('*')
                .eq('supplier_id', supplierId)
                .order('nonconformity_date', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching supplier nonconformities:', error);
            throw error;
        }
    }

    async createSupplierNonconformity(nonconformity: Omit<SupplierNonconformity, 'id'>): Promise<SupplierNonconformity> {
        try {
            const { data, error } = await supabase
                .from('supplier_nonconformities')
                .insert([nonconformity])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating supplier nonconformity:', error);
            throw error;
        }
    }

    async updateSupplierNonconformity(id: string, updates: Partial<SupplierNonconformity>): Promise<SupplierNonconformity> {
        try {
            const { data, error } = await supabase
                .from('supplier_nonconformities')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating supplier nonconformity:', error);
            throw error;
        }
    }

    // Supplier Defects CRUD Operations
    async getSupplierDefects(supplierId: string): Promise<SupplierDefect[]> {
        try {
            const { data, error } = await supabase
                .from('supplier_defects')
                .select('*')
                .eq('supplier_id', supplierId)
                .order('defect_date', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching supplier defects:', error);
            throw error;
        }
    }

    async createSupplierDefect(defect: Omit<SupplierDefect, 'id'>): Promise<SupplierDefect> {
        try {
            const { data, error } = await supabase
                .from('supplier_defects')
                .insert([defect])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating supplier defect:', error);
            throw error;
        }
    }

    async updateSupplierDefect(id: string, updates: Partial<SupplierDefect>): Promise<SupplierDefect> {
        try {
            const { data, error } = await supabase
                .from('supplier_defects')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating supplier defect:', error);
            throw error;
        }
    }

    // Supplier Audits CRUD Operations
    async getSupplierAudits(supplierId: string): Promise<SupplierAudit[]> {
        try {
            const { data, error } = await supabase
                .from('supplier_audits')
                .select('*')
                .eq('supplier_id', supplierId)
                .order('audit_date', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching supplier audits:', error);
            throw error;
        }
    }

    async createSupplierAudit(audit: Omit<SupplierAudit, 'id'>): Promise<SupplierAudit> {
        try {
            const { data, error } = await supabase
                .from('supplier_audits')
                .insert([audit])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating supplier audit:', error);
            throw error;
        }
    }

    async updateSupplierAudit(id: string, updates: Partial<SupplierAudit>): Promise<SupplierAudit> {
        try {
            const { data, error } = await supabase
                .from('supplier_audits')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating supplier audit:', error);
            throw error;
        }
    }

    // Analytics ve KPI hesaplamaları
    async calculateSupplierKPIs(supplierId: string): Promise<any> {
        try {
            // Paralel olarak tüm verileri getir
            const [nonconformities, defects, audits] = await Promise.all([
                this.getSupplierNonconformities(supplierId),
                this.getSupplierDefects(supplierId),
                this.getSupplierAudits(supplierId)
            ]);

            // KPI hesaplamaları
            const totalNonconformities = nonconformities.length;
            const openNonconformities = nonconformities.filter(nc => nc.status === 'open').length;
            const totalDefects = defects.length;
            const totalCostImpact = defects.reduce((sum, defect) => sum + (defect.cost_impact || 0), 0);
            const avgDefectRate = defects.length > 0 
                ? defects.reduce((sum, defect) => sum + (defect.defect_rate || 0), 0) / defects.length 
                : 0;
            
            const latestAudit = audits.length > 0 ? audits[0] : null;
            const avgAuditScore = audits.length > 0 
                ? audits.reduce((sum, audit) => sum + (audit.audit_score || 0), 0) / audits.length 
                : 0;

            return {
                totalNonconformities,
                openNonconformities,
                totalDefects,
                totalCostImpact,
                avgDefectRate,
                latestAudit,
                avgAuditScore,
                qualityTrend: this.calculateQualityTrend(defects, nonconformities),
                riskLevel: this.calculateRiskLevel(nonconformities, defects, audits)
            };
        } catch (error) {
            console.error('Error calculating supplier KPIs:', error);
            throw error;
        }
    }

    private calculateQualityTrend(defects: SupplierDefect[], nonconformities: SupplierNonconformity[]): string {
        // Son 3 ayı karşılaştır
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const recentDefects = defects.filter(d => new Date(d.defect_date) >= threeMonthsAgo).length;
        const recentNonconformities = nonconformities.filter(nc => new Date(nc.nonconformity_date) >= threeMonthsAgo).length;

        const totalRecent = recentDefects + recentNonconformities;
        const totalOlder = (defects.length - recentDefects) + (nonconformities.length - recentNonconformities);

        if (totalRecent < totalOlder * 0.5) return 'improving';
        if (totalRecent > totalOlder * 1.5) return 'declining';
        return 'stable';
    }

    private calculateRiskLevel(nonconformities: SupplierNonconformity[], defects: SupplierDefect[], audits: SupplierAudit[]): string {
        let score = 0;

        // Açık uygunsuzluk sayısı
        const openNonconformities = nonconformities.filter(nc => nc.status === 'open').length;
        score += openNonconformities * 10;

        // Yüksek şiddetli uygunsuzluklar
        const highSeverityNonconformities = nonconformities.filter(nc => nc.severity === 'high').length;
        score += highSeverityNonconformities * 15;

        // Son audit skoru
        const latestAudit = audits.length > 0 ? audits[0] : null;
        if (latestAudit && latestAudit.audit_score) {
            score += (100 - latestAudit.audit_score);
        }

        // Toplam maliyet etkisi
        const totalCostImpact = defects.reduce((sum, defect) => sum + (defect.cost_impact || 0), 0);
        if (totalCostImpact > 10000) score += 20;
        else if (totalCostImpact > 5000) score += 10;

        if (score >= 50) return 'high';
        if (score >= 25) return 'medium';
        return 'low';
    }

    // Real-time subscriptions
    subscribeToSupplierChanges(callback: (payload: any) => void) {
        return supabase
            .channel('supplier_changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'suppliers' }, 
                callback
            )
            .subscribe();
    }

    subscribeToSupplierNonconformityChanges(callback: (payload: any) => void) {
        return supabase
            .channel('supplier_nonconformity_changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'supplier_nonconformities' }, 
                callback
            )
            .subscribe();
    }

    subscribeToSupplierDefectChanges(callback: (payload: any) => void) {
        return supabase
            .channel('supplier_defect_changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'supplier_defects' }, 
                callback
            )
            .subscribe();
    }
}

export const supplierSupabaseService = new SupplierSupabaseService();
export default supplierSupabaseService;
