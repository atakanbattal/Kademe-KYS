import { dbService, Tables, Inserts, Updates, SupabaseError } from '../utils/supabaseDb';

// Material Quality Control status
export enum QualityControlStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    CONDITIONAL = 'conditional'
}

// Certificate properties interface
export interface ICertificateProperty {
    name: string;
    expectedValue: string;
    actualValue: string;
    tolerance?: number;
    unit?: string;
    isCompliant: boolean;
}

// Type definitions based on Supabase schema
export type MaterialQualityControl = Tables<'material_quality_controls'>;
export type MaterialQualityControlInsert = Inserts<'material_quality_controls'>;
export type MaterialQualityControlUpdate = Updates<'material_quality_controls'>;

// Material Quality Control creation data
export interface CreateMaterialQualityControlData {
    material_code: string;
    material_name: string;
    supplier_id: string;
    supplier_name: string;
    batch_number: string;
    received_date: string; // ISO date string
    inspection_date: string; // ISO date string
    inspector_id: string;
    certificate_number?: string;
    certificate_upload_path?: string;
    certificate_properties?: ICertificateProperty[];
    visual_inspection_notes?: string;
    dimensional_inspection_notes?: string;
    status?: QualityControlStatus;
    approved_by?: string;
    rejection_reason?: string;
}

// Material Quality Control update data
export interface UpdateMaterialQualityControlData {
    material_code?: string;
    material_name?: string;
    supplier_id?: string;
    supplier_name?: string;
    batch_number?: string;
    received_date?: string;
    inspection_date?: string;
    inspector_id?: string;
    certificate_number?: string;
    certificate_upload_path?: string;
    certificate_properties?: ICertificateProperty[];
    visual_inspection_notes?: string;
    dimensional_inspection_notes?: string;
    status?: QualityControlStatus;
    approved_by?: string | null;
    rejection_reason?: string | null;
}

export class MaterialQualityControlModel {
    // Create a new material quality control record
    static async create(data: CreateMaterialQualityControlData): Promise<MaterialQualityControl> {
        try {
            // Check for unique constraint (supplier_id, material_code, batch_number)
            const existing = await this.findBySupplierMaterialBatch(
                data.supplier_id,
                data.material_code,
                data.batch_number
            );
            
            if (existing) {
                throw new Error('Material quality control record with this supplier, material code, and batch number already exists');
            }

            // Prepare data for insertion
            const insertData: MaterialQualityControlInsert = {
                material_code: data.material_code.trim(),
                material_name: data.material_name.trim(),
                supplier_id: data.supplier_id,
                supplier_name: data.supplier_name.trim(),
                batch_number: data.batch_number.trim(),
                received_date: data.received_date,
                inspection_date: data.inspection_date,
                inspector_id: data.inspector_id,
                certificate_number: data.certificate_number?.trim() || null,
                certificate_upload_path: data.certificate_upload_path?.trim() || null,
                certificate_properties: data.certificate_properties || [],
                visual_inspection_notes: data.visual_inspection_notes?.trim() || null,
                dimensional_inspection_notes: data.dimensional_inspection_notes?.trim() || null,
                status: data.status || QualityControlStatus.PENDING,
                approved_by: data.approved_by || null,
                rejection_reason: data.rejection_reason?.trim() || null,
            };

            // Create record in database
            const result = await dbService.insert('material_quality_controls', insertData);
            return result[0];
        } catch (error) {
            if (error instanceof SupabaseError) {
                if (error.code === '23505') { // Unique constraint violation
                    throw new Error('Material quality control record with this supplier, material code, and batch number already exists');
                }
            }
            throw error;
        }
    }

    // Find material quality control by ID
    static async findById(id: string): Promise<MaterialQualityControl | null> {
        try {
            return await dbService.findById('material_quality_controls', id);
        } catch (error) {
            throw error;
        }
    }

    // Find by supplier, material code, and batch number
    static async findBySupplierMaterialBatch(
        supplierId: string,
        materialCode: string,
        batchNumber: string
    ): Promise<MaterialQualityControl | null> {
        try {
            const { data, error } = await dbService.supabase
                .from('material_quality_controls')
                .select('*')
                .eq('supplier_id', supplierId)
                .eq('material_code', materialCode)
                .eq('batch_number', batchNumber)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return null; // No record found
                }
                throw new SupabaseError(error);
            }

