import * as inspectionService from '../services/inspection.service.js';
import { success, created, badRequest, notFound, forbidden } from '../utils/response.js';

export const createInspection = async (req, res) => {
  try {
    const { batchId } = req.body;
    const qaAgencyId = req.user.userId;

    if (!batchId) {
      return badRequest(res, 'Batch ID is required');
    }

    const inspection = await inspectionService.createInspection(batchId, qaAgencyId);
    return created(res, inspection, 'Inspection started successfully');
  } catch (error) {
    if (error.message === 'Batch not found') {
      return notFound(res, error.message);
    }
    return badRequest(res, error.message);
  }
};

export const updateInspection = async (req, res) => {
  try {
    const inspectionId = req.params.id;
    const qaAgencyId = req.user.userId;

    const inspection = await inspectionService.updateInspection(
      inspectionId,
      req.body,
      qaAgencyId
    );

    return success(res, inspection, 'Inspection updated successfully');
  } catch (error) {
    if (error.message === 'Inspection not found') {
      return notFound(res, error.message);
    }
    if (error.message === 'Access denied') {
      return forbidden(res, error.message);
    }
    return badRequest(res, error.message);
  }
};

export const getInspectionById = async (req, res) => {
  try {
    const inspectionId = req.params.id;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const inspection = await inspectionService.getInspectionById(
      inspectionId,
      userId,
      userRole
    );

    return success(res, inspection, 'Inspection retrieved successfully');
  } catch (error) {
    if (error.message === 'Inspection not found') {
      return notFound(res, error.message);
    }
    if (error.message === 'Access denied') {
      return forbidden(res, error.message);
    }
    return badRequest(res, error.message);
  }
};

export const getPendingInspections = async (req, res) => {
  try {
    const qaAgencyId = req.user.userId;

    const batches = await inspectionService.getPendingInspections(qaAgencyId);
    return success(res, batches, 'Pending inspections retrieved successfully');
  } catch (error) {
    return badRequest(res, error.message);
  }
};

export const getInspectionByBatch = async (req, res) => {
  try {
    const batchId = req.params.batchId;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const inspection = await inspectionService.getInspectionByBatch(
      batchId,
      userId,
      userRole
    );

    if (!inspection) {
      return notFound(res, 'No inspection found for this batch');
    }

    return success(res, inspection, 'Inspection retrieved successfully');
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

export const submitInspectionResult = async (req, res) => {
  try {
    const inspectionId = req.params.id;
    const { result } = req.body;
    const qaAgencyId = req.user.userId;

    if (!result) {
      return badRequest(res, 'Inspection result is required');
    }

    const submitResult = await inspectionService.submitInspectionResult(
      inspectionId,
      result,
      qaAgencyId
    );

    return success(res, submitResult, 'Inspection result submitted successfully');
  } catch (error) {
    if (error.message === 'Inspection not found') {
      return notFound(res, error.message);
    }
    if (error.message === 'Access denied') {
      return forbidden(res, error.message);
    }
    return badRequest(res, error.message);
  }
};

export default {
  createInspection,
  updateInspection,
  getInspectionById,
  getPendingInspections,
  getInspectionByBatch,
  submitInspectionResult,
};
