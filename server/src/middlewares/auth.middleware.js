import { verifyToken } from '../utils/jwt.js';
import { unauthorized } from '../utils/response.js';

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized(res, 'No token provided');
    }

    const token = authHeader.substring(7);

    const decoded = verifyToken(token);
    req.user = decoded;
    
    next();
  } catch (error) {
    return unauthorized(res, 'Invalid or expired token');
  }
};

export default authenticate;
