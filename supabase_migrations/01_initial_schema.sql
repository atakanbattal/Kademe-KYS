-- Initial schema migration for KYS (Kalite Yönetim Sistemi)
-- This creates all the necessary tables, enums, and constraints

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE user_role AS ENUM ('admin', 'quality', 'production', 'supplier', 'viewer');
CREATE TYPE quality_control_status AS ENUM ('pending', 'approved', 'rejected', 'conditional');
CREATE TYPE vehicle_status AS ENUM ('production', 'quality_control', 'returned_to_production', 'service', 'ready_for_shipment', 'shipped');
CREATE TYPE defect_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE defect_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE tank_leak_test_status AS ENUM ('passed', 'failed', 'pending');
CREATE TYPE deviation_type AS ENUM ('input-control', 'process-control', 'final-control');
CREATE TYPE quality_risk AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE deviation_status AS ENUM ('pending', 'rd-approved', 'quality-approved', 'production-approved', 'final-approved', 'rejected');

-- Users table
CREATE TABLE users (
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
CREATE TABLE suppliers (
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

-- Material Quality Controls table
CREATE TABLE material_quality_controls (
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
    
    -- Unique constraint for material-batch combination per supplier
    UNIQUE(supplier_id, material_code, batch_number)
);

-- Quality Control Reports table
CREATE TABLE quality_control_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id VARCHAR(50) UNIQUE NOT NULL,
    material_quality_control_id UUID NOT NULL REFERENCES material_quality_controls(id),
    report_type VARCHAR(50) DEFAULT 'INPUT_QUALITY_CONTROL',
    material_code VARCHAR(100) NOT NULL,
    material_name VARCHAR(255) NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    batch_number VARCHAR(100) NOT NULL,
    certificate_number VARCHAR(100),
    test_operator JSONB NOT NULL, -- {id, name, employeeId}
    quality_controller JSONB NOT NULL, -- {id, name, employeeId}
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
CREATE TABLE vehicle_quality_controls (
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

-- Tank Leak Tests table
CREATE TABLE tank_leak_tests (
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
CREATE TABLE deviation_approvals (
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
    total_approval_time INTEGER, -- in hours
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

CREATE INDEX idx_suppliers_code ON suppliers(code);
CREATE INDEX idx_suppliers_active ON suppliers(is_active);

CREATE INDEX idx_material_qc_supplier ON material_quality_controls(supplier_id);
CREATE INDEX idx_material_qc_status ON material_quality_controls(status);
CREATE INDEX idx_material_qc_date ON material_quality_controls(inspection_date);
CREATE INDEX idx_material_qc_material ON material_quality_controls(material_code);

CREATE INDEX idx_qc_reports_report_id ON quality_control_reports(report_id);
CREATE INDEX idx_qc_reports_material_qc ON quality_control_reports(material_quality_control_id);
CREATE INDEX idx_qc_reports_date ON quality_control_reports(created_at);

CREATE INDEX idx_vehicle_qc_serial ON vehicle_quality_controls(serial_number);
CREATE INDEX idx_vehicle_qc_status ON vehicle_quality_controls(current_status);
CREATE INDEX idx_vehicle_qc_customer ON vehicle_quality_controls(customer_name);
CREATE INDEX idx_vehicle_qc_model ON vehicle_quality_controls(vehicle_model);
CREATE INDEX idx_vehicle_qc_overdue ON vehicle_quality_controls(is_overdue);
CREATE INDEX idx_vehicle_qc_production_date ON vehicle_quality_controls(production_date);

CREATE INDEX idx_tank_tests_tank_id ON tank_leak_tests(tank_id);
CREATE INDEX idx_tank_tests_status ON tank_leak_tests(status);
CREATE INDEX idx_tank_tests_date ON tank_leak_tests(test_date);

CREATE INDEX idx_deviations_number ON deviation_approvals(deviation_number);
CREATE INDEX idx_deviations_status ON deviation_approvals(status);
CREATE INDEX idx_deviations_department ON deviation_approvals(status, department);
CREATE INDEX idx_deviations_request_date ON deviation_approvals(request_date);
CREATE INDEX idx_deviations_part_number ON deviation_approvals(part_number);
CREATE INDEX idx_deviations_type ON deviation_approvals(deviation_type);

-- Triggers to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_material_quality_controls_updated_at BEFORE UPDATE ON material_quality_controls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quality_control_reports_updated_at BEFORE UPDATE ON quality_control_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_quality_controls_updated_at BEFORE UPDATE ON vehicle_quality_controls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tank_leak_tests_updated_at BEFORE UPDATE ON tank_leak_tests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deviation_approvals_updated_at BEFORE UPDATE ON deviation_approvals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- Trigger to auto-generate report IDs
CREATE OR REPLACE FUNCTION set_report_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.report_id IS NULL OR NEW.report_id = '' THEN
        NEW.report_id := generate_report_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_report_id_trigger 
    BEFORE INSERT ON quality_control_reports
    FOR EACH ROW EXECUTE FUNCTION set_report_id();

-- Function to calculate pressure drop and determine test status for tank leak tests
CREATE OR REPLACE FUNCTION calculate_tank_test_results()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate pressure drop
    NEW.pressure_drop := NEW.initial_pressure - NEW.final_pressure;
    
    -- Determine test status based on pressure drop
    IF NEW.pressure_drop <= NEW.max_allowed_pressure_drop THEN
        NEW.status := 'passed';
    ELSE
        NEW.status := 'failed';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_tank_test_results_trigger
    BEFORE INSERT OR UPDATE ON tank_leak_tests
    FOR EACH ROW EXECUTE FUNCTION calculate_tank_test_results();

-- Function to update vehicle quality control warning system
CREATE OR REPLACE FUNCTION update_vehicle_warning_system()
RETURNS TRIGGER AS $$
DECLARE
    days_since_return INTEGER;
BEGIN
    -- Check if vehicle is returned to production and has a return date
    IF NEW.current_status = 'returned_to_production' AND NEW.production_return_date IS NOT NULL THEN
        days_since_return := EXTRACT(DAY FROM (CURRENT_DATE - NEW.production_return_date));
        
        IF days_since_return >= 2 THEN
            NEW.is_overdue := true;
            NEW.overdue_date := NEW.production_return_date + INTERVAL '2 days';
            
            IF days_since_return >= 5 THEN
                NEW.warning_level := 'critical';
            ELSE
                NEW.warning_level := 'warning';
            END IF;
        END IF;
    ELSE
        NEW.is_overdue := false;
        NEW.overdue_date := NULL;
        NEW.warning_level := 'none';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vehicle_warning_system_trigger
    BEFORE INSERT OR UPDATE ON vehicle_quality_controls
    FOR EACH ROW EXECUTE FUNCTION update_vehicle_warning_system();

-- Create RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_quality_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_control_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_quality_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE tank_leak_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE deviation_approvals ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (can be customized later)
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "All authenticated users can view suppliers" ON suppliers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Quality and admin users can manage suppliers" ON suppliers FOR ALL USING (
    auth.role() = 'authenticated' AND 
    (SELECT role FROM users WHERE id::text = auth.uid()::text) IN ('admin', 'quality')
);

-- Similar policies can be created for other tables based on requirements
