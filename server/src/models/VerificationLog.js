import pool from '../config/database.js';

export const create = async (logData) => {
  const {
    credentialId,
    verifiedByRole,
    verifiedByOrganization,
    verifiedByCountry,
    verificationResult,
    verificationMethod,
    ipAddress,
    userAgent
  } = logData;

  const query = `
    INSERT INTO verification_logs (
      credential_id, verified_by_role, verified_by_organization,
      verified_by_country, verification_result, verification_method,
      ip_address, user_agent, verified_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    RETURNING *
  `;

  const values = [
    credentialId,
    verifiedByRole,
    verifiedByOrganization,
    verifiedByCountry,
    verificationResult,
    verificationMethod,
    ipAddress,
    userAgent
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const findByCredentialId = async (credentialId, limit = 50) => {
  const query = `
    SELECT * FROM verification_logs 
    WHERE credential_id = $1 
    ORDER BY verified_at DESC 
    LIMIT $2
  `;
  const result = await pool.query(query, [credentialId, limit]);
  return result.rows;
};

export const getStatistics = async (credentialId) => {
  const query = `
    SELECT 
      COUNT(*) as total_verifications,
      COUNT(CASE WHEN verification_result = 'valid' THEN 1 END) as valid_count,
      COUNT(CASE WHEN verification_result = 'invalid' THEN 1 END) as invalid_count,
      COUNT(CASE WHEN verification_result = 'revoked' THEN 1 END) as revoked_count,
      COUNT(CASE WHEN verification_result = 'expired' THEN 1 END) as expired_count,
      MAX(verified_at) as last_verified
    FROM verification_logs
    WHERE credential_id = $1
  `;
  
  const result = await pool.query(query, [credentialId]);
  return result.rows[0];
};

export const getRecentLogs = async (limit = 100) => {
  const query = `
    SELECT vl.*, vc.batch_id, b.product_name, b.product_type
    FROM verification_logs vl
    LEFT JOIN verifiable_credentials vc ON vl.credential_id = vc.credential_id
    LEFT JOIN batches b ON vc.batch_id = b.id
    ORDER BY vl.verified_at DESC
    LIMIT $1
  `;
  
  const result = await pool.query(query, [limit]);
  return result.rows;
};

export default {
  create,
  findByCredentialId,
  getStatistics,
  getRecentLogs
};
