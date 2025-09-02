-- ================================================================
-- KYS (KALITE YÖNETIM SISTEMI) COMPLETE DATABASE MIGRATION
-- OTOMATIK OLUŞTURULDU - TEK SEFERDE TÜM TABLOLARI OLUŞTURUR
-- ================================================================

-- 1. EXTENSIONS VE ENUM'LAR
-- ================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE IF NOT EXISTS user_role AS ENUM ('admin', 'quality', 'production', 'supplier', 'viewer');
CREATE TYPE IF NOT EXISTS quality_control_status AS ENUM ('pending', 'approved', 'rejected', 'conditional');
CREATE TYPE IF NOT EXISTS vehicle_status AS ENUM ('production', 'quality_control', 'returned_to_production', 'service', 'ready_for_shipment', 'shipped');
CREATE TYPE IF NOT EXISTS defect_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE IF NOT EXISTS defect_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE IF NOT EXISTS tank_leak_test_status AS ENUM ('passed', 'failed', 'pending');
CREATE TYPE IF NOT EXISTS deviation_type AS ENUM ('input-control', 'process-control', 'final-control');
CREATE TYPE IF NOT EXISTS quality_risk AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE IF NOT EXISTS deviation_status AS ENUM ('pending', 'rd-approved', 'quality-approved', 'production-approved', 'final-approved', 'rejected');

-- 2. CORE TABLES (Users, Suppliers)
-- ================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'viewer',
    department VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    material_categories TEXT[] NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. QUALITY CONTROL TABLES
-- ================================================================

-- Material Quality Controls table
CREATE TABLE IF NOT EXISTS material_quality_controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_code VARCHAR(100) NOT NULL,
    material_name VARCHAR(255) NOT NULL,
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    supplier_name VARCHAR(255) NOT NULL,
    batch_number VARCHAR(100) NOT NULL,
    received_date DATE NOT NULL,
    inspection_date DATE NOT NULL DEFAULT CURRENT_DATE,
    inspector_id UUID NOT NULL REFERENCES users(id),
    certificate_number VARCHAR(100),
    certificate_upload_path TEXT,
    certificate_properties JSONB DEFAULT '[]'::jsonb,
    visual_inspection_notes TEXT,
    dimensional_inspection_notes TEXT,
    status quality_control_status DEFAULT 'pending',
    approved_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(supplier_id, material_code, batch_number)
);

-- Quality Control Reports table
CREATE TABLE IF NOT EXISTS quality_control_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id VARCHAR(50) UNIQUE NOT NULL,
    material_quality_control_id UUID NOT NULL REFERENCES material_quality_controls(id),
    report_type VARCHAR(50) DEFAULT 'INPUT_QUALITY_CONTROL',
    material_code VARCHAR(100) NOT NULL,
    material_name VARCHAR(255) NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    batch_number VARCHAR(100) NOT NULL,
    certificate_number VARCHAR(100),
    test_operator JSONB NOT NULL,
    quality_controller JSONB NOT NULL,
    overall_quality_grade VARCHAR(10) CHECK (overall_quality_grade IN ('B', 'C', 'D', 'REJECT')),
    standard_reference VARCHAR(255) NOT NULL,
    test_results JSONB DEFAULT '{}'::jsonb,
    conclusion TEXT NOT NULL,
    pdf_path TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicle Quality Controls table
CREATE TABLE IF NOT EXISTS vehicle_quality_controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_name VARCHAR(255) NOT NULL,
    vehicle_model VARCHAR(255) NOT NULL,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    sps_number VARCHAR(100) NOT NULL,
    production_date DATE NOT NULL,
    description TEXT,
    current_status vehicle_status DEFAULT 'production',
    status_history JSONB DEFAULT '[]'::jsonb,
    defects JSONB DEFAULT '[]'::jsonb,
    quality_entry_date DATE,
    production_return_date DATE,
    quality_reentry_date DATE,
    service_start_date DATE,
    service_end_date DATE,
    shipment_ready_date DATE,
    shipment_date DATE,
    is_overdue BOOLEAN DEFAULT false,
    overdue_date DATE,
    warning_level VARCHAR(20) DEFAULT 'none' CHECK (warning_level IN ('none', 'warning', 'critical')),
    priority defect_priority DEFAULT 'medium',
    estimated_completion_date DATE,
    shipment_type VARCHAR(20) CHECK (shipment_type IN ('normal', 'deviation_approved')),
    shipment_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ADDITIONAL MODULE TABLES
