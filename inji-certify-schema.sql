-- ==================================================
-- Inji Certify Schema Initialization
-- For AgriQCert Integration
-- ==================================================
-- This script creates the 'certify' schema within the existing
-- postgres database to co-exist with AgriQCert schema
-- ==================================================

-- Create certify schema
CREATE SCHEMA IF NOT EXISTS certify;
ALTER SCHEMA certify OWNER TO postgres;

-- Set search path for this session
SET search_path TO certify, public;

-- ==================================================
-- KEY MANAGEMENT TABLES
-- ==================================================

CREATE TABLE IF NOT EXISTS certify.key_alias(
    id character varying(36) NOT NULL,
    app_id character varying(36) NOT NULL,
    ref_id character varying(128),
    key_gen_dtimes timestamp,
    key_expire_dtimes timestamp,
    status_code character varying(36),
    lang_code character varying(3),
    cr_by character varying(256) NOT NULL,
    cr_dtimes timestamp NOT NULL,
    upd_by character varying(256),
    upd_dtimes timestamp,
    is_deleted boolean DEFAULT FALSE,
    del_dtimes timestamp,
    cert_thumbprint character varying(100),
    uni_ident character varying(50),
    CONSTRAINT pk_keymals_id PRIMARY KEY (id),
    CONSTRAINT uni_ident_const UNIQUE (uni_ident)
);

CREATE TABLE IF NOT EXISTS certify.key_policy_def(
    app_id character varying(36) NOT NULL,
    key_validity_duration smallint,
    is_active boolean NOT NULL,
    pre_expire_days smallint,
    access_allowed character varying(1024),
    cr_by character varying(256) NOT NULL,
    cr_dtimes timestamp NOT NULL,
    upd_by character varying(256),
    upd_dtimes timestamp,
    is_deleted boolean DEFAULT FALSE,
    del_dtimes timestamp,
    CONSTRAINT pk_keypdef_id PRIMARY KEY (app_id)
);

