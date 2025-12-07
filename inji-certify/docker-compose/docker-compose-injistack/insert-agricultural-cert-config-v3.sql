-- Agricultural Quality Certificate Credential Configuration
-- Using the correct schema from certify_init.sql

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
    plugin_configurations,
    credential_status_purpose,
    cr_dtimes,
    upd_dtimes
)
VALUES (
    'AgriculturalQualityCertificate',  -- credential_config_key_id
    gen_random_uuid()::VARCHAR(255),  -- config_id (unique generated)
    'active',  -- status
    '#set($credentialSubject = $dataProviderPluginResponse.get(''credentialSubject''))
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    {
      "@context": {
        "@version": 1.1,
        "@protected": true,
        "AgriculturalQualityCertificate": {
          "@id": "https://agriqcert.io/credentials/AgriculturalQualityCertificate",
          "@context": {
            "@version": 1.1,
            "@protected": true,
            "batchNumber": "https://agriqcert.io/credentials/batchNumber",
            "productType": "https://agriqcert.io/credentials/productType",
            "farmerId": "https://agriqcert.io/credentials/farmerId",
            "farmerName": "https://agriqcert.io/credentials/farmerName",
            "inspectionDate": "https://agriqcert.io/credentials/inspectionDate",
            "inspectorName": "https://agriqcert.io/credentials/inspectorName",
            "certificationLevel": "https://agriqcert.io/credentials/certificationLevel",
            "expiryDate": "https://agriqcert.io/credentials/expiryDate",
            "result": "https://agriqcert.io/credentials/result"
          }
        }
      }
    },
    "https://w3id.org/security/suites/ed25519-2020/v1"
  ],
  "type": [
    "VerifiableCredential",
    "AgriculturalQualityCertificate"
  ],
  "issuer": "${_issuer}",
  "issuanceDate": "${validFrom}",
  #if($validUntil)
  "expirationDate": "${validUntil}",
  #end
  "credentialSubject": {
    "id": "${_holderId}",
    "batchNumber": "$credentialSubject.get(''batch_number'')",
    "productType": "$credentialSubject.get(''product_type'')",
    "farmerId": "$credentialSubject.get(''farmer_id'')",
    "farmerName": "$credentialSubject.get(''farmer_name'')",
    "inspectionDate": "$credentialSubject.get(''inspection_date'')",
    "inspectorName": "$credentialSubject.get(''inspector_name'')",
    "certificationLevel": "$credentialSubject.get(''certification_level'')",
    "expiryDate": "$credentialSubject.get(''expiry_date'')",
    "result": "$credentialSubject.get(''result'')"
  }
}',  -- vc_template (Velocity template)
    NULL,  -- doctype (for mDL)
    NULL,  -- sd_jwt_vct (for SD-JWT)
    'https://www.w3.org/2018/credentials/v1',  -- context (as string, not JSON)
    'AgriculturalQualityCertificate,VerifiableCredential',  -- credential_type (comma-separated)
    'ldp_vc',  -- credential_format
    'did:web:localhost:8090:v1:certify',  -- did_url
    'CERTIFY_VC_SIGN_ED25519',  -- key_manager_app_id
    'ED25519_SIGN',  -- key_manager_ref_id
    'EdDSA',  -- signature_algo
    'Ed25519Signature2020',  -- signature_crypto_suite
    NULL,  -- sd_claim
    '[{"name": "Agricultural Quality Certificate", "locale": "en", "logo": {"url": "https://via.placeholder.com/150", "alt_text": "AgriQCert Logo"}, "background_color": "#2E7D32", "text_color": "#FFFFFF"}]'::JSONB,  -- display
    ARRAY['batchNumber', 'productType', 'farmerId', 'farmerName', 'inspectionDate', 'inspectorName', 'certificationLevel', 'expiryDate', 'result'],  -- display_order
    'agricultural_quality_certificate_vc_ldp',  -- scope (must match the scope in certify-agriqcert.properties!)
    ARRAY['did:jwk'],  -- cryptographic_binding_methods_supported
    ARRAY['Ed25519Signature2020'],  -- credential_signing_alg_values_supported
    '{"jwt": {"proof_signing_alg_values_supported": ["EdDSA", "ES256"]}}'::JSONB,  -- proof_types_supported
    '{"batchNumber": {"display": [{"name": "Batch Number", "locale": "en"}]}, "productType": {"display": [{"name": "Product Type", "locale": "en"}]}, "farmerId": {"display": [{"name": "Farmer ID", "locale": "en"}]}, "farmerName": {"display": [{"name": "Farmer Name", "locale": "en"}]}, "inspectionDate": {"display": [{"name": "Inspection Date", "locale": "en"}]}, "inspectorName": {"display": [{"name": "Inspector Name", "locale": "en"}]}, "certificationLevel": {"display": [{"name": "Certification Level", "locale": "en"}]}, "expiryDate": {"display": [{"name": "Expiry Date", "locale": "en"}]}, "result": {"display": [{"name": "Result", "locale": "en"}]}}'::JSONB,  -- credential_subject
    NULL,  -- sd_jwt_claims
    '[]'::JSONB,  -- plugin_configurations (empty for postgres plugin as config is in properties file)
    ARRAY['revocation'],  -- credential_status_purpose
    NOW(),  -- cr_dtimes
    NULL  -- upd_dtimes
);