-- ================================================================

-- Tank Leak Tests table  
CREATE TABLE IF NOT EXISTS tank_leak_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tank_id VARCHAR(100) NOT NULL,
    tank_type VARCHAR(100) NOT NULL,
    test_type VARCHAR(100) NOT NULL,
    material_type VARCHAR(100) NOT NULL,
    welder_id UUID NOT NULL REFERENCES users(id),
    welder_name VARCHAR(255) NOT NULL,
    quality_inspector_id UUID NOT NULL REFERENCES users(id),
    quality_inspector_name VARCHAR(255) NOT NULL,
    test_date DATE NOT NULL DEFAULT CURRENT_DATE,
    test_pressure DECIMAL(10,2) NOT NULL,
    pressure_unit VARCHAR(10) DEFAULT 'bar',
    test_duration INTEGER NOT NULL,
    duration_unit VARCHAR(10) DEFAULT 'minutes',
    initial_pressure DECIMAL(10,2) NOT NULL,
    final_pressure DECIMAL(10,2) NOT NULL,
    pressure_drop DECIMAL(10,2) NOT NULL,
    max_allowed_pressure_drop DECIMAL(10,2) NOT NULL,
    temperature DECIMAL(5,2) NOT NULL,
    temperature_unit VARCHAR(5) DEFAULT '°C',
    humidity DECIMAL(5,2) NOT NULL,
    status tank_leak_test_status DEFAULT 'pending',
    notes TEXT,
    image_urls TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deviation Approvals table
CREATE TABLE IF NOT EXISTS deviation_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deviation_number VARCHAR(50) UNIQUE NOT NULL,
    part_name VARCHAR(255) NOT NULL,
    part_number VARCHAR(100) NOT NULL,
    vehicles JSONB DEFAULT '[]'::jsonb,
    deviation_type deviation_type NOT NULL,
    description TEXT NOT NULL,
    reason_for_deviation TEXT,
    proposed_solution TEXT,
    quality_risk quality_risk NOT NULL,
    request_date DATE NOT NULL,
    requested_by VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    rd_approval JSONB DEFAULT '{"approved": false}'::jsonb,
    quality_approval JSONB DEFAULT '{"approved": false}'::jsonb,
    production_approval JSONB DEFAULT '{"approved": false}'::jsonb,
    general_manager_approval JSONB DEFAULT '{"approved": false}'::jsonb,
    status deviation_status DEFAULT 'pending',
    rejection_reason TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_by VARCHAR(255) NOT NULL,
    last_modified_by VARCHAR(255) NOT NULL,
    completed_date DATE,
    total_approval_time INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DOF Records (8D Management)
CREATE TABLE IF NOT EXISTS dof_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dof_number VARCHAR(50) UNIQUE NOT NULL,
    problem_description TEXT NOT NULL,
    customer_name VARCHAR(255),
    product_code VARCHAR(100),
    problem_date DATE,
    priority_level VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'open',
    team_members TEXT[],
    step_1_team TEXT,
    step_2_problem TEXT,
    step_3_interim_action TEXT,
    step_4_root_cause TEXT,
    step_5_permanent_action TEXT,
    step_6_implementation TEXT,
    step_7_prevention TEXT,
    step_8_closure TEXT,
    completion_percentage INTEGER DEFAULT 0,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    due_date DATE,
    closed_date DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quality Costs table
CREATE TABLE IF NOT EXISTS quality_costs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cost_category VARCHAR(50) NOT NULL,
    cost_type VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    cost_amount DECIMAL(12,2) NOT NULL,
    cost_date DATE NOT NULL,
    description TEXT,
    project_code VARCHAR(50),
    responsible_person VARCHAR(255),
    budget_code VARCHAR(50),
    cost_center VARCHAR(50),
    is_recurring BOOLEAN DEFAULT false,
    frequency VARCHAR(20),
    justification TEXT,
    approved_by VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quarantine Records table
