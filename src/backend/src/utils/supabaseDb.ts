import { supabase, Database } from '../config/supabase';
import { PostgrestError } from '@supabase/supabase-js';

// Type definitions for better TypeScript support
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Generic error handling for Supabase operations
export class SupabaseError extends Error {
    public code: string;
    public details: string;
    public hint: string;

    constructor(error: PostgrestError) {
        super(error.message);
        this.name = 'SupabaseError';
        this.code = error.code;
        this.details = error.details;
        this.hint = error.hint;
    }
}

// Database connection test
export const testConnection = async (): Promise<boolean> => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('count', { count: 'exact', head: true });
        
        if (error) {
            console.error('❌ Supabase connection test failed:', error);
            return false;
        }
        
        console.log('✅ Supabase connection test successful');
        return true;
    } catch (error) {
        console.error('❌ Supabase connection test failed:', error);
        return false;
    }
};

// Database service functions
export const dbService = {
    // Expose supabase client for advanced queries
    supabase,
    // Generic select function
    async select<T extends keyof Database['public']['Tables']>(
        table: T,
        options: {
            select?: string;
            filters?: Record<string, any>;
            orderBy?: { column: string; ascending?: boolean };
            limit?: number;
            offset?: number;
        } = {}
    ): Promise<Tables<T>[]> {
        let query = supabase.from(table).select(options.select || '*');

        // Apply filters
        if (options.filters) {
            Object.entries(options.filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    query = query.eq(key, value);
                }
            });
        }

        // Apply ordering
        if (options.orderBy) {
            query = query.order(options.orderBy.column, { 
                ascending: options.orderBy.ascending ?? true 
            });
        }

        // Apply pagination
        if (options.limit) {
            query = query.limit(options.limit);
        }
        if (options.offset) {
            query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
        }

        const { data, error } = await query;

        if (error) {
            throw new SupabaseError(error);
        }

        return (data || []) as any;
    },

    // Generic insert function
    async insert<T extends keyof Database['public']['Tables']>(
        table: T,
        data: Inserts<T> | Inserts<T>[]
    ): Promise<Tables<T>[]> {
        const { data: result, error } = await supabase
            .from(table)
            .insert(data)
            .select();

        if (error) {
            throw new SupabaseError(error);
        }

        return result as Tables<T>[];
    },

    // Generic update function
    async update<T extends keyof Database['public']['Tables']>(
        table: T,
        id: string,
        updates: Updates<T>
    ): Promise<Tables<T>> {
        const { data, error } = await supabase
            .from(table)
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new SupabaseError(error);
        }

        return data as Tables<T>;
    },

    // Generic delete function
    async delete<T extends keyof Database['public']['Tables']>(
        table: T,
        id: string
    ): Promise<void> {
        const { error } = await supabase
            .from(table)
            .delete()
            .eq('id', id);

        if (error) {
            throw new SupabaseError(error);
        }
    },

    // Find by ID
    async findById<T extends keyof Database['public']['Tables']>(
        table: T,
        id: string
    ): Promise<Tables<T> | null> {
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // No rows found
            }
            throw new SupabaseError(error);
        }

        return data as Tables<T>;
    },

    // Search function with text search
    async search<T extends keyof Database['public']['Tables']>(
        table: T,
        searchColumn: string,
        searchTerm: string,
        options: {
            select?: string;
            limit?: number;
            offset?: number;
        } = {}
    ): Promise<Tables<T>[]> {
        const { data, error } = await supabase
            .from(table)
            .select(options.select || '*')
            .ilike(searchColumn, `%${searchTerm}%`)
            .limit(options.limit || 50)
            .range(options.offset || 0, (options.offset || 0) + (options.limit || 50) - 1);

        if (error) {
            throw new SupabaseError(error);
        }

        return (data || []) as any;
    },

    // Count function
    async count<T extends keyof Database['public']['Tables']>(
        table: T,
        filters?: Record<string, any>
    ): Promise<number> {
        let query = supabase.from(table).select('*', { count: 'exact', head: true });

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    query = query.eq(key, value);
                }
            });
        }

        const { count, error } = await query;

        if (error) {
            throw new SupabaseError(error);
        }

        return count || 0;
    },

    // Batch operations
    async batchInsert<T extends keyof Database['public']['Tables']>(
        table: T,
        data: Inserts<T>[],
        batchSize: number = 100
    ): Promise<Tables<T>[]> {
        const results: Tables<T>[] = [];
        
        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            const batchResult = await this.insert(table, batch);
            results.push(...batchResult);
        }

        return results;
    },

    // Complex query with joins
    async joinQuery(query: string, params?: any[]): Promise<any[]> {
        const { data, error } = await supabase.rpc('exec_sql', {
            query,
            params: params || []
        });

        if (error) {
            throw new SupabaseError(error);
        }

        return data;
    }
};

// User-specific functions
export const userService = {
    async findByEmail(email: string): Promise<Tables<'users'> | null> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // No user found
            }
            throw new SupabaseError(error);
        }

        return data;
    },

    async createUser(userData: Inserts<'users'>): Promise<Tables<'users'>> {
        const result = await dbService.insert('users', userData);
        return result[0];
    },

    async updateUser(id: string, updates: Updates<'users'>): Promise<Tables<'users'>> {
        return await dbService.update('users', id, updates);
    },

    async getActiveUsers(): Promise<Tables<'users'>[]> {
        return await dbService.select('users', {
            filters: { is_active: true },
            orderBy: { column: 'name', ascending: true }
        });
    }
};

// Supplier-specific functions
export const supplierService = {
    async findByCode(code: string): Promise<Tables<'suppliers'> | null> {
        const { data, error } = await supabase
            .from('suppliers')
            .select('*')
            .eq('code', code)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            throw new SupabaseError(error);
        }

        return data;
    },

    async getActiveSuppliers(): Promise<Tables<'suppliers'>[]> {
        return await dbService.select('suppliers', {
            filters: { is_active: true },
            orderBy: { column: 'name', ascending: true }
        });
    },

    async searchSuppliers(searchTerm: string): Promise<Tables<'suppliers'>[]> {
        const { data, error } = await supabase
            .from('suppliers')
            .select('*')
            .or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%,contact_person.ilike.%${searchTerm}%`)
            .eq('is_active', true)
            .order('name');

        if (error) {
            throw new SupabaseError(error);
        }

        return data;
    }
};

export default dbService;
