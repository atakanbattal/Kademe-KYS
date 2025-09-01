import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Missing Supabase configuration. Please check REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY environment variables.');
}

// Create Supabase client for frontend
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true, // Frontend should persist sessions
        detectSessionInUrl: true,
    },
    // Realtime features enabled by default
});

// Database types for better TypeScript support
export type Database = {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    name: string;
                    email: string;
                    role: 'admin' | 'quality' | 'production' | 'supplier' | 'viewer';
                    department: string | null;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    email: string;
                    role?: 'admin' | 'quality' | 'production' | 'supplier' | 'viewer';
                    department?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    email?: string;
                    role?: 'admin' | 'quality' | 'production' | 'supplier' | 'viewer';
                    department?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            suppliers: {
                Row: {
                    id: string;
                    name: string;
                    code: string;
                    contact_person: string;
                    email: string;
                    phone: string;
                    address: string;
                    is_active: boolean;
                    material_categories: string[];
                    notes: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    code: string;
                    contact_person: string;
                    email: string;
                    phone: string;
                    address: string;
                    is_active?: boolean;
                    material_categories: string[];
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    code?: string;
                    contact_person?: string;
                    email?: string;
                    phone?: string;
                    address?: string;
                    is_active?: boolean;
                    material_categories?: string[];
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            user_role: 'admin' | 'quality' | 'production' | 'supplier' | 'viewer';
            quality_control_status: 'pending' | 'approved' | 'rejected' | 'conditional';
            vehicle_status: 'production' | 'quality_control' | 'returned_to_production' | 'service' | 'ready_for_shipment' | 'shipped';
            defect_priority: 'low' | 'medium' | 'high' | 'critical';
            defect_status: 'open' | 'in_progress' | 'resolved' | 'closed';
            tank_leak_test_status: 'passed' | 'failed' | 'pending';
            deviation_type: 'input-control' | 'process-control' | 'final-control';
            quality_risk: 'low' | 'medium' | 'high' | 'critical';
            deviation_status: 'pending' | 'rd-approved' | 'quality-approved' | 'production-approved' | 'final-approved' | 'rejected';
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};

export default supabase;