CREATE TABLE IF NOT EXISTS quarantine_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quarantine_number VARCHAR(50) UNIQUE NOT NULL,
    part_code VARCHAR(100) NOT NULL,
    part_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit VARCHAR(20),
    quarantine_reason TEXT NOT NULL,
    responsible_department VARCHAR(100),
    supplier_name VARCHAR(255),
    production_order VARCHAR(50),
    inspection_type VARCHAR(50),
    inspector_name VARCHAR(255),
    inspection_results TEXT,
    material_type VARCHAR(100),
    vehicle_model VARCHAR(100),
    location VARCHAR(100),
    status VARCHAR(20) DEFAULT 'quarantined',
    disposition VARCHAR(50),
    disposition_reason TEXT,
    release_date DATE,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. INDEXES FOR PERFORMANCE
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_suppliers_code ON suppliers(code);
CREATE INDEX IF NOT EXISTS idx_material_qc_supplier ON material_quality_controls(supplier_id);
CREATE INDEX IF NOT EXISTS idx_material_qc_status ON material_quality_controls(status);
CREATE INDEX IF NOT EXISTS idx_vehicle_qc_serial ON vehicle_quality_controls(serial_number);
CREATE INDEX IF NOT EXISTS idx_vehicle_qc_status ON vehicle_quality_controls(current_status);
CREATE INDEX IF NOT EXISTS idx_tank_tests_date ON tank_leak_tests(test_date);
CREATE INDEX IF NOT EXISTS idx_deviation_status ON deviation_approvals(status);
CREATE INDEX IF NOT EXISTS idx_dof_status ON dof_records(status);
CREATE INDEX IF NOT EXISTS idx_quality_costs_date ON quality_costs(cost_date);
CREATE INDEX IF NOT EXISTS idx_quarantine_status ON quarantine_records(status);

-- 6. ENABLE RLS (Row Level Security)
-- ================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_quality_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_control_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_quality_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE tank_leak_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE deviation_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE dof_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarantine_records ENABLE ROW LEVEL SECURITY;

-- 7. CREATE RLS POLICIES
-- ================================================================
-- Users policies
DROP POLICY IF EXISTS "Users can view all users" ON users;
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);

-- Authenticated user policies for all tables
DROP POLICY IF EXISTS "All authenticated users can access suppliers" ON suppliers;
CREATE POLICY "All authenticated users can access suppliers" ON suppliers FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "All authenticated users can access material controls" ON material_quality_controls;
CREATE POLICY "All authenticated users can access material controls" ON material_quality_controls FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "All authenticated users can access quality reports" ON quality_control_reports;
CREATE POLICY "All authenticated users can access quality reports" ON quality_control_reports FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "All authenticated users can access vehicle controls" ON vehicle_quality_controls;
CREATE POLICY "All authenticated users can access vehicle controls" ON vehicle_quality_controls FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "All authenticated users can access tank tests" ON tank_leak_tests;
CREATE POLICY "All authenticated users can access tank tests" ON tank_leak_tests FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "All authenticated users can access deviation approvals" ON deviation_approvals;
CREATE POLICY "All authenticated users can access deviation approvals" ON deviation_approvals FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "All authenticated users can access dof records" ON dof_records;
CREATE POLICY "All authenticated users can access dof records" ON dof_records FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "All authenticated users can access quality costs" ON quality_costs;
CREATE POLICY "All authenticated users can access quality costs" ON quality_costs FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "All authenticated users can access quarantine records" ON quarantine_records;
CREATE POLICY "All authenticated users can access quarantine records" ON quarantine_records FOR ALL USING (auth.role() = 'authenticated');

