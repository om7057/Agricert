import pool from '../config/database.js';
import crypto from 'crypto';

export const create = async (credentialData) => {
  const {
    batchId,
    inspectionId,
    credentialType,
    vcData,
    qrCode,
    qrData,
    signature,
    issuedBy,
    expiresAt
  } = credentialData;

  const credentialId = `VC-${crypto.randomBytes(16).toString('hex')}`;

  const query = `
    INSERT INTO verifiable_credentials (
      credential_id, batch_id, inspection_id, vc_json, credential_subject,
      issuer_did, issued_at, expires_at, qr_code_data, qr_code_image,
      is_active, is_revoked, created_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8, $9, true, false, NOW())
    RETURNING *
  `;

  const values = [
    credentialId,
    batchId,
    inspectionId,
    JSON.stringify(vcData),
    JSON.stringify(vcData.credentialSubject),
    vcData.issuer?.id || 'did:web:agriqcert.org',
    expiresAt,
    qrData,
    qrCode
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const findById = async (id) => {
  const query = 'SELECT * FROM verifiable_credentials WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

export const findByCredentialId = async (credentialId) => {
  const query = 'SELECT * FROM verifiable_credentials WHERE credential_id = $1';
  const result = await pool.query(query, [credentialId]);
  return result.rows[0];
};

export const findByBatchId = async (batchId) => {
  const query = `
    SELECT * FROM verifiable_credentials 
    WHERE batch_id = $1 
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query, [batchId]);
  return result.rows;
};

export const findByInspectionId = async (inspectionId) => {
  const query = 'SELECT * FROM verifiable_credentials WHERE inspection_id = $1';
  const result = await pool.query(query, [inspectionId]);
  return result.rows[0];
};

export const updateRevocationStatus = async (id, revokedBy, revocationReason) => {
  const query = `
    UPDATE verifiable_credentials 
    SET is_revoked = true,
        is_active = false,
        revoked_at = NOW(),
        revocation_reason = $2
    WHERE id = $1
    RETURNING *
  `;
  
  const result = await pool.query(query, [id, revocationReason]);
  return result.rows[0];
};

export const checkRevocationStatus = async (id) => {
  const query = 'SELECT is_revoked, revoked_at, revocation_reason FROM verifiable_credentials WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

export const findAll = async (filters = {}) => {
  let query = `
    SELECT vc.*, b.product_name, b.product_type, u.full_name as exporter_name
    FROM verifiable_credentials vc
    LEFT JOIN batches b ON vc.batch_id = b.id
    LEFT JOIN users u ON b.exporter_id = u.id
    WHERE 1=1
  `;
  
  const values = [];
  let paramIndex = 1;

  if (filters.revoked !== undefined) {
    query += ` AND vc.is_revoked = $${paramIndex}`;
    values.push(filters.revoked);
    paramIndex++;
  }

  if (filters.active !== undefined) {
    query += ` AND vc.is_active = $${paramIndex}`;
    values.push(filters.active);
    paramIndex++;
  }

  if (filters.exporterId) {
    query += ` AND b.exporter_id = $${paramIndex}`;
    values.push(filters.exporterId);
    paramIndex++;
  }

  query += ' ORDER BY vc.created_at DESC';

  if (filters.limit) {
    query += ` LIMIT $${paramIndex}`;
    values.push(filters.limit);
    paramIndex++;
  }

  if (filters.offset) {
    query += ` OFFSET $${paramIndex}`;
    values.push(filters.offset);
  }

  const result = await pool.query(query, values);
  return result.rows;
};

export const updateQRCode = async (id, qrCode, qrData) => {
  const query = `
    UPDATE verifiable_credentials 
    SET qr_code_image = $2,
        qr_code_data = $3
    WHERE id = $1
    RETURNING *
  `;
  
  const result = await pool.query(query, [id, qrCode, qrData]);
  return result.rows[0];
};

export const incrementVerificationCount = async (credentialId) => {
  const query = `
    UPDATE verifiable_credentials 
    SET verification_count = verification_count + 1,
        last_verified_at = NOW()
    WHERE credential_id = $1
    RETURNING *
  `;
  
  const result = await pool.query(query, [credentialId]);
  return result.rows[0];
};

export const deleteById = async (id) => {
  const query = 'DELETE FROM verifiable_credentials WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

export const getStatistics = async () => {
  const query = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN is_active = true AND is_revoked = false THEN 1 END) as active,
      COUNT(CASE WHEN is_revoked = true THEN 1 END) as revoked,
      COUNT(CASE WHEN expires_at < NOW() THEN 1 END) as expired
    FROM verifiable_credentials
  `;
  
  const result = await pool.query(query);
  return result.rows[0];
};

export default {
  create,
  findById,
  findByCredentialId,
  findByBatchId,
  findByInspectionId,
  updateRevocationStatus,
  checkRevocationStatus,
  findAll,
  updateQRCode,
  incrementVerificationCount,
  deleteById,
  getStatistics
};
