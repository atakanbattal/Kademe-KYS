import { dbService, supplierService, Tables, Inserts, Updates, SupabaseError } from '../utils/supabaseDb';

// Supplier type definitions based on Supabase schema
export type Supplier = Tables<'suppliers'>;
export type SupplierInsert = Inserts<'suppliers'>;
export type SupplierUpdate = Updates<'suppliers'>;

// Supplier creation data
export interface CreateSupplierData {
    name: string;
    code: string;
    contact_person: string;
    email: string;
    phone: string;
    address: string;
    material_categories: string[];
    notes?: string;
}

// Supplier update data
export interface UpdateSupplierData {
    name?: string;
    code?: string;
    contact_person?: string;
    email?: string;
    phone?: string;
    address?: string;
    material_categories?: string[];
    notes?: string;
    is_active?: boolean;
}

export class SupplierModel {
    // Create a new supplier
    static async create(supplierData: CreateSupplierData): Promise<Supplier> {
        try {
            // Check if supplier code already exists
            const existingSupplier = await supplierService.findByCode(supplierData.code);
            if (existingSupplier) {
                throw new Error('Supplier with this code already exists');
            }

            // Prepare supplier data for insertion
            const supplierInsert: SupplierInsert = {
                name: supplierData.name.trim(),
                code: supplierData.code.trim().toUpperCase(),
                contact_person: supplierData.contact_person.trim(),
                email: supplierData.email.toLowerCase().trim(),
                phone: supplierData.phone.trim(),
                address: supplierData.address.trim(),
                material_categories: supplierData.material_categories.map(cat => cat.trim()),
                notes: supplierData.notes?.trim() || null,
                is_active: true,
            };

            // Create supplier in database
            const result = await dbService.insert('suppliers', supplierInsert);
            return result[0];
        } catch (error) {
            if (error instanceof SupabaseError) {
                if (error.code === '23505') { // Unique constraint violation
                    throw new Error('Supplier with this code already exists');
                }
            }
            throw error;
        }
    }

    // Find supplier by ID
    static async findById(id: string): Promise<Supplier | null> {
        try {
            return await dbService.findById('suppliers', id);
        } catch (error) {
            throw error;
        }
    }

    // Find supplier by code
    static async findByCode(code: string): Promise<Supplier | null> {
        try {
            return await supplierService.findByCode(code);
        } catch (error) {
            throw error;
        }
    }

    // Update supplier
    static async update(id: string, updateData: UpdateSupplierData): Promise<Supplier> {
        try {
            const updates: SupplierUpdate = {};

            // Prepare update data
            if (updateData.name !== undefined) {
                updates.name = updateData.name.trim();
            }
            if (updateData.code !== undefined) {
                updates.code = updateData.code.trim().toUpperCase();
            }
            if (updateData.contact_person !== undefined) {
                updates.contact_person = updateData.contact_person.trim();
            }
            if (updateData.email !== undefined) {
                updates.email = updateData.email.toLowerCase().trim();
            }
            if (updateData.phone !== undefined) {
                updates.phone = updateData.phone.trim();
            }
            if (updateData.address !== undefined) {
                updates.address = updateData.address.trim();
            }
            if (updateData.material_categories !== undefined) {
                updates.material_categories = updateData.material_categories.map(cat => cat.trim());
            }
            if (updateData.notes !== undefined) {
                updates.notes = updateData.notes?.trim() || null;
            }
            if (updateData.is_active !== undefined) {
                updates.is_active = updateData.is_active;
            }

            // Update supplier in database
            return await dbService.update('suppliers', id, updates);
        } catch (error) {
            if (error instanceof SupabaseError) {
                if (error.code === '23505') { // Unique constraint violation
                    throw new Error('Supplier with this code already exists');
                }
            }
            throw error;
        }
    }

    // Delete supplier (soft delete by setting is_active to false)
    static async delete(id: string): Promise<void> {
        try {
            await this.update(id, { is_active: false });
        } catch (error) {
            throw error;
        }
    }

    // Get all active suppliers
    static async findActive(): Promise<Supplier[]> {
        try {
            return await supplierService.getActiveSuppliers();
        } catch (error) {
            throw error;
        }
    }

    // Get all suppliers (including inactive)
    static async findAll(): Promise<Supplier[]> {
        try {
            return await dbService.select('suppliers', {
                orderBy: { column: 'name', ascending: true }
            });
        } catch (error) {
            throw error;
        }
    }

