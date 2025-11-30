import * as authService from '../services/auth.service.js';
import * as User from '../models/User.js';
import { success, created, badRequest, unauthorized } from '../utils/response.js';

export const register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      return badRequest(res, 'Email, password, and name are required');
    }

    const result = await authService.register(email, password, name, role);
    return created(res, result, 'User registered successfully');
  } catch (error) {
    if (error.message === 'User already exists') {
      return badRequest(res, error.message);
    }
    return badRequest(res, error.message);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return badRequest(res, 'Email and password are required');
    }

    const result = await authService.login(email, password);
    return success(res, result, 'Login successful');
  } catch (error) {
    return unauthorized(res, error.message);
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);

    if (!user) {
      return unauthorized(res, 'User not found');
    }

    return success(res, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.created_at
    }, 'Profile retrieved successfully');
  } catch (error) {
    return badRequest(res, error.message);
  }
};

export default {
  register,
  login,
  getProfile
};