CREATE TABLE IF NOT EXISTS certify.key_store(
    id character varying(36) NOT NULL,
    master_key character varying(36) NOT NULL,
    private_key character varying(2500) NOT NULL,
    certificate_data character varying NOT NULL,
    cr_by character varying(256) NOT NULL,
    cr_dtimes timestamp NOT NULL,
    upd_by character varying(256),
    upd_dtimes timestamp,
    is_deleted boolean DEFAULT FALSE,
    del_dtimes timestamp,
    CONSTRAINT pk_keystr_id PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS certify.ca_cert_store(
    cert_id character varying(36) NOT NULL,
    cert_subject character varying(500) NOT NULL,
    cert_issuer character varying(500) NOT NULL,
    issuer_id character varying(36) NOT NULL,
    cert_not_before timestamp,
    cert_not_after timestamp,
    crl_uri character varying(120),
    cert_data character varying,
    cert_thumbprint character varying(100),
    cert_serial_no character varying(50),
    partner_domain character varying(36),
    cr_by character varying(256),
    cr_dtimes timestamp,
    upd_by character varying(256),
    upd_dtimes timestamp,
    is_deleted boolean DEFAULT FALSE,
    del_dtimes timestamp,
    ca_cert_type character varying(25),
    CONSTRAINT pk_cacs_id PRIMARY KEY (cert_id),
    CONSTRAINT cert_thumbprint_unique UNIQUE (cert_thumbprint,partner_domain)
);

-- ==================================================
-- CREDENTIAL CONFIGURATION TABLES
-- ==================================================

CREATE TABLE IF NOT EXISTS certify.rendering_template (
    id varchar(128) NOT NULL,
    template VARCHAR NOT NULL,
    cr_dtimes timestamp NOT NULL,
    upd_dtimes timestamp,
    CONSTRAINT pk_svgtmp_id PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS certify.credential_config (
    id VARCHAR(50) PRIMARY KEY,
    credential_format VARCHAR(50) NOT NULL,
    display JSONB,
    context JSONB,
    type JSONB,
    doc_type VARCHAR(255),
    sd_jwt_vct VARCHAR(255),
    signature_crypto_suite VARCHAR(100),
    signature_algo VARCHAR(50) NOT NULL,
    key_manager_app_id VARCHAR(36) NOT NULL,
    key_manager_ref_id VARCHAR(128),
    did_url VARCHAR(500),
    order_num INT NOT NULL DEFAULT 0,
    proof_types_supported JSONB,
    credential_subject_display JSONB,
    claim_name_mapping JSONB,
    status_list_credential_id VARCHAR(500),
    revocation_purpose VARCHAR(50),
    render_method JSONB,
    velocity_template TEXT,
    cr_by VARCHAR(256) NOT NULL,
    cr_dtimes TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    upd_by VARCHAR(256),
    upd_dtimes TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    del_dtimes TIMESTAMP,
    CONSTRAINT unique_credential_config UNIQUE (credential_format, context, type, doc_type, sd_jwt_vct)
);

CREATE TABLE IF NOT EXISTS certify.credential_registry (
    id VARCHAR(100) PRIMARY KEY,
    credential_id VARCHAR(255) UNIQUE NOT NULL,
    credential_subject VARCHAR(500) NOT NULL,
    credential_issuer VARCHAR(500) NOT NULL,
    issuance_date TIMESTAMP NOT NULL,
    expiry_date TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    status_reason VARCHAR(500),
    cr_by VARCHAR(256) NOT NULL,
    cr_dtimes TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    upd_by VARCHAR(256),
    upd_dtimes TIMESTAMP
);

CREATE TABLE IF NOT EXISTS certify.credential_status_list (
    id VARCHAR(100) PRIMARY KEY,
    list_id VARCHAR(255) UNIQUE NOT NULL,
    list_type VARCHAR(50) NOT NULL,
    encoded_list TEXT NOT NULL,
    size INT NOT NULL,
    purpose VARCHAR(50) NOT NULL,
    cr_by VARCHAR(256) NOT NULL,
    cr_dtimes TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    upd_by VARCHAR(256),
    upd_dtimes TIMESTAMP
);

CREATE TABLE IF NOT EXISTS certify.status_list_credential (
    id VARCHAR(256) NOT NULL,
    vc TEXT NOT NULL,
    status_list_id VARCHAR(256) NOT NULL,
    issuer_id VARCHAR(256) NOT NULL,
    credential_type VARCHAR(128) NOT NULL,
    purpose VARCHAR(128) NOT NULL,
    cr_dtimes TIMESTAMP NOT NULL,
    upd_dtimes TIMESTAMP,
    CONSTRAINT status_list_credential_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS certify.ledger (
    id VARCHAR(128) NOT NULL,
    linked_transaction_id VARCHAR(128),
    batch_id VARCHAR(128),
    vc_hash VARCHAR(128) NOT NULL,
    status VARCHAR(50) NOT NULL,
    cr_by VARCHAR(256) NOT NULL,
    cr_dtimes TIMESTAMP NOT NULL,
    upd_by VARCHAR(256),
    upd_dtimes TIMESTAMP,
    CONSTRAINT ledger_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS certify.credential_status_transaction (
    id VARCHAR(256) NOT NULL,
    credential_id VARCHAR(256) NOT NULL,
    credential_type VARCHAR(128) NOT NULL,
    status_index INTEGER NOT NULL,
    purpose VARCHAR(128) NOT NULL,
    status_list_vc_id VARCHAR(256) NOT NULL,
    cr_by VARCHAR(256) NOT NULL,
    cr_dtimes TIMESTAMP NOT NULL,
    upd_by VARCHAR(256),
    upd_dtimes TIMESTAMP,
    CONSTRAINT credential_status_transaction_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS certify.status_list_available_indices (
    id VARCHAR(256) NOT NULL,
    status_list_vc_id VARCHAR(256) NOT NULL,
    available_index INTEGER NOT NULL,
    CONSTRAINT status_list_available_indices_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS certify.shedlock (
    name VARCHAR(64) NOT NULL,
    lock_until TIMESTAMP NOT NULL,
    locked_at TIMESTAMP NOT NULL,
    locked_by VARCHAR(255) NOT NULL,
    CONSTRAINT shedlock_pkey PRIMARY KEY (name)
);

-- ==================================================
-- INSERT DEFAULT KEY POLICIES
-- ==================================================

INSERT INTO certify.key_policy_def (app_id, key_validity_duration, is_active, pre_expire_days, access_allowed, cr_by, cr_dtimes, is_deleted)
VALUES 
('CERTIFY_VC_SIGN_ED25519', 1095, TRUE, 60, 'NA', 'system', CURRENT_TIMESTAMP, FALSE),
('CERTIFY_VC_SIGN_P256', 1095, TRUE, 60, 'NA', 'system', CURRENT_TIMESTAMP, FALSE),
('CERTIFY_VC_SIGN_SECP256K1', 1095, TRUE, 60, 'NA', 'system', CURRENT_TIMESTAMP, FALSE),
('CERTIFY_VC_SIGN_RSA', 1095, TRUE, 60, 'NA', 'system', CURRENT_TIMESTAMP, FALSE)
ON CONFLICT DO NOTHING;

-- ==================================================
-- GRANT PERMISSIONS
-- ==================================================

GRANT ALL PRIVILEGES ON SCHEMA certify TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA certify TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA certify TO postgres;

-- ==================================================
-- COMPLETED
-- ==================================================