    // Search suppliers
    static async search(searchTerm: string): Promise<Supplier[]> {
        try {
            return await supplierService.searchSuppliers(searchTerm);
        } catch (error) {
            throw error;
        }
    }

    // Get suppliers by material category
    static async findByMaterialCategory(category: string): Promise<Supplier[]> {
        try {
            const { data, error } = await dbService.supabase
                .from('suppliers')
                .select('*')
                .contains('material_categories', [category])
                .eq('is_active', true)
                .order('name');

            if (error) {
                throw new SupabaseError(error);
            }

            return data;
        } catch (error) {
            throw error;
        }
    }

    // Count suppliers
    static async count(filters?: { is_active?: boolean }): Promise<number> {
        try {
            return await dbService.count('suppliers', filters);
        } catch (error) {
            throw error;
        }
    }

    // Check if supplier exists
    static async exists(id: string): Promise<boolean> {
        try {
            const supplier = await this.findById(id);
            return supplier !== null;
        } catch (error) {
            return false;
        }
    }

    // Activate supplier
    static async activate(id: string): Promise<Supplier> {
        return await this.update(id, { is_active: true });
    }

    // Deactivate supplier
    static async deactivate(id: string): Promise<Supplier> {
        return await this.update(id, { is_active: false });
    }

    // Get supplier statistics
    static async getStatistics(): Promise<{
        total: number;
        active: number;
        inactive: number;
        byMaterialCategory: Record<string, number>;
    }> {
        try {
            const total = await this.count();
            const active = await this.count({ is_active: true });
            const inactive = total - active;

            // Get all suppliers to analyze material categories
            const suppliers = await this.findActive();
            const byMaterialCategory: Record<string, number> = {};

            suppliers.forEach(supplier => {
                supplier.material_categories.forEach(category => {
                    byMaterialCategory[category] = (byMaterialCategory[category] || 0) + 1;
                });
            });

            return {
                total,
                active,
                inactive,
                byMaterialCategory
            };
        } catch (error) {
            throw error;
        }
    }

    // Get suppliers with pagination
    static async findWithPagination(
        page: number = 1,
        limit: number = 50,
        filters?: {
            search?: string;
            material_category?: string;
            is_active?: boolean;
        }
    ): Promise<{
        suppliers: Supplier[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        try {
            const offset = (page - 1) * limit;
            let query = dbService.supabase
                .from('suppliers')
                .select('*', { count: 'exact' });

            // Apply filters
            if (filters?.is_active !== undefined) {
                query = query.eq('is_active', filters.is_active);
            }

            if (filters?.material_category) {
                query = query.contains('material_categories', [filters.material_category]);
            }

            if (filters?.search) {
                query = query.or(
                    `name.ilike.%${filters.search}%,code.ilike.%${filters.search}%,contact_person.ilike.%${filters.search}%`
                );
            }

            // Apply pagination and ordering
            const { data, error, count } = await query
                .order('name', { ascending: true })
                .range(offset, offset + limit - 1);

            if (error) {
                throw new SupabaseError(error);
            }

            const total = count || 0;
            const totalPages = Math.ceil(total / limit);

            return {
                suppliers: data || [],
                total,
                page,
                limit,
                totalPages
            };
        } catch (error) {
            throw error;
        }
    }

    // Update supplier material categories
    static async updateMaterialCategories(id: string, categories: string[]): Promise<Supplier> {
        return await this.update(id, { 
            material_categories: categories.map(cat => cat.trim()).filter(cat => cat.length > 0)
        });
    }

    // Add material category to supplier
    static async addMaterialCategory(id: string, category: string): Promise<Supplier> {
        const supplier = await this.findById(id);
        if (!supplier) {
            throw new Error('Supplier not found');
        }

        const newCategory = category.trim();
        if (!supplier.material_categories.includes(newCategory)) {
            const updatedCategories = [...supplier.material_categories, newCategory];
            return await this.updateMaterialCategories(id, updatedCategories);
        }

        return supplier;
    }

    // Remove material category from supplier
    static async removeMaterialCategory(id: string, category: string): Promise<Supplier> {
        const supplier = await this.findById(id);
        if (!supplier) {
            throw new Error('Supplier not found');
        }

        const updatedCategories = supplier.material_categories.filter(cat => cat !== category.trim());
        return await this.updateMaterialCategories(id, updatedCategories);
    }
}

export default SupplierModel;
