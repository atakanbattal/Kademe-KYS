import { supabase } from '../config/supabase';

// Material Certificate Tracking modülü için Supabase entegrasyonu
export interface MaterialQualityControlData {
    id?: string;
    material_code: string;
    material_name: string;
    supplier_id: string;
    supplier_name: string;
    batch_number: string;
    received_date: string;
    inspection_date: string;
    inspector_id: string;
    certificate_number?: string;
    certificate_upload_path?: string;
    certificate_properties?: any[];
    visual_inspection_notes?: string;
    dimensional_inspection_notes?: string;
    status: 'pending' | 'approved' | 'rejected' | 'conditional';
    approved_by?: string;
    rejection_reason?: string;
    created_at?: string;
    updated_at?: string;
}

export interface QualityControlReport {
    id?: string;
    report_id: string;
    material_quality_control_id: string;
    report_type?: string;
    material_code: string;
    material_name: string;
    supplier_name: string;
    batch_number: string;
    certificate_number?: string;
    test_operator: {
        id: string;
        name: string;
        employeeId: string;
    };
    quality_controller: {
        id: string;
        name: string;
        employeeId: string;
    };
    overall_quality_grade: 'B' | 'C' | 'D' | 'REJECT';
    standard_reference: string;
    test_results?: any;
    conclusion: string;
    pdf_path?: string;
    created_by: string;
    created_at?: string;
    updated_at?: string;
}

export interface CertificateProperty {
    property: string;
    value: string | number;
    unit?: string;
    standard?: string;
    status?: 'pass' | 'fail' | 'conditional';
    notes?: string;
}

