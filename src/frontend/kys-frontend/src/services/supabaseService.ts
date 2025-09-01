import { supabase } from '../config/supabase';

// User authentication with Supabase Auth (if needed in the future)
export const supabaseAuthService = {
    // Sign up with email and password
    async signUp(email: string, password: string, userData: { name: string; role?: string; department?: string }) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: userData
            }
        });
        
        if (error) throw error;
        return data;
    },

    // Sign in with email and password
    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        return data;
    },

    // Sign out
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    // Get current session
    async getSession() {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data.session;
    },

    // Get current user
    async getCurrentUser() {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        return data.user;
    },

    // Listen to auth state changes
    onAuthStateChange(callback: (event: string, session: any) => void) {
        return supabase.auth.onAuthStateChange(callback);
    }
};

// Direct database operations (for future use or testing)
export const supabaseDbService = {
    // Generic select
    async select<T>(table: string, options: {
        select?: string;
        filters?: Record<string, any>;
        orderBy?: { column: string; ascending?: boolean };
        limit?: number;
    } = {}): Promise<T[]> {
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

        // Apply limit
        if (options.limit) {
            query = query.limit(options.limit);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as T[];
    },

    // Generic insert
    async insert<T>(table: string, data: any | any[]): Promise<T[]> {
        const { data: result, error } = await supabase
            .from(table)
            .insert(data)
            .select();

        if (error) throw error;
        return result as T[];
    },

    // Generic update
    async update<T>(table: string, id: string, updates: any): Promise<T> {
        const { data, error } = await supabase
            .from(table)
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as T;
    },

    // Generic delete
    async delete(table: string, id: string): Promise<void> {
        const { error } = await supabase
            .from(table)
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Search
    async search<T>(table: string, searchColumn: string, searchTerm: string): Promise<T[]> {
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .ilike(searchColumn, `%${searchTerm}%`);

        if (error) throw error;
        return data as T[];
    }
};

// Real-time subscriptions
export const supabaseRealtimeService = {
    // Subscribe to table changes
    subscribeToTable(table: string, callback: (payload: any) => void) {
        return supabase
            .channel(`${table}_changes`)
            .on('postgres_changes', 
                { event: '*', schema: 'public', table }, 
                callback
            )
            .subscribe();
    },

    // Subscribe to specific record changes
    subscribeToRecord(table: string, id: string, callback: (payload: any) => void) {
        return supabase
            .channel(`${table}_${id}_changes`)
            .on('postgres_changes', 
                { event: '*', schema: 'public', table, filter: `id=eq.${id}` }, 
                callback
            )
            .subscribe();
    },

    // Unsubscribe from a channel
    unsubscribe(subscription: any) {
        return supabase.removeChannel(subscription);
    }
};

// File storage operations
export const supabaseStorageService = {
    // Upload file
    async uploadFile(bucket: string, path: string, file: File): Promise<string> {
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, file);

        if (error) throw error;
        return data.path;
    },

    // Download file URL
    async getFileUrl(bucket: string, path: string): Promise<string> {
        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(path);

        return data.publicUrl;
    },

    // Delete file
    async deleteFile(bucket: string, path: string): Promise<void> {
        const { error } = await supabase.storage
            .from(bucket)
            .remove([path]);

        if (error) throw error;
    },

    // List files in directory
    async listFiles(bucket: string, folder: string = ''): Promise<any[]> {
        const { data, error } = await supabase.storage
            .from(bucket)
            .list(folder);

        if (error) throw error;
        return data || [];
    }
};

// Specific services for the KYS application
export const kysSupabaseService = {
    // Users
    users: {
        async getAll() {
            return supabaseDbService.select('users', {
                orderBy: { column: 'name', ascending: true }
            });
        },

        async getActive() {
            return supabaseDbService.select('users', {
                filters: { is_active: true },
                orderBy: { column: 'name', ascending: true }
            });
        },

        async search(searchTerm: string) {
            return supabaseDbService.search('users', 'name', searchTerm);
        }
    },

    // Suppliers
    suppliers: {
        async getAll() {
            return supabaseDbService.select('suppliers', {
                orderBy: { column: 'name', ascending: true }
            });
        },

        async getActive() {
            return supabaseDbService.select('suppliers', {
                filters: { is_active: true },
                orderBy: { column: 'name', ascending: true }
            });
        },

        async search(searchTerm: string) {
            const { data, error } = await supabase
                .from('suppliers')
                .select('*')
                .or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%,contact_person.ilike.%${searchTerm}%`)
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            return data;
        }
    },

    // Material Quality Controls
    materialQualityControls: {
        async getAll() {
            return supabaseDbService.select('material_quality_controls', {
                orderBy: { column: 'inspection_date', ascending: false }
            });
        },

        async getByStatus(status: string) {
            return supabaseDbService.select('material_quality_controls', {
                filters: { status },
                orderBy: { column: 'inspection_date', ascending: false }
            });
        },

        async getBySupplier(supplierId: string) {
            return supabaseDbService.select('material_quality_controls', {
                filters: { supplier_id: supplierId },
                orderBy: { column: 'inspection_date', ascending: false }
            });
        },

        async search(searchTerm: string) {
            const { data, error } = await supabase
                .from('material_quality_controls')
                .select('*')
                .or(`material_code.ilike.%${searchTerm}%,material_name.ilike.%${searchTerm}%,batch_number.ilike.%${searchTerm}%,supplier_name.ilike.%${searchTerm}%`)
                .order('inspection_date', { ascending: false });

            if (error) throw error;
            return data;
        }
    },

    // Real-time subscriptions for KYS
    realtime: {
        // Subscribe to material quality control changes
        subscribeMaterialQualityControls(callback: (payload: any) => void) {
            return supabaseRealtimeService.subscribeToTable('material_quality_controls', callback);
        },

        // Subscribe to supplier changes
        subscribeSuppliers(callback: (payload: any) => void) {
            return supabaseRealtimeService.subscribeToTable('suppliers', callback);
        },

        // Subscribe to user changes
        subscribeUsers(callback: (payload: any) => void) {
            return supabaseRealtimeService.subscribeToTable('users', callback);
        }
    }
};

export default {
    auth: supabaseAuthService,
    db: supabaseDbService,
    realtime: supabaseRealtimeService,
    storage: supabaseStorageService,
    kys: kysSupabaseService
};
