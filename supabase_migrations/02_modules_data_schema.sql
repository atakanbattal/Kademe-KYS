-- ================================================
-- KYS MODÜL VERİLERİ İÇİN SUPABASE SCHEMA GENİŞLETMESİ
-- Bu migration tüm modüllerin verilerini saklamak için gerekli tabloları oluşturur
-- ================================================

-- 1. SUPPLIER QUALITY MANAGEMENT
-- Tedarikçi Kalite Yönetimi için tablolar

CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_code VARCHAR(50) UNIQUE NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    supplier_type VARCHAR(50) DEFAULT 'material',
    quality_rating DECIMAL(3,2) DEFAULT 0.00,
    certification_level VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    risk_level VARCHAR(20) DEFAULT 'low',
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supplier_nonconformities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id),
    nonconformity_date DATE NOT NULL,
    nonconformity_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'open',
    corrective_action TEXT,
    responsible_person VARCHAR(255),
    due_date DATE,
    closed_date DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supplier_defects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id),
    defect_date DATE NOT NULL,
    defect_type VARCHAR(100) NOT NULL,
    product_code VARCHAR(100),
    quantity_defective INTEGER,
    total_quantity INTEGER,
    defect_rate DECIMAL(5,2),
    cost_impact DECIMAL(10,2),
    root_cause TEXT,
    corrective_action TEXT,
    status VARCHAR(20) DEFAULT 'open',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supplier_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id),
    audit_date DATE NOT NULL,
    audit_type VARCHAR(50) NOT NULL,
    auditor_name VARCHAR(255),
    audit_score DECIMAL(5,2),
    findings TEXT,
    recommendations TEXT,
    next_audit_date DATE,
    certificate_valid_until DATE,
    status VARCHAR(20) DEFAULT 'completed',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. DOF 8D MANAGEMENT
-- Problem Çözme ve 8D Analizi için tablo

CREATE TABLE IF NOT EXISTS dof_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dof_number VARCHAR(50) UNIQUE NOT NULL,
    problem_description TEXT NOT NULL,
    customer_name VARCHAR(255),
    product_code VARCHAR(100),
    problem_date DATE,
    priority_level VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'open',
    team_members TEXT[], -- JSON array of team members
    
    -- 8D Steps
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
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. QUALITY COST MANAGEMENT
-- Kalite Maliyet Yönetimi için tablo

CREATE TABLE IF NOT EXISTS quality_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cost_category VARCHAR(50) NOT NULL, -- prevention, appraisal, internal_failure, external_failure
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
    frequency VARCHAR(20), -- monthly, quarterly, yearly
    justification TEXT,
    approved_by VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. QUARANTINE MANAGEMENT
-- Karantina Yönetimi için tablo

CREATE TABLE IF NOT EXISTS quarantine_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    disposition VARCHAR(50), -- accept, reject, rework, scrap
    disposition_reason TEXT,
    release_date DATE,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. FAN TEST ANALYSIS
-- Fan Test Analizi için tablo

CREATE TABLE IF NOT EXISTS fan_test_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_number VARCHAR(50) UNIQUE NOT NULL,
    fan_model VARCHAR(100) NOT NULL,
    fan_serial VARCHAR(100),
    test_date DATE NOT NULL,
    test_type VARCHAR(50),
    operator_name VARCHAR(255),
    
    -- Test Parameters
    rpm INTEGER,
    air_flow DECIMAL(8,2),
    pressure DECIMAL(8,2),
    power DECIMAL(8,2),
    efficiency DECIMAL(5,2),
    noise_level DECIMAL(5,2),
    vibration DECIMAL(5,2),
    temperature DECIMAL(5,2),
    
    -- Test Results
    test_result VARCHAR(20) DEFAULT 'pending', -- pass, fail, pending
    deviation_notes TEXT,
    corrective_actions TEXT,
    retest_required BOOLEAN DEFAULT false,
    
    -- Standards & Specifications
    standard_reference VARCHAR(100),
    specification_file VARCHAR(255),
    
    status VARCHAR(20) DEFAULT 'active',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. EQUIPMENT CALIBRATION
-- Ekipman Kalibrasyon Yönetimi için tablo

CREATE TABLE IF NOT EXISTS equipment_calibrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id VARCHAR(50) UNIQUE NOT NULL,
    equipment_name VARCHAR(255) NOT NULL,
    equipment_type VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    manufacturer VARCHAR(255),
    location VARCHAR(100),
    
    -- Calibration Info
    calibration_frequency VARCHAR(50), -- monthly, quarterly, yearly
    last_calibration_date DATE,
    next_calibration_date DATE,
    calibration_status VARCHAR(20) DEFAULT 'valid',
    certificate_number VARCHAR(100),
    calibration_provider VARCHAR(255),
    
    -- Technical Details
    measurement_range VARCHAR(100),
    accuracy VARCHAR(50),
    resolution VARCHAR(50),
    environmental_conditions TEXT,
    
    -- Maintenance
    maintenance_notes TEXT,
    is_critical BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active',
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. TANK LEAK TEST
-- Tank Sızıntı Testi için tablo