class MaterialSupabaseService {
    // Material Quality Controls CRUD Operations
    async getAllMaterialControls(): Promise<MaterialQualityControlData[]> {
        try {
            const { data, error } = await supabase
                .from('material_quality_controls')
                .select(`
                    *,
                    suppliers(name, code),
                    users!inspector_id(name),
                    users!approved_by(name)
                `)
                .order('inspection_date', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching material controls:', error);
            throw error;
        }
    }

    async getMaterialControlsByStatus(status: string): Promise<MaterialQualityControlData[]> {
        try {
            const { data, error } = await supabase
                .from('material_quality_controls')
                .select(`
                    *,
                    suppliers(name, code),
                    users!inspector_id(name),
                    users!approved_by(name)
                `)
                .eq('status', status)
                .order('inspection_date', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching material controls by status:', error);
            throw error;
        }
    }

    async getMaterialControlsBySupplier(supplierId: string): Promise<MaterialQualityControlData[]> {
        try {
            const { data, error } = await supabase
                .from('material_quality_controls')
                .select(`
                    *,
                    suppliers(name, code),
                    users!inspector_id(name),
                    users!approved_by(name)
                `)
                .eq('supplier_id', supplierId)
                .order('inspection_date', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching material controls by supplier:', error);
            throw error;
        }
    }

    async getMaterialControlById(id: string): Promise<MaterialQualityControlData | null> {
        try {
            const { data, error } = await supabase
                .from('material_quality_controls')
                .select(`
                    *,
                    suppliers(name, code, contact_person, email),
                    users!inspector_id(name, email),
                    users!approved_by(name, email)
                `)
                .eq('id', id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } catch (error) {
            console.error('Error fetching material control:', error);
            throw error;
        }
    }

    async createMaterialControl(materialControl: Omit<MaterialQualityControlData, 'id'>): Promise<MaterialQualityControlData> {
        try {
            const { data, error } = await supabase
                .from('material_quality_controls')
                .insert([materialControl])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating material control:', error);
            throw error;
        }
    }

    async updateMaterialControl(id: string, updates: Partial<MaterialQualityControlData>): Promise<MaterialQualityControlData> {
        try {
            const { data, error } = await supabase
                .from('material_quality_controls')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating material control:', error);
            throw error;
        }
    }

    async approveMaterialControl(
        id: string, 
        approvedBy: string, 
        notes?: string
    ): Promise<MaterialQualityControlData> {
        try {
            const updates: Partial<MaterialQualityControlData> = {
                status: 'approved',
                approved_by: approvedBy,
                visual_inspection_notes: notes
            };

            return await this.updateMaterialControl(id, updates);
        } catch (error) {
            console.error('Error approving material control:', error);
            throw error;
        }
    }

    async rejectMaterialControl(
        id: string, 
        rejectionReason: string, 
        rejectedBy: string
    ): Promise<MaterialQualityControlData> {
        try {
            const updates: Partial<MaterialQualityControlData> = {
                status: 'rejected',
                rejection_reason: rejectionReason,
                approved_by: rejectedBy
            };

            return await this.updateMaterialControl(id, updates);
        } catch (error) {
            console.error('Error rejecting material control:', error);
            throw error;
        }
    }

    async deleteMaterialControl(id: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('material_quality_controls')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting material control:', error);
            throw error;
        }
    }

    async searchMaterialControls(searchTerm: string): Promise<MaterialQualityControlData[]> {
        try {
            const { data, error } = await supabase
                .from('material_quality_controls')
                .select(`
                    *,
                    suppliers(name, code),
                    users!inspector_id(name),
                    users!approved_by(name)
                `)
                .or(`material_code.ilike.%${searchTerm}%,material_name.ilike.%${searchTerm}%,batch_number.ilike.%${searchTerm}%,supplier_name.ilike.%${searchTerm}%,certificate_number.ilike.%${searchTerm}%`)
                .order('inspection_date', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error searching material controls:', error);
            throw error;
        }
    }

    // Quality Control Reports CRUD Operations
    async getQualityControlReports(): Promise<QualityControlReport[]> {
        try {
            const { data, error } = await supabase
                .from('quality_control_reports')
                .select(`
                    *,
                    material_quality_controls(
                        material_code,
                        material_name,
                        supplier_name,
                        batch_number
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching quality control reports:', error);
            throw error;
        }
    }

    async getQualityControlReportById(id: string): Promise<QualityControlReport | null> {
        try {
            const { data, error } = await supabase
                .from('quality_control_reports')
                .select(`
                    *,
                    material_quality_controls(
                        material_code,
                        material_name,
                        supplier_name,
                        batch_number,
                        certificate_number,
                        certificate_properties
                    )
                `)
                .eq('id', id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } catch (error) {
            console.error('Error fetching quality control report:', error);
            throw error;
        }
    }

    async getReportsByMaterialControl(materialControlId: string): Promise<QualityControlReport[]> {
        try {
            const { data, error } = await supabase
                .from('quality_control_reports')
                .select('*')
                .eq('material_quality_control_id', materialControlId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching reports by material control:', error);
            throw error;
        }
    }

    async createQualityControlReport(report: Omit<QualityControlReport, 'id' | 'report_id'>): Promise<QualityControlReport> {
        try {
            // Report ID otomatik olarak trigger ile oluşturulacak
            const { data, error } = await supabase
                .from('quality_control_reports')
                .insert([{ ...report, report_id: '' }]) // Empty report_id, trigger will generate it
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating quality control report:', error);
            throw error;
        }
    }

    async updateQualityControlReport(id: string, updates: Partial<QualityControlReport>): Promise<QualityControlReport> {
        try {
            const { data, error } = await supabase
                .from('quality_control_reports')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating quality control report:', error);
            throw error;
        }
    }

    async deleteQualityControlReport(id: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('quality_control_reports')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting quality control report:', error);
            throw error;
        }
    }

    // Certificate operations
    async updateCertificateProperties(
        materialControlId: string, 
        properties: CertificateProperty[]
    ): Promise<MaterialQualityControlData> {
        try {
            return await this.updateMaterialControl(materialControlId, {
                certificate_properties: properties
            });
        } catch (error) {
            console.error('Error updating certificate properties:', error);
            throw error;
        }
    }

    async updateCertificatePath(
        materialControlId: string, 
        certificatePath: string
    ): Promise<MaterialQualityControlData> {
        try {
            return await this.updateMaterialControl(materialControlId, {
                certificate_upload_path: certificatePath
            });
        } catch (error) {
            console.error('Error updating certificate path:', error);
            throw error;
        }
    }

    // Analytics ve KPI hesaplamaları
    async getMaterialQualityStatistics(): Promise<any> {
        try {
            const materialControls = await this.getAllMaterialControls();

            const stats = {
                total: materialControls.length,
                byStatus: {} as Record<string, number>,
                bySupplier: {} as Record<string, number>,
                byMaterial: {} as Record<string, number>,
                pending: materialControls.filter(mc => mc.status === 'pending').length,
                approved: materialControls.filter(mc => mc.status === 'approved').length,
                rejected: materialControls.filter(mc => mc.status === 'rejected').length,
                conditional: materialControls.filter(mc => mc.status === 'conditional').length,
                rejectionRate: 0,
                avgProcessingTime: 0,
                monthlyTrend: {} as Record<string, number>
            };

            // Status dağılımı
            materialControls.forEach(mc => {
                stats.byStatus[mc.status] = (stats.byStatus[mc.status] || 0) + 1;
                stats.bySupplier[mc.supplier_name] = (stats.bySupplier[mc.supplier_name] || 0) + 1;
                stats.byMaterial[mc.material_code] = (stats.byMaterial[mc.material_code] || 0) + 1;

                // Aylık trend
                const month = new Date(mc.inspection_date).toISOString().slice(0, 7);
                stats.monthlyTrend[month] = (stats.monthlyTrend[month] || 0) + 1;
            });

            // Rejection rate hesaplama
            if (stats.total > 0) {
                stats.rejectionRate = Math.round((stats.rejected / stats.total) * 100);
            }

            // Ortalama işlem süresi hesaplama (gün)
            const processedControls = materialControls.filter(mc => 
                mc.status !== 'pending' && mc.received_date && mc.inspection_date
            );

            if (processedControls.length > 0) {
                const totalDays = processedControls.reduce((sum, mc) => {
                    const receivedDate = new Date(mc.received_date);
                    const inspectionDate = new Date(mc.inspection_date);
                    const days = Math.ceil((inspectionDate.getTime() - receivedDate.getTime()) / (1000 * 60 * 60 * 24));
                    return sum + Math.max(0, days);
                }, 0);

                stats.avgProcessingTime = Math.round(totalDays / processedControls.length);
            }

            return stats;
        } catch (error) {
            console.error('Error calculating material quality statistics:', error);
            throw error;
        }
    }

    async getSupplierQualityTrend(supplierId: string): Promise<any> {
        try {
            const materialControls = await this.getMaterialControlsBySupplier(supplierId);
            
            const trend = {
                totalInspections: materialControls.length,
                approvalRate: 0,
                rejectionRate: 0,
                monthlyData: {} as Record<string, { approved: number; rejected: number; total: number }>
            };

            // Aylık veri analizi
            materialControls.forEach(mc => {
                const month = new Date(mc.inspection_date).toISOString().slice(0, 7);
                if (!trend.monthlyData[month]) {
                    trend.monthlyData[month] = { approved: 0, rejected: 0, total: 0 };
                }

                trend.monthlyData[month].total++;
                if (mc.status === 'approved') trend.monthlyData[month].approved++;
                if (mc.status === 'rejected') trend.monthlyData[month].rejected++;
            });

            // Genel oranlar
            const approved = materialControls.filter(mc => mc.status === 'approved').length;
            const rejected = materialControls.filter(mc => mc.status === 'rejected').length;

            if (trend.totalInspections > 0) {
                trend.approvalRate = Math.round((approved / trend.totalInspections) * 100);
                trend.rejectionRate = Math.round((rejected / trend.totalInspections) * 100);
            }

            return trend;
        } catch (error) {
            console.error('Error calculating supplier quality trend:', error);
            throw error;
        }
    }

    // Real-time subscriptions
    subscribeToMaterialControlChanges(callback: (payload: any) => void) {
        return supabase
            .channel('material_control_changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'material_quality_controls' }, 
                callback
            )
            .subscribe();
    }

    subscribeToQualityReportChanges(callback: (payload: any) => void) {
        return supabase
            .channel('quality_report_changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'quality_control_reports' }, 
                callback
            )
            .subscribe();
    }

    // Batch operations
    async bulkUpdateMaterialControls(
        ids: string[], 
        updates: Partial<MaterialQualityControlData>
    ): Promise<MaterialQualityControlData[]> {
        try {
            const { data, error } = await supabase
                .from('material_quality_controls')
                .update(updates)
                .in('id', ids)
                .select();

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error bulk updating material controls:', error);
            throw error;
        }
    }

    async bulkApproveMaterialControls(
        ids: string[], 
        approvedBy: string
    ): Promise<MaterialQualityControlData[]> {
        try {
            return await this.bulkUpdateMaterialControls(ids, {
                status: 'approved',
                approved_by: approvedBy
            });
        } catch (error) {
            console.error('Error bulk approving material controls:', error);
            throw error;
        }
    }
}

export const materialSupabaseService = new MaterialSupabaseService();
export default materialSupabaseService;
