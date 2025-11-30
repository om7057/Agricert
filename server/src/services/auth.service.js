import * as User from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken, verifyToken as verifyJWT } from '../utils/jwt.js';

export const register = async (email, password, name, role = 'user') => {
  const existingUser = await User.findByEmail(email);

  if (existingUser) {
    throw new Error('User already exists');
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    email,
    password: hashedPassword,
    name,
    role
  });

  const token = generateToken({ 
    userId: user.id, 
    email: user.email, 
    role: user.role 
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.created_at
    },
    token
  };
};

export const login = async (email, password) => {
  const user = await User.findByEmail(email);

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValidPassword = await comparePassword(password, user.password);

  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken({ 
    userId: user.id, 
    email: user.email, 
    role: user.role 
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.created_at
    },
    token
  };
};

export const verifyToken = (token) => {
  try {
    const decoded = verifyJWT(token);
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export default {
  register,
  login,
  verifyToken
};