CREATE TABLE IF NOT EXISTS tank_leak_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_number VARCHAR(50) UNIQUE NOT NULL,
    tank_id VARCHAR(100) NOT NULL,
    tank_type VARCHAR(100),
    tank_capacity DECIMAL(10,2),
    test_date DATE NOT NULL,
    test_method VARCHAR(50),
    operator_name VARCHAR(255),
    
    -- Test Parameters
    test_pressure DECIMAL(8,2),
    test_duration INTEGER, -- minutes
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    
    -- Test Results
    pressure_drop DECIMAL(8,4),
    leak_rate DECIMAL(8,4),
    test_result VARCHAR(20) DEFAULT 'pending', -- pass, fail, pending
    
    -- Standards
    standard_reference VARCHAR(100),
    acceptance_criteria TEXT,
    
    -- Documentation
    test_report_file VARCHAR(255),
    photo_files TEXT[], -- JSON array of photo file paths
    
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. DOCUMENT MANAGEMENT
-- Doküman Yönetimi için tablo

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_number VARCHAR(100) UNIQUE NOT NULL,
    document_title VARCHAR(255) NOT NULL,
    document_type VARCHAR(50),
    version VARCHAR(20) DEFAULT '1.0',
    revision_date DATE,
    effective_date DATE,
    review_date DATE,
    
    -- Document Details
    department VARCHAR(100),
    process VARCHAR(100),
    category VARCHAR(50),
    confidentiality_level VARCHAR(20) DEFAULT 'internal',
    
    -- Content
    file_path VARCHAR(500),
    file_size INTEGER,
    file_type VARCHAR(20),
    page_count INTEGER,
    
    -- Approval Workflow
    author VARCHAR(255),
    reviewer VARCHAR(255),
    approver VARCHAR(255),
    approval_status VARCHAR(20) DEFAULT 'draft',
    
    -- Metadata
    keywords TEXT,
    description TEXT,
    is_obsolete BOOLEAN DEFAULT false,
    retention_period INTEGER, -- months
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 9. TRAINING MANAGEMENT
-- Eğitim Yönetimi için tablo

CREATE TABLE IF NOT EXISTS training_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_code VARCHAR(50) UNIQUE NOT NULL,
    training_title VARCHAR(255) NOT NULL,
    training_type VARCHAR(50),
    category VARCHAR(50),
    
    -- Training Details
    duration_hours DECIMAL(4,1),
    training_date DATE,
    trainer_name VARCHAR(255),
    training_location VARCHAR(255),
    max_participants INTEGER,
    
    -- Content
    objectives TEXT,
    content_summary TEXT,
    materials TEXT,
    assessment_method VARCHAR(100),
    
    -- Compliance
    mandatory BOOLEAN DEFAULT false,
    certification_required BOOLEAN DEFAULT false,
    validity_period_months INTEGER,
    
    status VARCHAR(20) DEFAULT 'planned',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_id UUID REFERENCES training_records(id),
    employee_name VARCHAR(255) NOT NULL,
    employee_id VARCHAR(50),
    department VARCHAR(100),
    position VARCHAR(100),
    
    -- Participation
    attendance_status VARCHAR(20) DEFAULT 'registered',
    completion_date DATE,
    assessment_score DECIMAL(5,2),
    certification_date DATE,
    certificate_number VARCHAR(100),
    
    -- Feedback
    feedback_rating INTEGER, -- 1-5 scale
    feedback_comments TEXT,
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 10. RISK MANAGEMENT
-- Risk Yönetimi için tablo

CREATE TABLE IF NOT EXISTS risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_id VARCHAR(50) UNIQUE NOT NULL,
    risk_title VARCHAR(255) NOT NULL,
    risk_category VARCHAR(50),
    process_area VARCHAR(100),
    department VARCHAR(100),
    
    -- Risk Description
    risk_description TEXT NOT NULL,
    potential_causes TEXT,
    potential_consequences TEXT,
    
    -- Risk Assessment
    probability INTEGER CHECK (probability >= 1 AND probability <= 5),
    severity INTEGER CHECK (severity >= 1 AND severity <= 5),
    risk_score INTEGER GENERATED ALWAYS AS (probability * severity) STORED,
    risk_level VARCHAR(20) GENERATED ALWAYS AS (
        CASE 
            WHEN (probability * severity) <= 5 THEN 'low'
            WHEN (probability * severity) <= 15 THEN 'medium'
            ELSE 'high'
        END
    ) STORED,
    
    -- Control Measures
    existing_controls TEXT,
    additional_controls TEXT,
    control_effectiveness VARCHAR(20),
    
    -- Action Plan
    action_plan TEXT,
    responsible_person VARCHAR(255),
    target_date DATE,
    review_date DATE,
    
    status VARCHAR(20) DEFAULT 'active',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_suppliers_supplier_code ON suppliers(supplier_code);
CREATE INDEX IF NOT EXISTS idx_suppliers_supplier_name ON suppliers(supplier_name);
CREATE INDEX IF NOT EXISTS idx_suppliers_quality_rating ON suppliers(quality_rating);

