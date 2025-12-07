-- Agricultural Quality Certificate Credential Configuration
-- This inserts the credential configuration directly into the database

INSERT INTO certify.credential_config (
    id,
    credential_format,
    display,
    context,
    type,
    signature_crypto_suite,
    signature_algo,
    key_manager_app_id,
    key_manager_ref_id,
    did_url,
    order_num,
    proof_types_supported,
    credential_subject_display,
    velocity_template,
    cr_by,
    cr_dtimes
)
VALUES (
    'agricultural_quality_certificate_vc_ldp',  -- id (matches our scope in certify-agriqcert.properties)
    'ldp_vc',  -- credential_format
    '[{"name": "Agricultural Quality Certificate", "locale": "en", "logo": {"url": "https://via.placeholder.com/150", "alt_text": "AgriQCert Logo"}, "background_color": "#2E7D32", "text_color": "#FFFFFF"}]'::JSONB,  -- display
    '["https://www.w3.org/2018/credentials/v1", {"@context": {"@version": 1.1, "@protected": true, "AgriculturalQualityCertificate": {"@id": "https://agriqcert.io/credentials/AgriculturalQualityCertificate", "@context": {"@version": 1.1, "@protected": true, "batchNumber": "https://agriqcert.io/credentials/batchNumber", "productType": "https://agriqcert.io/credentials/productType", "farmerId": "https://agriqcert.io/credentials/farmerId", "farmerName": "https://agriqcert.io/credentials/farmerName", "inspectionDate": "https://agriqcert.io/credentials/inspectionDate", "inspectorName": "https://agriqcert.io/credentials/inspectorName", "certificationLevel": "https://agriqcert.io/credentials/certificationLevel", "expiryDate": "https://agriqcert.io/credentials/expiryDate", "result": "https://agriqcert.io/credentials/result"}}}}]'::JSONB,  -- context
    '["VerifiableCredential", "AgriculturalQualityCertificate"]'::JSONB,  -- type
    'Ed25519Signature2020',  -- signature_crypto_suite
    'EdDSA',  -- signature_algo
    'CERTIFY_VC_SIGN_ED25519',  -- key_manager_app_id
    'ED25519_SIGN',  -- key_manager_ref_id
    'did:web:localhost:8090:v1:certify',  -- did_url
    1,  -- order_num
    '{"jwt": {"proof_signing_alg_values_supported": ["EdDSA", "ES256"]}}'::JSONB,  -- proof_types_supported
    '{"batchNumber": {"display": [{"name": "Batch Number", "locale": "en"}]}, "productType": {"display": [{"name": "Product Type", "locale": "en"}]}, "farmerId": {"display": [{"name": "Farmer ID", "locale": "en"}]}, "farmerName": {"display": [{"name": "Farmer Name", "locale": "en"}]}, "inspectionDate": {"display": [{"name": "Inspection Date", "locale": "en"}]}, "inspectorName": {"display": [{"name": "Inspector Name", "locale": "en"}]}, "certificationLevel": {"display": [{"name": "Certification Level", "locale": "en"}]}, "expiryDate": {"display": [{"name": "Expiry Date", "locale": "en"}]}, "result": {"display": [{"name": "Result", "locale": "en"}]}}'::JSONB,  -- credential_subject_display
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
    "batchNumber": "$credentialSubject.get(''batchNumber'')",
    "productType": "$credentialSubject.get(''productType'')",
    "farmerId": "$credentialSubject.get(''farmerId'')",
    "farmerName": "$credentialSubject.get(''farmerName'')",
    "inspectionDate": "$credentialSubject.get(''inspectionDate'')",
    "inspectorName": "$credentialSubject.get(''inspectorName'')",
    "certificationLevel": "$credentialSubject.get(''certificationLevel'')",
    "expiryDate": "$credentialSubject.get(''expiryDate'')",
    "result": "$credentialSubject.get(''result'')"
  }
}',  -- velocity_template
    'admin',  -- cr_by
    NOW()  -- cr_dtimes
);
