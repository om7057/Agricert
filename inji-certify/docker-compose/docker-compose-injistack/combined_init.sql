-- Inji Certify Database Initialization
-- This script runs in the mosip_certify database

-- Create certify schema
DROP SCHEMA IF EXISTS certify CASCADE;
CREATE SCHEMA certify;
ALTER SCHEMA certify OWNER TO postgres;

-- Set search path
SET search_path TO certify,pg_catalog,public;

--- keymanager specific DB changes ---
CREATE TABLE certify.key_alias(
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

CREATE TABLE certify.key_policy_def(
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

CREATE TABLE certify.key_store(
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

CREATE TABLE certify.ca_cert_store(
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

CREATE TABLE certify.rendering_template (
    id varchar(128) NOT NULL,
    template VARCHAR NOT NULL,
    cr_dtimes timestamp NOT NULL,
    upd_dtimes timestamp,
    CONSTRAINT pk_svgtmp_id PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS certify.credential_config (
    credential_config_key_id VARCHAR(2048) NOT NULL UNIQUE,
    config_id VARCHAR(255) NOT NULL,
    status VARCHAR(255),
    vc_template VARCHAR,
    doctype VARCHAR,
    sd_jwt_vct VARCHAR,
    context VARCHAR,
    credential_type VARCHAR,
    credential_format VARCHAR(255) NOT NULL,
    did_url VARCHAR,
    key_manager_app_id VARCHAR(36),
    key_manager_ref_id VARCHAR(128),
    signature_algo VARCHAR(36),
    signature_crypto_suite VARCHAR(128),
    sd_claim VARCHAR,
    display JSONB NOT NULL,
    display_order TEXT[] NOT NULL,
    scope VARCHAR(255) NOT NULL,
    cryptographic_binding_methods_supported TEXT[] NOT NULL,
    credential_signing_alg_values_supported TEXT[] NOT NULL,
    proof_types_supported JSONB NOT NULL,
    credential_subject JSONB,
    sd_jwt_claims JSONB,
    mso_mdoc_claims JSONB,
    plugin_configurations JSONB,
    credential_status_purpose TEXT[],
    cr_dtimes TIMESTAMP NOT NULL,
    upd_dtimes TIMESTAMP,
    CONSTRAINT pk_config_id PRIMARY KEY (config_id)
);

CREATE UNIQUE INDEX idx_credential_config_type_context_unique
ON certify.credential_config(credential_type, context, credential_format)
WHERE credential_type IS NOT NULL AND credential_type <> ''
AND context IS NOT NULL AND context <> '';

CREATE UNIQUE INDEX idx_credential_config_sd_jwt_vct_unique
ON certify.credential_config(sd_jwt_vct, credential_format)
WHERE sd_jwt_vct IS NOT NULL and sd_jwt_vct <> '';

CREATE UNIQUE INDEX idx_credential_config_doctype_unique
ON certify.credential_config(doctype, credential_format)
WHERE doctype IS NOT NULL and doctype <> '';

-- Insert Farmer Credential Configuration
INSERT INTO certify.credential_config (
    credential_config_key_id,
    config_id,
    status,
    vc_template,
    doctype,
    sd_jwt_vct,
    context,
    credential_type,
    credential_format,
    did_url,
    key_manager_app_id,
    key_manager_ref_id,
    signature_algo,
    signature_crypto_suite,
    sd_claim,
    display,
    display_order,
    scope,
    cryptographic_binding_methods_supported,
    credential_signing_alg_values_supported,
    proof_types_supported,
    credential_subject,
    mso_mdoc_claims,
    plugin_configurations,
    credential_status_purpose,
    cr_dtimes,
    upd_dtimes
)
VALUES (
    'FarmerCredential',
    gen_random_uuid()::VARCHAR(255),
    'active',
    'ewogICAgICAgICAgIkBjb250ZXh0IjogWwogICAgICAgICAgICAgICJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSIsCiAgICAgICAgICAgICAgImh0dHBzOi8vcGl5dXNoNzAzNC5naXRodWIuaW8vbXktZmlsZXMvZmFybWVyLmpzb24iLAogICAgICAgICAgICAgICJodHRwczovL3czaWQub3JnL3NlY3VyaXR5L3N1aXRlcy9lZDI1NTE5LTIwMjAvdjEiCiAgICAgICAgICBdLAogICAgICAgICAgImlzc3VlciI6ICIke19pc3N1ZXJ9IiwKICAgICAgICAgICJ0eXBlIjogWwogICAgICAgICAgICAgICJWZXJpZmlhYmxlQ3JlZGVudGlhbCIsCiAgICAgICAgICAgICAgIkZhcm1lckNyZWRlbnRpYWwiCiAgICAgICAgICBdLAogICAgICAgICAgImlzc3VhbmNlRGF0ZSI6ICIke3ZhbGlkRnJvbX0iLAogICAgICAgICAgImV4cGlyYXRpb25EYXRlIjogIiR7dmFsaWRVbnRpbH0iLAogICAgICAgICAgImNyZWRlbnRpYWxTdWJqZWN0IjogewogICAgICAgICAgICAgICJpZCI6ICIke19ob2xkZXJJZH0iLAogICAgICAgICAgICAgICJmdWxsTmFtZSI6ICIke2Z1bGxOYW1lfSIsCiAgICAgICAgICAgICAgIm1vYmlsZU51bWJlciI6ICIke21vYmlsZU51bWJlcn0iLAogICAgICAgICAgICAgICJkYXRlT2ZCaXJ0aCI6ICIke2RhdGVPZkJpcnRofSIsCiAgICAgICAgICAgICAgImdlbmRlciI6ICIke2dlbmRlcn0iLAogICAgICAgICAgICAgICJzdGF0ZSI6ICIke3N0YXRlfSIsCiAgICAgICAgICAgICAgImRpc3RyaWN0IjogIiR7ZGlzdHJpY3R9IiwKICAgICAgICAgICAgICAidmlsbGFnZU9yVG93biI6ICIke3ZpbGxhZ2VPclRvd259IiwKICAgICAgICAgICAgICAicG9zdGFsQ29kZSI6ICIke3Bvc3RhbENvZGV9IiwKICAgICAgICAgICAgICAibGFuZEFyZWEiOiAiJHtsYW5kQXJlYX0iLAogICAgICAgICAgICAgICJsYW5kT3duZXJzaGlwVHlwZSI6ICIke2xhbmRPd25lcnNoaXBUeXBlfSIsCiAgICAgICAgICAgICAgInByaW1hcnlDcm9wVHlwZSI6ICIke3ByaW1hcnlDcm9wVHlwZX0iLAogICAgICAgICAgICAgICJzZWNvbmRhcnlDcm9wVHlwZSI6ICIke3NlY29uZGFyeUNyb3BUeXBlfSIsCiAgICAgICAgICAgICAgImZhY2UiOiAiJHtmYWNlfSIsCiAgICAgICAgICAgICAgImZhcm1lcklEIjogIiR7ZmFybWVySUR9IgogICAgICAgICAgfQogICAgIH0=',
    NULL,
    NULL,
    'https://www.w3.org/2018/credentials/v1',
    'FarmerCredential,VerifiableCredential',
    'ldp_vc',
    'did:web:mosip.github.io:inji-config:vc-local-ed25519',
    'CERTIFY_VC_SIGN_ED25519',
    'ED25519_SIGN',
    'EdDSA',
    'Ed25519Signature2020',
    NULL,
    '[{"name": "Farmer Verifiable Credential", "locale": "en", "logo": {"url": "https://mosip.github.io/inji-config/logos/agro-vertias-logo.png", "alt_text": "Farmer Credential Logo"}, "background_color": "#12107c", "text_color": "#FFFFFF", "background_image": { "uri": "https://mosip.github.io/inji-config/logos/agro-vertias-logo.png" }}]'::JSONB,
    ARRAY['fullName', 'mobileNumber', 'dateOfBirth', 'gender', 'state', 'district', 'villageOrTown', 'postalCode', 'landArea', 'landOwnershipType', 'primaryCropType', 'secondaryCropType', 'farmerID'],
    'mock_identity_vc_ldp',
    ARRAY['did:jwk'],
    ARRAY['Ed25519Signature2020'],
    '{"jwt": {"proof_signing_alg_values_supported": ["RS256", "ES256"]}}'::JSONB,
    '{"fullName": {"display": [{"name": "Full Name", "locale": "en"}]}, "phone": {"display": [{"name": "Phone Number", "locale": "en"}]}, "dateOfBirth": {"display": [{"name": "Date of Birth", "locale": "en"}]}, "gender": {"display": [{"name": "Gender", "locale": "en"}]}}'::JSONB,
    NULL,
    '[{"mosip.certify.mock.data-provider.csv.identifier-column": "id", "mosip.certify.mock.data-provider.csv.data-columns": "id,fullName,mobileNumber,dateOfBirth,gender,state,district,villageOrTown,postalCode,landArea,landOwnershipType,primaryCropType,secondaryCropType,face,farmerID", "mosip.certify.mock.data-provider.csv-registry-uri": "/home/mosip/config/farmer_identity_data.csv"}]'::JSONB,
    ARRAY['revocation'],
    NOW(),
    NULL
);

-- Insert Key Policy Definitions
INSERT INTO certify.key_policy_def(APP_ID,KEY_VALIDITY_DURATION,PRE_EXPIRE_DAYS,ACCESS_ALLOWED,IS_ACTIVE,CR_BY,CR_DTIMES) VALUES
('ROOT', 2920, 1125, 'NA', true, 'mosipadmin', now()),
('CERTIFY_SERVICE', 1095, 60, 'NA', true, 'mosipadmin', now()),
('CERTIFY_PARTNER', 1095, 60, 'NA', true, 'mosipadmin', now()),
('CERTIFY_VC_SIGN_RSA', 1095, 60, 'NA', true, 'mosipadmin', now()),
('CERTIFY_VC_SIGN_ED25519', 1095, 60, 'NA', true, 'mosipadmin', now()),
('BASE', 1095, 60, 'NA', true, 'mosipadmin', now()),
('CERTIFY_VC_SIGN_EC_K1', 1095, 60, 'NA', true, 'mosipadmin', now()),
('CERTIFY_VC_SIGN_EC_R1', 1095, 60, 'NA', true, 'mosipadmin', now());

-- Create credential status enum
CREATE TYPE certify.credential_status_enum AS ENUM ('AVAILABLE', 'FULL');

-- Create status_list_credential table
CREATE TABLE certify.status_list_credential (
    id VARCHAR(255) PRIMARY KEY,
    vc_document VARCHAR NOT NULL,
    credential_type VARCHAR(100) NOT NULL,
    status_purpose VARCHAR(100),
    capacity BIGINT,
    credential_status certify.credential_status_enum,
    cr_dtimes timestamp NOT NULL default now(),
    upd_dtimes timestamp
);

CREATE INDEX IF NOT EXISTS idx_slc_status_purpose ON certify.status_list_credential(status_purpose);
CREATE INDEX IF NOT EXISTS idx_slc_credential_type ON certify.status_list_credential(credential_type);
CREATE INDEX IF NOT EXISTS idx_slc_credential_status ON certify.status_list_credential(credential_status);
CREATE INDEX IF NOT EXISTS idx_slc_cr_dtimes ON certify.status_list_credential(cr_dtimes);

-- Create the ledger table
CREATE TABLE certify.ledger (
    id SERIAL PRIMARY KEY,
    credential_id VARCHAR(255),
    issuer_id VARCHAR(255) NOT NULL,
    issuance_date TIMESTAMP NOT NULL,
    expiration_date TIMESTAMP,
    credential_type VARCHAR(100) NOT NULL,
    indexed_attributes JSONB,
    credential_status_details JSONB NOT NULL DEFAULT '[]'::jsonb,
    cr_dtimes TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_ledger_tracked_credential_id UNIQUE (credential_id),
    CONSTRAINT ensure_credential_status_details_is_array CHECK (jsonb_typeof(credential_status_details) = 'array')
);

CREATE INDEX IF NOT EXISTS idx_ledger_credential_id ON certify.ledger(credential_id);
CREATE INDEX IF NOT EXISTS idx_ledger_issuer_id ON certify.ledger(issuer_id);
CREATE INDEX IF NOT EXISTS idx_ledger_credential_type ON certify.ledger(credential_type);
CREATE INDEX IF NOT EXISTS idx_ledger_issuance_date ON certify.ledger(issuance_date);
CREATE INDEX IF NOT EXISTS idx_ledger_expiration_date ON certify.ledger(expiration_date);
CREATE INDEX IF NOT EXISTS idx_ledger_cr_dtimes ON certify.ledger(cr_dtimes);
CREATE INDEX IF NOT EXISTS idx_gin_ledger_indexed_attrs ON certify.ledger USING GIN (indexed_attributes);
CREATE INDEX IF NOT EXISTS idx_gin_ledger_status_details ON certify.ledger USING GIN (credential_status_details);

CREATE TABLE IF NOT EXISTS certify.credential_status_transaction (
    transaction_log_id SERIAL PRIMARY KEY,
    credential_id VARCHAR(255),
    status_purpose VARCHAR(100),
    status_value boolean,
    status_list_credential_id VARCHAR(255),
    status_list_index BIGINT,
    cr_dtimes TIMESTAMP NOT NULL DEFAULT NOW(),
    processed_dtimes TIMESTAMP,
    is_processed BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_cst_is_processed_created ON certify.credential_status_transaction (is_processed, cr_dtimes);

CREATE TABLE certify.status_list_available_indices (
    id SERIAL PRIMARY KEY,
    status_list_credential_id VARCHAR(255) NOT NULL,
    list_index BIGINT NOT NULL,
    is_assigned BOOLEAN NOT NULL DEFAULT FALSE,
    cr_dtimes TIMESTAMP NOT NULL DEFAULT NOW(),
    upd_dtimes TIMESTAMP,
    CONSTRAINT fk_status_list_credential
        FOREIGN KEY(status_list_credential_id)
        REFERENCES certify.status_list_credential(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT uq_list_id_and_index
        UNIQUE (status_list_credential_id, list_index)
);

CREATE INDEX IF NOT EXISTS idx_sla_available_indices
    ON certify.status_list_available_indices (status_list_credential_id, is_assigned, list_index)
    WHERE is_assigned = FALSE;

CREATE INDEX IF NOT EXISTS idx_sla_status_list_credential_id ON certify.status_list_available_indices(status_list_credential_id);
CREATE INDEX IF NOT EXISTS idx_sla_is_assigned ON certify.status_list_available_indices(is_assigned);
CREATE INDEX IF NOT EXISTS idx_sla_list_index ON certify.status_list_available_indices(list_index);
CREATE INDEX IF NOT EXISTS idx_sla_cr_dtimes ON certify.status_list_available_indices(cr_dtimes);

CREATE TABLE IF NOT EXISTS certify.shedlock (
    name VARCHAR(64),
    lock_until TIMESTAMPTZ(3) NOT NULL,
    locked_at TIMESTAMPTZ(3) NOT NULL,
    locked_by VARCHAR(255) NOT NULL,
    PRIMARY KEY (name)
);

-- Create mimoto schema (in same database for simplicity)
DROP SCHEMA IF EXISTS mimoto CASCADE;
CREATE SCHEMA mimoto;
ALTER SCHEMA mimoto OWNER TO postgres;

CREATE TABLE mimoto.key_alias(
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
    CONSTRAINT pk_mimoto_keymals_id PRIMARY KEY (id),
    CONSTRAINT mimoto_uni_ident_const UNIQUE (uni_ident)
);

CREATE TABLE mimoto.key_policy_def(
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
    CONSTRAINT pk_mimoto_keypdef_id PRIMARY KEY (app_id)
);

CREATE TABLE mimoto.key_store(
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
    CONSTRAINT pk_mimoto_keystr_id PRIMARY KEY (id)
);

CREATE TABLE mimoto.ca_cert_store(
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
    CONSTRAINT pk_mimoto_cacs_id PRIMARY KEY (cert_id),
    CONSTRAINT mimoto_cert_thumbprint_unique UNIQUE (cert_thumbprint,partner_domain)
);

CREATE TABLE IF NOT EXISTS mimoto.user_metadata (
    id character varying(36) PRIMARY KEY,
    provider_subject_id character varying(255) NOT NULL,
    identity_provider character varying(255) NOT NULL,
    display_name TEXT NOT NULL,
    profile_picture_url TEXT,
    phone_number TEXT,
    email TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mimoto.wallet (
    id character varying(36) PRIMARY KEY,
    user_id character varying(36) NOT NULL,
    wallet_key TEXT NOT NULL,
    wallet_metadata JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES mimoto.user_metadata (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mimoto.verifiable_credentials (
    id character varying(36) PRIMARY KEY,
    wallet_id character varying(36) NOT NULL,
    credential TEXT NOT NULL,
    credential_metadata JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    CONSTRAINT fk_wallet_id FOREIGN KEY (wallet_id) REFERENCES mimoto.wallet (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mimoto.proof_signing_key (
    id character varying(36) PRIMARY KEY,
    wallet_id character varying(36) NOT NULL,
    public_key TEXT NOT NULL,
    secret_key TEXT NOT NULL,
    key_metadata JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    CONSTRAINT fk_mimoto_wallet_id FOREIGN KEY (wallet_id) REFERENCES mimoto.wallet (id) ON DELETE CASCADE
);

INSERT INTO mimoto.key_policy_def(APP_ID,KEY_VALIDITY_DURATION,PRE_EXPIRE_DAYS,ACCESS_ALLOWED,IS_ACTIVE,CR_BY,CR_DTIMES) VALUES
('ROOT', 2920, 1125, 'NA', true, 'mosipadmin', now()),
('BASE', 1095, 60, 'NA', true, 'mosipadmin', now()),
('MIMOTO', 1095, 60, 'NA', true, 'mosipadmin', now());
