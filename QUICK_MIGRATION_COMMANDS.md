# 🚀 Hızlı Supabase Migration Komutları

## Adım 1: Supabase Dashboard'a Girin
1. https://supabase.com/dashboard adresine gidin
2. Projenizi seçin: `nzkxizhnikfshyhilefg`
3. Sol menüden **"SQL Editor"** sekmesine tıklayın

## Adım 2: Migration Komutlarını Çalıştırın

### 🗄️ Komut 1: Temel Yapıları Oluştur

SQL Editor'a bu komutu yapıştırın ve **"RUN"** butonuna basın:

```sql
-- Initial schema migration for KYS (Kalite Yönetim Sistemi)
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
```

✅ **Başarılı olursa:** "Success. No rows returned" mesajı göreceksiniz.

### 🗄️ Komut 2: Ek Tabloları Oluştur

İkinci komutu SQL Editor'a yapıştırın:

```sql
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
    total_approval_time INTEGER,
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

-- DOF Records (8D Management)
CREATE TABLE dof_records (
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
CREATE TABLE quality_costs (
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
```

### 🗄️ Komut 3: Son Tabloları ve Indexleri Oluştur

```sql
-- Quarantine Records table
CREATE TABLE quarantine_records (
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

-- CREATE INDEXES FOR PERFORMANCE
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_suppliers_code ON suppliers(code);
CREATE INDEX idx_material_qc_supplier ON material_quality_controls(supplier_id);
CREATE INDEX idx_material_qc_status ON material_quality_controls(status);
CREATE INDEX idx_vehicle_qc_serial ON vehicle_quality_controls(serial_number);
CREATE INDEX idx_vehicle_qc_status ON vehicle_quality_controls(current_status);

-- ENABLE RLS (Row Level Security)
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

-- CREATE RLS POLICIES (Allow authenticated users)
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "All authenticated users can access suppliers" ON suppliers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "All authenticated users can access material controls" ON material_quality_controls FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "All authenticated users can access quality reports" ON quality_control_reports FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "All authenticated users can access vehicle controls" ON vehicle_quality_controls FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "All authenticated users can access tank tests" ON tank_leak_tests FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "All authenticated users can access deviation approvals" ON deviation_approvals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "All authenticated users can access dof records" ON dof_records FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "All authenticated users can access quality costs" ON quality_costs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "All authenticated users can access quarantine records" ON quarantine_records FOR ALL USING (auth.role() = 'authenticated');
```

### 🗄️ Komut 4: Triggers ve Functions

```sql
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_material_quality_controls_updated_at BEFORE UPDATE ON material_quality_controls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quality_control_reports_updated_at BEFORE UPDATE ON quality_control_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicle_quality_controls_updated_at BEFORE UPDATE ON vehicle_quality_controls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tank_leak_tests_updated_at BEFORE UPDATE ON tank_leak_tests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deviation_approvals_updated_at BEFORE UPDATE ON deviation_approvals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dof_records_updated_at BEFORE UPDATE ON dof_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quality_costs_updated_at BEFORE UPDATE ON quality_costs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
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
```

## ✅ Kontrol Listesi

Her komut çalıştıktan sonra işaretleyin:

- [ ] Komut 1: Temel yapılar ✅
- [ ] Komut 2: Ek tablolar ✅  
- [ ] Komut 3: Son tablolar ve indexler ✅
- [ ] Komut 4: Triggers ve functions ✅

## 🎉 Tamamlandığında

Tüm komutlar başarıyla çalıştıktan sonra:

1. Sol menüden **"Table Editor"** sekmesine gidin
2. **10+ tablo** göreceksiniz (users, suppliers, material_quality_controls, vb.)
3. Artık `.env` dosyasını projenizde kullanabilirsiniz!

## 🚨 Hata Alırsanız

- SQL komutlarını tek tek çalıştırın
- Hata mesajlarını okuyun
- "Table already exists" hatası normaldir (tekrar çalıştırırsanız)
