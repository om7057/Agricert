import { query } from '../config/database.js';

export const findById = async (id) => {
  const result = await query(
    'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

export const findByEmail = async (email) => {
  const result = await query(
    'SELECT id, email, password, name, role, created_at FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

export const create = async (userData) => {
  const { email, password, name, role } = userData;
  const result = await query(
    'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role, created_at',
    [email, password, name, role || 'user']
  );
  return result.rows[0];
};

export const update = async (id, updates) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  Object.keys(updates).forEach(key => {
    fields.push(`${key} = $${paramCount}`);
    values.push(updates[key]);
    paramCount++;
  });

  values.push(id);

  const result = await query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING id, email, name, role, created_at`,
    values
  );
  return result.rows[0];
};

export const deleteById = async (id) => {
  const result = await query(
    'DELETE FROM users WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rows[0];
};

export const findAll = async (limit = 10, offset = 0) => {
  const result = await query(
    'SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  return result.rows;
};

export default {
  findById,
  findByEmail,
  create,
  update,
  deleteById,
  findAll
};