-- 8. CREATE TRIGGERS AND FUNCTIONS
-- ================================================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_material_quality_controls_updated_at ON material_quality_controls;
CREATE TRIGGER update_material_quality_controls_updated_at BEFORE UPDATE ON material_quality_controls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quality_control_reports_updated_at ON quality_control_reports;
CREATE TRIGGER update_quality_control_reports_updated_at BEFORE UPDATE ON quality_control_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vehicle_quality_controls_updated_at ON vehicle_quality_controls;
CREATE TRIGGER update_vehicle_quality_controls_updated_at BEFORE UPDATE ON vehicle_quality_controls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tank_leak_tests_updated_at ON tank_leak_tests;
CREATE TRIGGER update_tank_leak_tests_updated_at BEFORE UPDATE ON tank_leak_tests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_deviation_approvals_updated_at ON deviation_approvals;
CREATE TRIGGER update_deviation_approvals_updated_at BEFORE UPDATE ON deviation_approvals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dof_records_updated_at ON dof_records;
CREATE TRIGGER update_dof_records_updated_at BEFORE UPDATE ON dof_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quality_costs_updated_at ON quality_costs;
CREATE TRIGGER update_quality_costs_updated_at BEFORE UPDATE ON quality_costs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quarantine_records_updated_at ON quarantine_records;
CREATE TRIGGER update_quarantine_records_updated_at BEFORE UPDATE ON quarantine_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate report IDs
CREATE OR REPLACE FUNCTION generate_report_id()
RETURNS TEXT AS $$
DECLARE
    current_date_str TEXT;
    report_count INTEGER;
    report_id TEXT;
BEGIN
    current_date_str := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
    
    SELECT COUNT(*) + 1 INTO report_count
    FROM quality_control_reports
    WHERE report_id LIKE 'QCR-' || current_date_str || '-%';
    
    report_id := 'QCR-' || current_date_str || '-' || LPAD(report_count::TEXT, 4, '0');
    
    RETURN report_id;
END;
$$ LANGUAGE plpgsql;

-- Function for tank leak test results
CREATE OR REPLACE FUNCTION calculate_tank_test_result()
RETURNS TRIGGER AS $$
BEGIN
    NEW.pressure_drop := NEW.initial_pressure - NEW.final_pressure;
    
    IF NEW.pressure_drop <= NEW.max_allowed_pressure_drop THEN
        NEW.status := 'passed';
    ELSE
        NEW.status := 'failed';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tank_test_result_trigger ON tank_leak_tests;
CREATE TRIGGER tank_test_result_trigger 
    BEFORE INSERT OR UPDATE ON tank_leak_tests 
    FOR EACH ROW EXECUTE FUNCTION calculate_tank_test_result();

-- Vehicle warning system function
CREATE OR REPLACE FUNCTION update_vehicle_warning_system()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if vehicle is overdue
    IF NEW.current_status IN ('quality_control', 'service') AND NEW.estimated_completion_date < CURRENT_DATE THEN
        NEW.is_overdue := true;
        NEW.overdue_date := CURRENT_DATE;
        
        -- Set warning level based on days overdue
        IF (CURRENT_DATE - NEW.estimated_completion_date) > 7 THEN
            NEW.warning_level := 'critical';
        ELSE
            NEW.warning_level := 'warning';
        END IF;
    ELSE
        NEW.is_overdue := false;
        NEW.overdue_date := NULL;
        NEW.warning_level := 'none';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vehicle_warning_trigger ON vehicle_quality_controls;
CREATE TRIGGER vehicle_warning_trigger 
    BEFORE INSERT OR UPDATE ON vehicle_quality_controls 
    FOR EACH ROW EXECUTE FUNCTION update_vehicle_warning_system();

-- ================================================================
-- MIGRATION TAMAMLANDI!
-- ================================================================
-- 
-- Bu SQL dosyası KYS (Kalite Yönetim Sistemi) için gereken
-- tüm tabloları, indexleri, triggerleri ve fonksiyonları oluşturur.
-- 
-- TOPLAM OLUŞTURULAN:
-- ✅ 10 Ana Tablo
-- ✅ 9 Enum Type 
-- ✅ 11 Index
-- ✅ 10 RLS Policy
-- ✅ 10 Updated_at Trigger
-- ✅ 4 Özel Fonksiyon
-- ✅ 3 Business Logic Trigger
-- 
-- Supabase Dashboard > SQL Editor'de bu dosyayı çalıştırın!
-- ================================================================