CREATE INDEX IF NOT EXISTS idx_supplier_nonconformities_supplier_id ON supplier_nonconformities(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_nonconformities_date ON supplier_nonconformities(nonconformity_date);
CREATE INDEX IF NOT EXISTS idx_supplier_nonconformities_status ON supplier_nonconformities(status);

CREATE INDEX IF NOT EXISTS idx_dof_records_dof_number ON dof_records(dof_number);
CREATE INDEX IF NOT EXISTS idx_dof_records_status ON dof_records(status);
CREATE INDEX IF NOT EXISTS idx_dof_records_priority ON dof_records(priority_level);

CREATE INDEX IF NOT EXISTS idx_quality_costs_category ON quality_costs(cost_category);
CREATE INDEX IF NOT EXISTS idx_quality_costs_date ON quality_costs(cost_date);
CREATE INDEX IF NOT EXISTS idx_quality_costs_department ON quality_costs(department);

CREATE INDEX IF NOT EXISTS idx_quarantine_records_number ON quarantine_records(quarantine_number);
CREATE INDEX IF NOT EXISTS idx_quarantine_records_status ON quarantine_records(status);
CREATE INDEX IF NOT EXISTS idx_quarantine_records_part_code ON quarantine_records(part_code);

CREATE INDEX IF NOT EXISTS idx_fan_test_records_number ON fan_test_records(test_number);
CREATE INDEX IF NOT EXISTS idx_fan_test_records_model ON fan_test_records(fan_model);
CREATE INDEX IF NOT EXISTS idx_fan_test_records_date ON fan_test_records(test_date);

CREATE INDEX IF NOT EXISTS idx_equipment_calibrations_id ON equipment_calibrations(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_calibrations_next_date ON equipment_calibrations(next_calibration_date);
CREATE INDEX IF NOT EXISTS idx_equipment_calibrations_status ON equipment_calibrations(calibration_status);

CREATE INDEX IF NOT EXISTS idx_documents_number ON documents(document_number);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(approval_status);

CREATE INDEX IF NOT EXISTS idx_training_records_code ON training_records(training_code);
CREATE INDEX IF NOT EXISTS idx_training_records_date ON training_records(training_date);
CREATE INDEX IF NOT EXISTS idx_training_participants_training_id ON training_participants(training_id);

CREATE INDEX IF NOT EXISTS idx_risk_assessments_id ON risk_assessments(risk_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_level ON risk_assessments(risk_level);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_category ON risk_assessments(risk_category);

-- ENABLE RLS (Row Level Security)
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_nonconformities ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_defects ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE dof_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarantine_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_test_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_calibrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tank_leak_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;

-- CREATE RLS POLICIES (Allow authenticated users to read/write)
-- Suppliers
CREATE POLICY "Suppliers policy" ON suppliers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Supplier nonconformities policy" ON supplier_nonconformities FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Supplier defects policy" ON supplier_defects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Supplier audits policy" ON supplier_audits FOR ALL USING (auth.role() = 'authenticated');

-- DOF Records
CREATE POLICY "DOF records policy" ON dof_records FOR ALL USING (auth.role() = 'authenticated');

-- Quality Costs
CREATE POLICY "Quality costs policy" ON quality_costs FOR ALL USING (auth.role() = 'authenticated');

-- Quarantine
CREATE POLICY "Quarantine records policy" ON quarantine_records FOR ALL USING (auth.role() = 'authenticated');

-- Fan Tests
CREATE POLICY "Fan test records policy" ON fan_test_records FOR ALL USING (auth.role() = 'authenticated');

-- Equipment
CREATE POLICY "Equipment calibrations policy" ON equipment_calibrations FOR ALL USING (auth.role() = 'authenticated');

-- Tank Tests
CREATE POLICY "Tank leak tests policy" ON tank_leak_tests FOR ALL USING (auth.role() = 'authenticated');

-- Documents
CREATE POLICY "Documents policy" ON documents FOR ALL USING (auth.role() = 'authenticated');

-- Training
CREATE POLICY "Training records policy" ON training_records FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Training participants policy" ON training_participants FOR ALL USING (auth.role() = 'authenticated');

-- Risk Management
CREATE POLICY "Risk assessments policy" ON risk_assessments FOR ALL USING (auth.role() = 'authenticated');

-- CREATE TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_supplier_nonconformities_updated_at BEFORE UPDATE ON supplier_nonconformities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_supplier_defects_updated_at BEFORE UPDATE ON supplier_defects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_supplier_audits_updated_at BEFORE UPDATE ON supplier_audits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dof_records_updated_at BEFORE UPDATE ON dof_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quality_costs_updated_at BEFORE UPDATE ON quality_costs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quarantine_records_updated_at BEFORE UPDATE ON quarantine_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fan_test_records_updated_at BEFORE UPDATE ON fan_test_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_calibrations_updated_at BEFORE UPDATE ON equipment_calibrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tank_leak_tests_updated_at BEFORE UPDATE ON tank_leak_tests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_training_records_updated_at BEFORE UPDATE ON training_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_training_participants_updated_at BEFORE UPDATE ON training_participants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_risk_assessments_updated_at BEFORE UPDATE ON risk_assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
