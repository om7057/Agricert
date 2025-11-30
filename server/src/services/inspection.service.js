import * as Inspection from '../models/Inspection.js';
import * as Batch from '../models/Batch.js';

const validateInspectionData = (data) => {
  if (data.moisture_level !== undefined && (data.moisture_level < 0 || data.moisture_level > 100)) {
    throw new Error('Moisture level must be between 0 and 100');
  }

  if (data.pesticide_content !== undefined && data.pesticide_content < 0) {
    throw new Error('Pesticide content cannot be negative');
  }

  if (data.grain_quality_score !== undefined && (data.grain_quality_score < 0 || data.grain_quality_score > 100)) {
    throw new Error('Grain quality score must be between 0 and 100');
  }
};

const validateInspectionComplete = (inspection) => {
  const requiredFields = [
    'moisture_level',
    'pesticide_content',
    'grain_quality_score',
    'inspector_name',
    'inspector_license'
  ];

  for (const field of requiredFields) {
    if (inspection[field] === null || inspection[field] === undefined) {
      throw new Error(`Required field missing: ${field}`);
    }
  }
};

export const createInspection = async (batchId, qaAgencyId) => {
  const batch = await Batch.findById(batchId);

  if (!batch) {
    throw new Error('Batch not found');
  }

  if (batch.assigned_qa_id !== qaAgencyId) {
    throw new Error('This batch is not assigned to you');
  }

  if (batch.status !== 'under_inspection') {
    throw new Error('Batch is not available for inspection');
  }

  const existingInspection = await Inspection.findByBatchId(batchId);
  if (existingInspection) {
    throw new Error('Inspection already started for this batch');
  }

  const inspection = await Inspection.create({
    batchId,
    qaAgencyId,
  });

  return inspection;
};

export const updateInspection = async (inspectionId, inspectionData, qaAgencyId) => {
  const inspection = await Inspection.findById(inspectionId);

  if (!inspection) {
    throw new Error('Inspection not found');
  }

  if (inspection.qa_agency_id !== qaAgencyId) {
    throw new Error('Access denied');
  }

  if (inspection.inspection_result) {
    throw new Error('Cannot update completed inspection');
  }

  validateInspectionData(inspectionData);

  const allowedFields = [
    'moisture_level',
    'pesticide_content',
    'aflatoxin_level',
    'grain_quality_score',
    'heavy_metals_content',
    'microbiological_quality',
    'is_organic',
    'is_gmo_free',
    'meets_iso_22000',
    'meets_haccp',
    'meets_global_gap',
    'compliance_standards',
    'inspector_name',
    'inspector_license',
    'lab_name',
    'lab_certificate_number',
    'remarks',
    'recommendations',
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (inspectionData[field] !== undefined) {
      updates[field] = inspectionData[field];
    }
  });

  if (Object.keys(updates).length === 0) {
    throw new Error('No valid fields to update');
  }

  const updatedInspection = await Inspection.update(inspectionId, updates);
  return updatedInspection;
};

export const getInspectionById = async (inspectionId, userId, userRole) => {
  const inspection = await Inspection.findById(inspectionId);

  if (!inspection) {
    throw new Error('Inspection not found');
  }

  if (userRole === 'qa_agency' && inspection.qa_agency_id !== userId) {
    throw new Error('Access denied');
  }

  if (userRole === 'exporter' && inspection.exporter_id !== userId) {
    throw new Error('Access denied');
  }

  return inspection;
};

export const getPendingInspections = async (qaAgencyId) => {
  const batches = await Inspection.findPendingByQA(qaAgencyId);

  return batches.map((batch) => ({
    ...batch,
    inspection_status: batch.inspection_id ? 'in_progress' : 'not_started',
  }));
};

export const getInspectionByBatch = async (batchId, userId, userRole) => {
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

  const inspection = await Inspection.findByBatchId(batchId);
  return inspection || null;
};

export const submitInspectionResult = async (inspectionId, result, qaAgencyId) => {
  const validResults = ['passed', 'failed', 'conditional'];
  if (!validResults.includes(result)) {
    throw new Error('Invalid result. Must be: passed, failed, or conditional');
  }

  const inspection = await Inspection.findById(inspectionId);

  if (!inspection) {
    throw new Error('Inspection not found');
  }

  if (inspection.qa_agency_id !== qaAgencyId) {
    throw new Error('Access denied');
  }

  if (inspection.inspection_result) {
    throw new Error('Inspection result already submitted');
  }

  if (result === 'passed' || result === 'failed') {
    validateInspectionComplete(inspection);
  }

  const submitResult = await Inspection.submitResult(inspectionId, result, qaAgencyId);

  return submitResult;
};

export default {
  createInspection,
  updateInspection,
  getInspectionById,
  getPendingInspections,
  getInspectionByBatch,
  submitInspectionResult,
};
