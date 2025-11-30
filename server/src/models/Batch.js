import { query } from '../config/database.js';

export const create = async (batchData) => {
  const {
    batchNumber,
    exporterId,
    productType,
    productName,
    quantity,
    unit,
    originLocation,
    destinationCountry,
    packagingType,
    storageConditions,
  } = batchData;

  const result = await query(
    `INSERT INTO batches (
      batch_number, exporter_id, product_type, product_name, quantity, unit,
      origin_location, destination_country, packaging_type, storage_conditions, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
    RETURNING *`,
    [
      batchNumber,
      exporterId,
      productType,
      productName,
      quantity,
      unit,
      originLocation,
      destinationCountry,
      packagingType,
      storageConditions,
      'submitted',
    ]
  );

  return result.rows[0];
};

export const findById = async (batchId) => {
  const result = await query(
    `SELECT b.*, 
      u.name as exporter_name, 
      u.email as exporter_email,
      qa.name as qa_agency_name,
      qa.email as qa_agency_email
    FROM batches b
    LEFT JOIN users u ON b.exporter_id = u.id
    LEFT JOIN users qa ON b.assigned_qa_id = qa.id
    WHERE b.id = $1`,
    [batchId]
  );

  return result.rows[0];
};

export const findAll = async (filters = {}, limit = 20, offset = 0) => {
  const conditions = [];
  const values = [];
  let paramCount = 1;

  if (filters.exporterId) {
    conditions.push(`b.exporter_id = $${paramCount}`);
    values.push(filters.exporterId);
    paramCount++;
  }

  if (filters.assignedQaId) {
    conditions.push(`b.assigned_qa_id = $${paramCount}`);
    values.push(filters.assignedQaId);
    paramCount++;
  }

  if (filters.status) {
    conditions.push(`b.status = $${paramCount}`);
    values.push(filters.status);
    paramCount++;
  }

  if (filters.productType) {
    conditions.push(`b.product_type = $${paramCount}`);
    values.push(filters.productType);
    paramCount++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  values.push(limit, offset);

  const result = await query(
    `SELECT b.*, 
      u.name as exporter_name,
      qa.name as qa_agency_name
    FROM batches b
    LEFT JOIN users u ON b.exporter_id = u.id
    LEFT JOIN users qa ON b.assigned_qa_id = qa.id
    ${whereClause}
    ORDER BY b.created_at DESC
    LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
    values
  );

  const countResult = await query(
    `SELECT COUNT(*) as total FROM batches b ${whereClause}`,
    values.slice(0, -2)
  );

  return {
    batches: result.rows,
    total: parseInt(countResult.rows[0].total),
  };
};

export const update = async (batchId, updates) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  Object.keys(updates).forEach((key) => {
    fields.push(`${key} = $${paramCount}`);
    values.push(updates[key]);
    paramCount++;
  });

  fields.push(`updated_at = NOW()`);
  values.push(batchId);

  const result = await query(
    `UPDATE batches SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );

  return result.rows[0];
};

export const deleteById = async (batchId) => {
  const result = await query('UPDATE batches SET status = $1 WHERE id = $2 RETURNING id', [
    'deleted',
    batchId,
  ]);

  return result.rows[0];
};

export const hardDelete = async (batchId) => {
  const result = await query('DELETE FROM batches WHERE id = $1 RETURNING id', [batchId]);
  return result.rows[0];
};

export const findAttachments = async (batchId) => {
  const result = await query(
    `SELECT * FROM batch_attachments WHERE batch_id = $1 ORDER BY created_at DESC`,
    [batchId]
  );

  return result.rows;
};

export const createAttachment = async (attachmentData) => {
  const { batchId, fileName, s3Key, fileSize, mimeType, uploadedBy } = attachmentData;

  const result = await query(
    `INSERT INTO batch_attachments (batch_id, file_name, s3_key, file_size, mime_type, uploaded_by)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [batchId, fileName, s3Key, fileSize, mimeType, uploadedBy]
  );

  return result.rows[0];
};

export const deleteAttachment = async (attachmentId) => {
  const result = await query(
    'DELETE FROM batch_attachments WHERE id = $1 RETURNING s3_key',
    [attachmentId]
  );

  return result.rows[0];
};

export default {
  create,
  findById,
  findAll,
  update,
  deleteById,
  hardDelete,
  findAttachments,
  createAttachment,
  deleteAttachment,
};
