export const success = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data
  });
};

export const error = (res, message = 'Error', statusCode = 500, errors = null) => {
  const response = {
    status: 'error',
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

// Backwards-compatible aliases used across controllers
export const successResponse = success;
export const errorResponse = error;

export const created = (res, data = null, message = 'Resource created successfully') => {
  return success(res, data, message, 201);
};

export const badRequest = (res, message = 'Bad request', errors = null) => {
  return error(res, message, 400, errors);
};

export const unauthorized = (res, message = 'Unauthorized') => {
  return error(res, message, 401);
};

export const forbidden = (res, message = 'Forbidden') => {
  return error(res, message, 403);
};

export const notFound = (res, message = 'Resource not found') => {
  return error(res, message, 404);
};

export const conflict = (res, message = 'Conflict') => {
  return error(res, message, 409);
};

export default {
  success,
  error,
  created,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict
};
