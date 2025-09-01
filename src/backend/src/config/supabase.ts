import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase configuration. Please check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: false, // Backend doesn't need session persistence
    },
    // Realtime disabled for backend
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
                    password_hash: string;
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
                    password_hash: string;
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
                    password_hash?: string;
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
            material_quality_controls: {
                Row: {
                    id: string;
                    material_code: string;
                    material_name: string;
                    supplier_id: string;
                    supplier_name: string;
                    batch_number: string;
                    received_date: string;
                    inspection_date: string;
                    inspector_id: string;
                    certificate_number: string | null;
                    certificate_upload_path: string | null;
                    certificate_properties: any;
                    visual_inspection_notes: string | null;
                    dimensional_inspection_notes: string | null;
                    status: 'pending' | 'approved' | 'rejected' | 'conditional';
                    approved_by: string | null;
                    rejection_reason: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    material_code: string;
                    material_name: string;
                    supplier_id: string;
                    supplier_name: string;
                    batch_number: string;
                    received_date: string;
                    inspection_date: string;
                    inspector_id: string;
                    certificate_number?: string | null;
                    certificate_upload_path?: string | null;
                    certificate_properties?: any;
                    visual_inspection_notes?: string | null;
                    dimensional_inspection_notes?: string | null;
                    status?: 'pending' | 'approved' | 'rejected' | 'conditional';
                    approved_by?: string | null;
                    rejection_reason?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    material_code?: string;
                    material_name?: string;
                    supplier_id?: string;
                    supplier_name?: string;
                    batch_number?: string;
                    received_date?: string;
                    inspection_date?: string;
                    inspector_id?: string;
                    certificate_number?: string | null;
                    certificate_upload_path?: string | null;
                    certificate_properties?: any;
                    visual_inspection_notes?: string | null;
                    dimensional_inspection_notes?: string | null;
                    status?: 'pending' | 'approved' | 'rejected' | 'conditional';
                    approved_by?: string | null;
                    rejection_reason?: string | null;
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
