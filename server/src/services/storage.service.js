import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import path from 'path';
import env from '../config/env.js';

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

const generateFileName = (originalName) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext).replace(/[^a-zA-Z0-9]/g, '-');
  return `${name}-${timestamp}-${randomString}${ext}`;
};

export const uploadFile = async (file, folder = 'documents') => {
  const fileName = generateFileName(file.originalname);
  const key = `${folder}/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);

  return {
    key,
    fileName,
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
  };
};

export const uploadMultipleFiles = async (files, folder = 'documents') => {
  const uploadPromises = files.map(file => uploadFile(file, folder));
  return await Promise.all(uploadPromises);
};

export const getFile = async (key) => {
  const command = new GetObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
  });

  const response = await s3Client.send(command);
  return response.Body;
};

export const getSignedDownloadUrl = async (key, expiresIn = 3600) => {
  const command = new GetObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
};

export const getSignedUploadUrl = async (fileName, folder = 'documents', expiresIn = 3600) => {
  const key = `${folder}/${generateFileName(fileName)}`;

  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });

  return {
    signedUrl,
    key,
  };
};

export const deleteFile = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
  });

  await s3Client.send(command);
  return { deleted: true, key };
};

export const deleteMultipleFiles = async (keys) => {
  const deletePromises = keys.map(key => deleteFile(key));
  return await Promise.all(deletePromises);
};

export const fileExists = async (key) => {
  try {
    const command = new HeadObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    if (error.name === 'NotFound') {
      return false;
    }
    throw error;
  }
};

export default {
  uploadFile,
  uploadMultipleFiles,
  getFile,
  getSignedDownloadUrl,
  getSignedUploadUrl,
  deleteFile,
  deleteMultipleFiles,
  fileExists,
};
