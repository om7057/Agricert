import * as Batch from '../models/Batch.js';
import * as storageService from './storage.service.js';

const generateBatchNumber = () => {
  const year = new Date().getFullYear();
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `BATCH-${year}-${timestamp}-${random}`;
};

const validateBatchData = (batchData) => {
  if (!batchData.productType || !batchData.productName) {
    throw new Error('Product type and name are required');
  }

  if (!batchData.quantity || batchData.quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  if (!batchData.unit) {
    throw new Error('Unit is required');
  }

  if (!batchData.originLocation) {
    throw new Error('Origin location is required');
  }

  if (!batchData.destinationCountry) {
    throw new Error('Destination country is required');
  }
};

export const createBatch = async (batchData, exporterId) => {
  validateBatchData(batchData);

  const batchNumber = generateBatchNumber();

  const batch = await Batch.create({
    batchNumber,
    exporterId,
    productType: batchData.productType,
    productName: batchData.productName,
    quantity: batchData.quantity,
    unit: batchData.unit,
    originLocation: batchData.originLocation,
    destinationCountry: batchData.destinationCountry,
    packagingType: batchData.packagingType,
    storageConditions: batchData.storageConditions,
  });

  return batch;
};

export const getBatchById = async (batchId, userId, userRole) => {
  const batch = await Batch.findById(batchId);

  if (!batch) {
    throw new Error('Batch not found');
  }

  if (userRole === 'exporter' && batch.exporter_id !== userId) {
    throw new Error('Access denied');
  }

  if (userRole === 'qa_agency' && batch.assigned_qa_id !== userId) {
    throw new Error('Access denied');
  }

  const attachments = await Batch.findAttachments(batchId);

  const attachmentsWithUrls = await Promise.all(
    attachments.map(async (attachment) => {
      const signedUrl = await storageService.getSignedDownloadUrl(attachment.s3_key, 3600);
      return {
        ...attachment,
        downloadUrl: signedUrl,
      };
    })
  );

  return {
    ...batch,
    attachments: attachmentsWithUrls,
  };
};

export const getAllBatches = async (userId, userRole, filters = {}, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const queryFilters = { ...filters };

  if (userRole === 'exporter') {
    queryFilters.exporterId = userId;
  } else if (userRole === 'qa_agency') {
    queryFilters.assignedQaId = userId;
  }

  const result = await Batch.findAll(queryFilters, limit, offset);

  return {
    batches: result.batches,
    total: result.total,
    page,
    limit,
    totalPages: Math.ceil(result.total / limit),
  };
};

export const updateBatch = async (batchId, updateData, userId, userRole) => {
  const batch = await Batch.findById(batchId);

  if (!batch) {
    throw new Error('Batch not found');
  }

  if (userRole !== 'admin' && batch.exporter_id !== userId) {
    throw new Error('Access denied');
  }

  if (batch.status !== 'submitted') {
    throw new Error('Cannot update batch after inspection has started');
  }

  const allowedFields = [
    'quantity',
    'unit',
    'packaging_type',
    'storage_conditions',
    'destination_country',
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      updates[field] = updateData[field];
    }
  });

  if (Object.keys(updates).length === 0) {
    throw new Error('No valid fields to update');
  }

  const updatedBatch = await Batch.update(batchId, updates);
  return updatedBatch;
};

export const deleteBatch = async (batchId, userId, userRole) => {
  const batch = await Batch.findById(batchId);

  if (!batch) {
    throw new Error('Batch not found');
  }

  if (userRole !== 'admin' && batch.exporter_id !== userId) {
    throw new Error('Access denied');
  }

  if (batch.status !== 'submitted') {
    throw new Error('Cannot delete batch after inspection has started');
  }

  const attachments = await Batch.findAttachments(batchId);
  if (attachments.length > 0) {
    const s3Keys = attachments.map((att) => att.s3_key);
    await storageService.deleteMultipleFiles(s3Keys);
  }

  await Batch.deleteById(batchId);

  return { message: 'Batch deleted successfully' };
};

export const assignQA = async (batchId, qaAgencyId, adminId) => {
  const batch = await Batch.findById(batchId);

  if (!batch) {
    throw new Error('Batch not found');
  }

  if (batch.status !== 'submitted') {
    throw new Error('Batch is not in submitted status');
  }

  const updatedBatch = await Batch.update(batchId, {
    assigned_qa_id: qaAgencyId,
    status: 'under_inspection',
  });

  return updatedBatch;
};

export const uploadAttachments = async (batchId, files, userId) => {
  const batch = await Batch.findById(batchId);

  if (!batch) {
    throw new Error('Batch not found');
  }

  if (batch.exporter_id !== userId) {
    throw new Error('Access denied');
  }

  if (batch.status === 'certified' || batch.status === 'deleted') {
    throw new Error('Cannot upload attachments to this batch');
  }

  const uploadResults = await storageService.uploadMultipleFiles(files, `batches/${batchId}`);

  const attachments = await Promise.all(
    uploadResults.map(async (result) => {
      return await Batch.createAttachment({
        batchId,
        fileName: result.originalName,
        s3Key: result.key,
        fileSize: result.size,
        mimeType: result.mimetype,
        uploadedBy: userId,
      });
    })
  );

  const attachmentsWithUrls = await Promise.all(
    attachments.map(async (attachment) => {
      const signedUrl = await storageService.getSignedDownloadUrl(attachment.s3_key, 3600);
      return {
        ...attachment,
        downloadUrl: signedUrl,
      };
    })
  );

  return attachmentsWithUrls;
};

export default {
  createBatch,
  getBatchById,
  getAllBatches,
  updateBatch,
  deleteBatch,
  assignQA,
  uploadAttachments,
};
