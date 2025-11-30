import { query, getClient } from '../config/database.js';

export const create = async (inspectionData) => {
  const { batchId, qaAgencyId } = inspectionData;

  const result = await query(
    `INSERT INTO inspections (batch_id, qa_agency_id, inspection_date)
    VALUES ($1, $2, NOW()) RETURNING *`,
    [batchId, qaAgencyId]
  );

  return result.rows[0];
};

export const findById = async (inspectionId) => {
  const result = await query(
    `SELECT i.*,
      b.batch_number, b.product_name, b.product_type, b.exporter_id,
      qa.name as qa_agency_name, qa.email as qa_agency_email,
      e.name as exporter_name, e.email as exporter_email
    FROM inspections i
    JOIN batches b ON i.batch_id = b.id
    JOIN users qa ON i.qa_agency_id = qa.id
    JOIN users e ON b.exporter_id = e.id
    WHERE i.id = $1`,
    [inspectionId]
  );

  return result.rows[0];
};

export const findByBatchId = async (batchId) => {
  const result = await query(
    `SELECT i.*,
      qa.name as qa_agency_name, qa.email as qa_agency_email
    FROM inspections i
    JOIN users qa ON i.qa_agency_id = qa.id
    WHERE i.batch_id = $1`,
    [batchId]
  );

  return result.rows[0];
};

export const findPendingByQA = async (qaAgencyId) => {
  const result = await query(
    `SELECT b.*,
      u.name as exporter_name, u.email as exporter_email,
      i.id as inspection_id, i.inspection_result
    FROM batches b
    JOIN users u ON b.exporter_id = u.id
    LEFT JOIN inspections i ON b.id = i.batch_id
    WHERE b.assigned_qa_id = $1 
      AND b.status = $2
      AND (i.inspection_result IS NULL OR i.inspection_result = '')
    ORDER BY b.created_at ASC`,
    [qaAgencyId, 'under_inspection']
  );

  return result.rows;
};

export const update = async (inspectionId, updates) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  Object.keys(updates).forEach((key) => {
    fields.push(`${key} = $${paramCount}`);
    values.push(updates[key]);
    paramCount++;
  });

  values.push(inspectionId);

  const result = await query(
    `UPDATE inspections SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );

  return result.rows[0];
};

export const submitResult = async (inspectionId, result, qaAgencyId) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const inspectionResult = await client.query(
      `UPDATE inspections 
      SET inspection_result = $1, result_submitted_at = NOW()
      WHERE id = $2 AND qa_agency_id = $3
      RETURNING *`,
      [result, inspectionId, qaAgencyId]
    );

    if (inspectionResult.rows.length === 0) {
      throw new Error('Inspection not found or access denied');
    }

    const inspection = inspectionResult.rows[0];

    let batchStatus;
    if (result === 'passed') {
      batchStatus = 'certified';
    } else if (result === 'failed') {
      batchStatus = 'rejected';
    } else {
      batchStatus = 'under_inspection';
    }

    const batchResult = await client.query(
      `UPDATE batches SET status = $1 WHERE id = $2 RETURNING *`,
      [batchStatus, inspection.batch_id]
    );

    await client.query('COMMIT');

    return {
      inspection: inspectionResult.rows[0],
      batch: batchResult.rows[0],
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export default {
  create,
  findById,
  findByBatchId,
  findPendingByQA,
  update,
  submitResult,
};
