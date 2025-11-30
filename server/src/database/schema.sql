
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- USERS TABLE
-- ========================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('exporter', 'qa_agency', 'importer', 'admin')),
    full_name VARCHAR(255) NOT NULL,
    organization VARCHAR(255),
    license_number VARCHAR(100),
    phone VARCHAR(20),
    country VARCHAR(100),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ========================================
-- BATCHES TABLE
-- ========================================
CREATE TABLE batches (
    id SERIAL PRIMARY KEY,
    batch_number VARCHAR(100) UNIQUE NOT NULL,
    exporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    product_type VARCHAR(100) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    
    origin_location VARCHAR(255) NOT NULL,
    destination_country VARCHAR(100) NOT NULL,
    
    harvest_date DATE,
    packaging_type VARCHAR(100),
    storage_conditions TEXT,
    hsn_code VARCHAR(50),
    
    status VARCHAR(50) DEFAULT 'submitted' 
           CHECK (status IN ('submitted','under_inspection','certified','rejected','revoked')),
    assigned_qa_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_batches_exporter ON batches(exporter_id);
CREATE INDEX idx_batches_status ON batches(status);
CREATE INDEX idx_batches_qa ON batches(assigned_qa_id);
CREATE INDEX idx_batches_number ON batches(batch_number);

-- ========================================
-- BATCH ATTACHMENTS TABLE
-- ========================================
CREATE TABLE batch_attachments (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    sha256_hash VARCHAR(256) NOT NULL, -- Important fix
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attachments_batch ON batch_attachments(batch_id);

-- ========================================
-- INSPECTIONS TABLE
-- ========================================
CREATE TABLE inspections (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    qa_agency_id INTEGER NOT NULL REFERENCES users(id),
    inspection_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Quality parameters
    moisture_level DECIMAL(5,2),
    pesticide_details JSONB,                 -- Improved from single numeric
    aflatoxin_level DECIMAL(10,4),
    foreign_matter DECIMAL(5,2),
    grain_quality_score INTEGER CHECK (grain_quality_score BETWEEN 0 AND 100),

    -- Certifications
    is_organic BOOLEAN DEFAULT false,
    is_gmo_free BOOLEAN DEFAULT false,
    meets_iso_22000 BOOLEAN DEFAULT false,
    meets_haccp BOOLEAN DEFAULT false,

    iso_code VARCHAR(50),
    compliance_standards TEXT[],

    inspector_name VARCHAR(255),
    inspector_license VARCHAR(100),
    lab_name VARCHAR(255),
    lab_accreditation VARCHAR(100),

    inspection_result VARCHAR(50) NOT NULL 
                      CHECK (inspection_result IN ('passed','failed','conditional')),
    remarks TEXT,
    recommendations TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(batch_id)  -- IMPORTANT FIX
);

CREATE INDEX idx_inspections_batch ON inspections(batch_id);
CREATE INDEX idx_inspections_qa ON inspections(qa_agency_id);
CREATE INDEX idx_inspections_pesticide_json ON inspections USING GIN(pesticide_details);

-- ========================================
-- VERIFIABLE CREDENTIALS TABLE
-- ========================================
CREATE TABLE verifiable_credentials (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    inspection_id INTEGER REFERENCES inspections(id) ON DELETE SET NULL,
    
    credential_id VARCHAR(255) UNIQUE NOT NULL,
    vc_json JSONB NOT NULL,
    credential_subject JSONB NOT NULL,
    
    issuer_did VARCHAR(500) NOT NULL,
    holder_did VARCHAR(500),
    issued_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP,
    
    qr_code_data TEXT NOT NULL,
    qr_code_image TEXT,
    
    is_active BOOLEAN DEFAULT true,
    is_revoked BOOLEAN DEFAULT false,
    revoked_at TIMESTAMP,
    revocation_reason TEXT,
    
    verification_count INTEGER DEFAULT 0,
    last_verified_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_credentials_batch ON verifiable_credentials(batch_id);
CREATE INDEX idx_credentials_id ON verifiable_credentials(credential_id);
CREATE INDEX idx_credentials_active ON verifiable_credentials(is_active, is_revoked);

-- ========================================
-- VERIFICATION LOGS TABLE
-- ========================================
CREATE TABLE verification_logs (
    id SERIAL PRIMARY KEY,
    credential_id VARCHAR(255) NOT NULL 
                 REFERENCES verifiable_credentials(credential_id) 
                 ON DELETE CASCADE,

    verified_by_role VARCHAR(50),
    verified_by_organization VARCHAR(255),
    verified_by_country VARCHAR(100),

    verification_result VARCHAR(50) NOT NULL 
                        CHECK (verification_result IN ('valid','invalid','revoked','expired')),
    verification_method VARCHAR(50),

    ip_address VARCHAR(50),
    user_agent TEXT,

    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_verification_logs_credential ON verification_logs(credential_id);
CREATE INDEX idx_verification_logs_date ON verification_logs(verified_at);

-- ========================================
-- NOTIFICATIONS TABLE
-- ========================================
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_batch_id INTEGER REFERENCES batches(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);

-- ========================================
-- AUDIT LOGS TABLE
-- ========================================
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_date ON audit_logs(created_at);

-- ========================================
-- QUALITY STANDARDS TABLE (Optional)
-- ========================================
CREATE TABLE quality_standards (
    id SERIAL PRIMARY KEY,
    standard_name VARCHAR(255) NOT NULL,
    standard_code VARCHAR(50) UNIQUE NOT NULL,
    product_category VARCHAR(100),
    parameters JSONB,
    issuing_authority VARCHAR(255),
    country VARCHAR(100),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- TRIGGERS
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at 
BEFORE UPDATE ON users 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_batches_updated_at 
BEFORE UPDATE ON batches 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- DONE
-- ========================================
