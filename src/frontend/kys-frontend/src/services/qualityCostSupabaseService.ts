/**
 * QUALITY COST MANAGEMENT - SUPABASE SERVICE
 * Kalitesizlik Maliyeti modülü için tam Supabase entegrasyonu
 * LocalStorage'ı tamamen değiştirir ve gerçek online senkronizasyon sağlar
 */

import { supabase } from '../config/supabase';

// ================================
// TYPE DEFINITIONS
// ================================

export interface QualityCost {
    id?: string;
    cost_category: string;
    cost_type: string;
    department?: string;
    cost_amount: number;
    cost_date: string;
    description?: string;
    project_code?: string;
    responsible_person?: string;
    budget_code?: string;
    cost_center?: string;
    is_recurring?: boolean;
    frequency?: string;
    justification?: string;
    approved_by?: string;
    status?: string;
    created_by?: string;
    created_at?: string;
    updated_at?: string;
    
    // Legacy fields for compatibility
    amount?: number;
    date?: string;
    category?: string;
    type?: string;
    month?: string;
    year?: number;
}

// ================================
// QUALITY COST SERVICE CLASS
// ================================

class QualityCostSupabaseService {
    
    // ================================
    // CORE OPERATIONS
    // ================================
    
    async getAllQualityCosts(): Promise<QualityCost[]> {
        try {
            const { data, error } = await supabase
                .from('quality_costs')
                .select('*')
                .order('cost_date', { ascending: false });
                
            if (error) throw error;
            
            // Legacy fields için mapping
            return data.map(cost => ({
                ...cost,
                amount: cost.cost_amount,  // Legacy compatibility
                date: cost.cost_date,      // Legacy compatibility
                category: cost.cost_category, // Legacy compatibility
                type: cost.cost_type,      // Legacy compatibility
                month: new Date(cost.cost_date).toLocaleString('tr-TR', { month: 'long' }),
                year: new Date(cost.cost_date).getFullYear()
            }));
        } catch (error) {
            console.error('❌ Kalite maliyetleri yüklenirken hata:', error);
            throw error;
        }
    }
    
    async getQualityCostById(id: string): Promise<QualityCost | null> {
        try {
            const { data, error } = await supabase
                .from('quality_costs')
                .select('*')
                .eq('id', id)
                .single();
                
            if (error) throw error;
            
            return {
                ...data,
                amount: data.cost_amount,
                date: data.cost_date,
                category: data.cost_category,
                type: data.cost_type
            };
        } catch (error) {
            console.error('❌ Kalite maliyeti yüklenirken hata:', error);
            return null;
        }
    }
    
    async createQualityCost(cost: Omit<QualityCost, 'id'>): Promise<QualityCost> {
        try {
            const costData = {
                cost_category: cost.category || cost.cost_category,
                cost_type: cost.type || cost.cost_type,
                department: cost.department,
                cost_amount: cost.amount || cost.cost_amount,
                cost_date: cost.date || cost.cost_date,
                description: cost.description,
                project_code: cost.project_code,
                responsible_person: cost.responsible_person,
                budget_code: cost.budget_code,
                cost_center: cost.cost_center,
                is_recurring: cost.is_recurring || false,
                frequency: cost.frequency,
                justification: cost.justification,
                approved_by: cost.approved_by,
                status: cost.status || 'active'
            };
            
            const { data, error } = await supabase
                .from('quality_costs')
                .insert([costData])
                .select()
                .single();
                
            if (error) throw error;
            
            console.log('✅ Yeni kalite maliyeti oluşturuldu:', data.cost_amount, 'TL');
            return {
                ...data,
                amount: data.cost_amount,
                date: data.cost_date,
                category: data.cost_category,
                type: data.cost_type
            };
        } catch (error) {
            console.error('❌ Kalite maliyeti oluşturulurken hata:', error);
            throw error;
        }
    }
    
    async updateQualityCost(id: string, updates: Partial<QualityCost>): Promise<QualityCost> {
        try {
            const updateData: any = {};
            
            if (updates.cost_category || updates.category) {
                updateData.cost_category = updates.cost_category || updates.category;
            }
            if (updates.cost_type || updates.type) {
                updateData.cost_type = updates.cost_type || updates.type;
            }
            if (updates.department !== undefined) updateData.department = updates.department;
            if (updates.cost_amount !== undefined || updates.amount !== undefined) {
                updateData.cost_amount = updates.cost_amount || updates.amount;
            }
            if (updates.cost_date || updates.date) {
                updateData.cost_date = updates.cost_date || updates.date;
            }
            if (updates.description !== undefined) updateData.description = updates.description;
            if (updates.project_code !== undefined) updateData.project_code = updates.project_code;
            if (updates.responsible_person !== undefined) updateData.responsible_person = updates.responsible_person;
            if (updates.budget_code !== undefined) updateData.budget_code = updates.budget_code;
            if (updates.cost_center !== undefined) updateData.cost_center = updates.cost_center;
            if (updates.is_recurring !== undefined) updateData.is_recurring = updates.is_recurring;
            if (updates.frequency !== undefined) updateData.frequency = updates.frequency;
            if (updates.justification !== undefined) updateData.justification = updates.justification;
            if (updates.approved_by !== undefined) updateData.approved_by = updates.approved_by;
            if (updates.status !== undefined) updateData.status = updates.status;
            
            const { data, error } = await supabase
                .from('quality_costs')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();
                
            if (error) throw error;
            
            console.log('✅ Kalite maliyeti güncellendi:', data.cost_amount, 'TL');
            return {
                ...data,
                amount: data.cost_amount,
                date: data.cost_date,
                category: data.cost_category,
                type: data.cost_type
            };
        } catch (error) {
            console.error('❌ Kalite maliyeti güncellenirken hata:', error);
            throw error;
        }
    }
    
