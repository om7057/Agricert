import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT) || 5432,
  DB_NAME: process.env.DB_NAME || 'agriqcert_db',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',

  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',

  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 5242880,

  API_VERSION: process.env.API_VERSION || 'v1',

  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || 'agriqcert-uploads',

  INJI_CERTIFY_URL: process.env.INJI_CERTIFY_URL || 'https://api.inji.certify.io',
  INJI_VERIFY_URL: process.env.INJI_VERIFY_URL || 'https://api.inji.verify.io',
  INJI_WALLET_URL: process.env.INJI_WALLET_URL || 'https://api.inji.wallet.io',
  INJI_API_KEY: process.env.INJI_API_KEY || 'placeholder-api-key',

  BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
};

export default env;
