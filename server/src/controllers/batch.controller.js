import * as batchService from '../services/batch.service.js';
import { success, created, badRequest, notFound, forbidden } from '../utils/response.js';

export const createBatch = async (req, res) => {
  try {
    const exporterId = req.user.userId;
    const batch = await batchService.createBatch(req.body, exporterId);
    return created(res, batch, 'Batch created successfully');
  } catch (error) {
    return badRequest(res, error.message);
  }
};

export const getAllBatches = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { status, productType, page = 1, limit = 20 } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (productType) filters.productType = productType;

    const result = await batchService.getAllBatches(
      userId,
      userRole,
      filters,
      parseInt(page),
      parseInt(limit)
    );

    return success(res, result, 'Batches retrieved successfully');
  } catch (error) {
    return badRequest(res, error.message);
  }
};

export const getBatchById = async (req, res) => {
  try {
    const batchId = req.params.id;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const batch = await batchService.getBatchById(batchId, userId, userRole);
    return success(res, batch, 'Batch retrieved successfully');
  } catch (error) {
    if (error.message === 'Batch not found') {
      return notFound(res, error.message);
    }
    if (error.message === 'Access denied') {
      return forbidden(res, error.message);
    }
    return badRequest(res, error.message);
  }
};

export const updateBatch = async (req, res) => {
  try {
    const batchId = req.params.id;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const batch = await batchService.updateBatch(batchId, req.body, userId, userRole);
    return success(res, batch, 'Batch updated successfully');
  } catch (error) {
    if (error.message === 'Batch not found') {
      return notFound(res, error.message);
    }
    if (error.message === 'Access denied') {
      return forbidden(res, error.message);
    }
    return badRequest(res, error.message);
  }
};

export const deleteBatch = async (req, res) => {
  try {
    const batchId = req.params.id;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const result = await batchService.deleteBatch(batchId, userId, userRole);
    return success(res, result, 'Batch deleted successfully');
  } catch (error) {
    if (error.message === 'Batch not found') {
      return notFound(res, error.message);
    }
    if (error.message === 'Access denied') {
      return forbidden(res, error.message);
    }
    return badRequest(res, error.message);
  }
};

export const uploadAttachments = async (req, res) => {
  try {
    const batchId = req.params.id;
    const userId = req.user.userId;

    if (!req.files || req.files.length === 0) {
      return badRequest(res, 'No files uploaded');
    }

    const attachments = await batchService.uploadAttachments(batchId, req.files, userId);
    return created(res, attachments, 'Files uploaded successfully');
  } catch (error) {
    if (error.message === 'Batch not found') {
      return notFound(res, error.message);
    }
    if (error.message === 'Access denied') {
      return forbidden(res, error.message);
    }
    return badRequest(res, error.message);
  }
};

export const assignQA = async (req, res) => {
  try {
    const batchId = req.params.id;
    const { qaAgencyId } = req.body;
    const adminId = req.user.userId;

    if (!qaAgencyId) {
      return badRequest(res, 'QA Agency ID is required');
    }

    const batch = await batchService.assignQA(batchId, qaAgencyId, adminId);
    return success(res, batch, 'QA Agency assigned successfully');
  } catch (error) {
    if (error.message === 'Batch not found') {
      return notFound(res, error.message);
    }
    return badRequest(res, error.message);
  }
};

export default {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
  uploadAttachments,
  assignQA,
};