            return data;
        } catch (error) {
            throw error;
        }
    }

    // Update material quality control
    static async update(id: string, updateData: UpdateMaterialQualityControlData): Promise<MaterialQualityControl> {
        try {
            const updates: MaterialQualityControlUpdate = {};

            // Prepare update data
            if (updateData.material_code !== undefined) {
                updates.material_code = updateData.material_code.trim();
            }
            if (updateData.material_name !== undefined) {
                updates.material_name = updateData.material_name.trim();
            }
            if (updateData.supplier_id !== undefined) {
                updates.supplier_id = updateData.supplier_id;
            }
            if (updateData.supplier_name !== undefined) {
                updates.supplier_name = updateData.supplier_name.trim();
            }
            if (updateData.batch_number !== undefined) {
                updates.batch_number = updateData.batch_number.trim();
            }
            if (updateData.received_date !== undefined) {
                updates.received_date = updateData.received_date;
            }
            if (updateData.inspection_date !== undefined) {
                updates.inspection_date = updateData.inspection_date;
            }
            if (updateData.inspector_id !== undefined) {
                updates.inspector_id = updateData.inspector_id;
            }
            if (updateData.certificate_number !== undefined) {
                updates.certificate_number = updateData.certificate_number?.trim() || null;
            }
            if (updateData.certificate_upload_path !== undefined) {
                updates.certificate_upload_path = updateData.certificate_upload_path?.trim() || null;
            }
            if (updateData.certificate_properties !== undefined) {
                updates.certificate_properties = updateData.certificate_properties;
            }
            if (updateData.visual_inspection_notes !== undefined) {
                updates.visual_inspection_notes = updateData.visual_inspection_notes?.trim() || null;
            }
            if (updateData.dimensional_inspection_notes !== undefined) {
                updates.dimensional_inspection_notes = updateData.dimensional_inspection_notes?.trim() || null;
            }
            if (updateData.status !== undefined) {
                updates.status = updateData.status;
            }
            if (updateData.approved_by !== undefined) {
                updates.approved_by = updateData.approved_by || null;
            }
            if (updateData.rejection_reason !== undefined) {
                updates.rejection_reason = updateData.rejection_reason?.trim() || null;
            }

            // Update record in database
            return await dbService.update('material_quality_controls', id, updates);
        } catch (error) {
            if (error instanceof SupabaseError) {
                if (error.code === '23505') { // Unique constraint violation
                    throw new Error('Material quality control record with this supplier, material code, and batch number already exists');
                }
            }
            throw error;
        }
    }

    // Delete material quality control
    static async delete(id: string): Promise<void> {
        try {
            await dbService.delete('material_quality_controls', id);
        } catch (error) {
            throw error;
        }
    }

    // Get all material quality controls
    static async findAll(): Promise<MaterialQualityControl[]> {
        try {
            return await dbService.select('material_quality_controls', {
                orderBy: { column: 'inspection_date', ascending: false }
            });
        } catch (error) {
            throw error;
        }
    }

    // Get material quality controls by status
    static async findByStatus(status: QualityControlStatus): Promise<MaterialQualityControl[]> {
        try {
            return await dbService.select('material_quality_controls', {
                filters: { status },
                orderBy: { column: 'inspection_date', ascending: false }
            });
        } catch (error) {
            throw error;
        }
    }

    // Get material quality controls by supplier
    static async findBySupplier(supplierId: string): Promise<MaterialQualityControl[]> {
        try {
            return await dbService.select('material_quality_controls', {
                filters: { supplier_id: supplierId },
                orderBy: { column: 'inspection_date', ascending: false }
            });
        } catch (error) {
            throw error;
        }
    }

    // Get material quality controls by inspector
    static async findByInspector(inspectorId: string): Promise<MaterialQualityControl[]> {
        try {
            return await dbService.select('material_quality_controls', {
                filters: { inspector_id: inspectorId },
                orderBy: { column: 'inspection_date', ascending: false }
            });
        } catch (error) {
            throw error;
        }
    }

    // Search material quality controls
    static async search(searchTerm: string): Promise<MaterialQualityControl[]> {
        try {
            const { data, error } = await dbService.supabase
                .from('material_quality_controls')
                .select('*')
                .or(`material_code.ilike.%${searchTerm}%,material_name.ilike.%${searchTerm}%,batch_number.ilike.%${searchTerm}%,supplier_name.ilike.%${searchTerm}%`)
                .order('inspection_date', { ascending: false })
                .limit(100);

            if (error) {
                throw new SupabaseError(error);
            }

            return data || [];
        } catch (error) {
            throw error;
        }
    }

    // Approve material quality control
    static async approve(id: string, approvedBy: string): Promise<MaterialQualityControl> {
        return await this.update(id, {
            status: QualityControlStatus.APPROVED,
            approved_by: approvedBy,
            rejection_reason: null
        });
    }

    // Reject material quality control
    static async reject(id: string, rejectionReason: string): Promise<MaterialQualityControl> {
        return await this.update(id, {
            status: QualityControlStatus.REJECTED,
            rejection_reason: rejectionReason,
            approved_by: null
        });
    }

    // Set conditional approval
    static async setConditional(id: string, approvedBy: string, notes: string): Promise<MaterialQualityControl> {
        return await this.update(id, {
            status: QualityControlStatus.CONDITIONAL,
            approved_by: approvedBy,
            rejection_reason: notes
        });
    }

    // Get statistics
    static async getStatistics(): Promise<{
        total: number;
        by_status: Record<QualityControlStatus, number>;
        by_month: Record<string, number>;
    }> {
        try {
            const total = await dbService.count('material_quality_controls');

            // Get counts by status
            const statusCounts = await Promise.all([
                dbService.count('material_quality_controls', { status: QualityControlStatus.PENDING }),
                dbService.count('material_quality_controls', { status: QualityControlStatus.APPROVED }),
                dbService.count('material_quality_controls', { status: QualityControlStatus.REJECTED }),
                dbService.count('material_quality_controls', { status: QualityControlStatus.CONDITIONAL }),
            ]);

            const by_status = {
                [QualityControlStatus.PENDING]: statusCounts[0],
                [QualityControlStatus.APPROVED]: statusCounts[1],
                [QualityControlStatus.REJECTED]: statusCounts[2],
                [QualityControlStatus.CONDITIONAL]: statusCounts[3],
            };

            // Get recent data for monthly statistics
            const { data, error } = await dbService.supabase
                .from('material_quality_controls')
                .select('inspection_date')
                .gte('inspection_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

            if (error) {
                throw new SupabaseError(error);
            }

            const by_month: Record<string, number> = {};
            data?.forEach(record => {
                const month = record.inspection_date.substring(0, 7); // YYYY-MM
                by_month[month] = (by_month[month] || 0) + 1;
            });

            return {
                total,
                by_status,
                by_month
            };
        } catch (error) {
            throw error;
        }
    }

    // Get material quality controls with pagination
    static async findWithPagination(
        page: number = 1,
        limit: number = 50,
        filters?: {
            status?: QualityControlStatus;
            supplier_id?: string;
            inspector_id?: string;
            search?: string;
            date_from?: string;
            date_to?: string;
        }
    ): Promise<{
        records: MaterialQualityControl[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        try {
            const offset = (page - 1) * limit;
            let query = dbService.supabase
                .from('material_quality_controls')
                .select('*', { count: 'exact' });

            // Apply filters
            if (filters?.status) {
                query = query.eq('status', filters.status);
            }
            if (filters?.supplier_id) {
                query = query.eq('supplier_id', filters.supplier_id);
            }
            if (filters?.inspector_id) {
                query = query.eq('inspector_id', filters.inspector_id);
            }
            if (filters?.date_from) {
                query = query.gte('inspection_date', filters.date_from);
            }
            if (filters?.date_to) {
                query = query.lte('inspection_date', filters.date_to);
            }
            if (filters?.search) {
                query = query.or(
                    `material_code.ilike.%${filters.search}%,material_name.ilike.%${filters.search}%,batch_number.ilike.%${filters.search}%,supplier_name.ilike.%${filters.search}%`
                );
            }

            // Apply pagination and ordering
            const { data, error, count } = await query
                .order('inspection_date', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) {
                throw new SupabaseError(error);
            }

            const total = count || 0;
            const totalPages = Math.ceil(total / limit);

            return {
                records: data || [],
                total,
                page,
                limit,
                totalPages
            };
        } catch (error) {
            throw error;
        }
    }

    // Update certificate properties
    static async updateCertificateProperties(
        id: string,
        properties: ICertificateProperty[]
    ): Promise<MaterialQualityControl> {
        return await this.update(id, { certificate_properties: properties });
    }

    // Add certificate property
    static async addCertificateProperty(
        id: string,
        property: ICertificateProperty
    ): Promise<MaterialQualityControl> {
        const record = await this.findById(id);
        if (!record) {
            throw new Error('Material quality control record not found');
        }

        const currentProperties = (record.certificate_properties as ICertificateProperty[]) || [];
        const updatedProperties = [...currentProperties, property];

        return await this.updateCertificateProperties(id, updatedProperties);
    }

    // Remove certificate property
    static async removeCertificateProperty(
        id: string,
        propertyName: string
    ): Promise<MaterialQualityControl> {
        const record = await this.findById(id);
        if (!record) {
            throw new Error('Material quality control record not found');
        }

        const currentProperties = (record.certificate_properties as ICertificateProperty[]) || [];
        const updatedProperties = currentProperties.filter(prop => prop.name !== propertyName);

        return await this.updateCertificateProperties(id, updatedProperties);
    }

    // Check if record exists
    static async exists(id: string): Promise<boolean> {
        try {
            const record = await this.findById(id);
            return record !== null;
        } catch (error) {
            return false;
        }
    }

    // Get pending approvals count
    static async getPendingApprovalsCount(): Promise<number> {
        return await dbService.count('material_quality_controls', { 
            status: QualityControlStatus.PENDING 
        });
    }
}

export default MaterialQualityControlModel;
