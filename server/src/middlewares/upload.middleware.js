import multer from 'multer';
import env from '../config/env.js';
import { badRequest } from '../utils/response.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE
  }
});

export const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const singleUpload = upload.single(fieldName);
    
    singleUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return badRequest(res, `File size exceeds limit of ${env.MAX_FILE_SIZE / 1024 / 1024}MB`);
        }
        return badRequest(res, err.message);
      } else if (err) {
        return badRequest(res, err.message);
      }
      next();
    });
  };
};

export const uploadMultiple = (fieldName, maxCount = 10) => {
  return (req, res, next) => {
    const multipleUpload = upload.array(fieldName, maxCount);
    
    multipleUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return badRequest(res, `File size exceeds limit of ${env.MAX_FILE_SIZE / 1024 / 1024}MB`);
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return badRequest(res, `Too many files. Maximum ${maxCount} files allowed`);
        }
        return badRequest(res, err.message);
      } else if (err) {
        return badRequest(res, err.message);
      }
      next();
    });
  };
};

export const uploadFields = (fields) => {
  return (req, res, next) => {
    const fieldsUpload = upload.fields(fields);
    
    fieldsUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return badRequest(res, `File size exceeds limit of ${env.MAX_FILE_SIZE / 1024 / 1024}MB`);
        }
        return badRequest(res, err.message);
      } else if (err) {
        return badRequest(res, err.message);
      }
      next();
    });
  };
};

export default {
  uploadSingle,
  uploadMultiple,
  uploadFields
};