    async deleteQualityCost(id: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('quality_costs')
                .delete()
                .eq('id', id);
                
            if (error) throw error;
            
            console.log('✅ Kalite maliyeti silindi');
            return true;
        } catch (error) {
            console.error('❌ Kalite maliyeti silinirken hata:', error);
            return false;
        }
    }
    
    // ================================
    // ANALYTICS & AGGREGATIONS
    // ================================
    
    async getTotalCosts(): Promise<number> {
        try {
            const { data, error } = await supabase
                .from('quality_costs')
                .select('cost_amount')
                .eq('status', 'active');
                
            if (error) throw error;
            
            const total = data.reduce((sum, cost) => sum + cost.cost_amount, 0);
            console.log('📊 Toplam kalite maliyeti:', total, 'TL');
            return total;
        } catch (error) {
            console.error('❌ Toplam kalite maliyeti hesaplanırken hata:', error);
            return 0;
        }
    }
    
    async getCostsByCategory(): Promise<Record<string, number>> {
        try {
            const { data, error } = await supabase
                .from('quality_costs')
                .select('cost_category, cost_amount')
                .eq('status', 'active');
                
            if (error) throw error;
            
            const categoryTotals: Record<string, number> = {};
            data.forEach(cost => {
                categoryTotals[cost.cost_category] = (categoryTotals[cost.cost_category] || 0) + cost.cost_amount;
            });
            
            console.log('📊 Kategorilere göre maliyetler:', categoryTotals);
            return categoryTotals;
        } catch (error) {
            console.error('❌ Kategori bazlı maliyet analizi hatası:', error);
            return {};
        }
    }
    
    async getCostsByMonth(year: number): Promise<Record<string, number>> {
        try {
            const { data, error } = await supabase
                .from('quality_costs')
                .select('cost_date, cost_amount')
                .eq('status', 'active')
                .gte('cost_date', `${year}-01-01`)
                .lte('cost_date', `${year}-12-31`);
                
            if (error) throw error;
            
            const monthlyTotals: Record<string, number> = {};
            data.forEach(cost => {
                const month = new Date(cost.cost_date).toLocaleString('tr-TR', { month: 'long' });
                monthlyTotals[month] = (monthlyTotals[month] || 0) + cost.cost_amount;
            });
            
            console.log('📊 Aylık maliyetler:', monthlyTotals);
            return monthlyTotals;
        } catch (error) {
            console.error('❌ Aylık maliyet analizi hatası:', error);
            return {};
        }
    }
    
    async getCostsByDepartment(): Promise<Record<string, number>> {
        try {
            const { data, error } = await supabase
                .from('quality_costs')
                .select('department, cost_amount')
                .eq('status', 'active')
                .not('department', 'is', null);
                
            if (error) throw error;
            
            const departmentTotals: Record<string, number> = {};
            data.forEach(cost => {
                if (cost.department) {
                    departmentTotals[cost.department] = (departmentTotals[cost.department] || 0) + cost.cost_amount;
                }
            });
            
            console.log('📊 Departman bazlı maliyetler:', departmentTotals);
            return departmentTotals;
        } catch (error) {
            console.error('❌ Departman bazlı maliyet analizi hatası:', error);
            return {};
        }
    }
    
    // ================================
    // MIGRATION HELPERS
    // ================================
    
    async migrateFromLocalStorage(): Promise<{
        costs: number;
        errors: string[];
    }> {
        const results = {
            costs: 0,
            errors: [] as string[]
        };
        
        try {
            // LocalStorage'dan kalite maliyeti verilerini çek
            const storedData = localStorage.getItem('kys-cost-management-data');
            if (storedData && storedData !== 'null') {
                try {
                    const costs = JSON.parse(storedData);
                    for (const cost of costs) {
                        try {
                            await this.createQualityCost(cost);
                            results.costs++;
                        } catch (error: any) {
                            results.errors.push(`Cost migration error: ${error.message}`);
                        }
                    }
                } catch (error: any) {
                    results.errors.push(`Costs parse error: ${error.message}`);
                }
            }
            
            console.log('✅ Quality Cost LocalStorage migration completed:', results);
            return results;
            
        } catch (error: any) {
            results.errors.push(`Migration error: ${error.message}`);
            console.error('❌ Quality Cost migration failed:', error);
            return results;
        }
    }
    
    // ================================
    // REAL-TIME SUBSCRIPTIONS
    // ================================
    
    subscribeToChanges(callback: (payload: any) => void) {
        const subscription = supabase
            .channel('quality_costs_changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'quality_costs' }, 
                payload => {
                    console.log('🔄 Quality Cost real-time update:', payload);
                    callback(payload);
                }
            )
            .subscribe();
            
        return subscription;
    }
    
    unsubscribeFromChanges(subscription: any) {
        supabase.removeChannel(subscription);
    }
}

// ================================
// EXPORT SINGLETON
// ================================

export const qualityCostSupabaseService = new QualityCostSupabaseService();
export default qualityCostSupabaseService;
