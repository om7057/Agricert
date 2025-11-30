import * as vcService from '../services/vc.service.js';
import * as Credential from '../models/Credential.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const issueCredential = async (req, res) => {
  try {
    const { batchId, inspectionId } = req.body;

    if (!batchId || !inspectionId) {
      return errorResponse(res, 'Batch ID and Inspection ID are required', 400);
    }

    const result = await vcService.issueCredential(batchId, inspectionId, req.user.id);

    return successResponse(
      res,
      {
        credential: result.credential,
        qrCode: result.qrCode,
        credentialUrl: result.credentialUrl
      },
      'Credential issued successfully',
      201
    );
  } catch (error) {
    console.error('[Credential Controller] Issue failed:', error.message);
    return errorResponse(res, error.message, 400);
  }
};

export const getCredentialById = async (req, res) => {
  try {
    const { id } = req.params;

    const credential = await vcService.getCredentialById(id);

    if (!credential) {
      return errorResponse(res, 'Credential not found', 404);
    }

    const vcData = typeof credential.vc_json === 'string'
      ? JSON.parse(credential.vc_json)
      : credential.vc_json;

    return successResponse(res, {
      id: credential.id,
      credentialId: credential.credential_id,
      batchId: credential.batch_id,
      inspectionId: credential.inspection_id,
      vcData,
      revoked: credential.is_revoked,
      revokedAt: credential.revoked_at,
      revocationReason: credential.revocation_reason,
      issuedAt: credential.issued_at,
      expiresAt: credential.expires_at,
      verificationCount: credential.verification_count
    });
  } catch (error) {
    console.error('[Credential Controller] Get failed:', error.message);
    return errorResponse(res, error.message, 400);
  }
};

export const getCredentialQR = async (req, res) => {
  try {
    const { id } = req.params;

    const credential = await Credential.findById(id);

    if (!credential) {
      return errorResponse(res, 'Credential not found', 404);
    }

    if (!credential.qr_code_image) {
      return errorResponse(res, 'QR code not available', 404);
    }

    const base64Data = credential.qr_code_image.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    res.set({
      'Content-Type': 'image/png',
      'Content-Length': buffer.length,
      'Cache-Control': 'public, max-age=3600'
    });

    return res.send(buffer);
  } catch (error) {
    console.error('[Credential Controller] Get QR failed:', error.message);
    return errorResponse(res, error.message, 400);
  }
};

export const revokeCredential = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return errorResponse(res, 'Revocation reason is required', 400);
    }

    const credential = await vcService.revokeCredential(id, req.user.id, reason);

    return successResponse(res, credential, 'Credential revoked successfully');
  } catch (error) {
    console.error('[Credential Controller] Revoke failed:', error.message);
    return errorResponse(res, error.message, 400);
  }
};

export const getCredentialsByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;

    const credentials = await vcService.getCredentialByBatchId(batchId);

    return successResponse(res, credentials, 'Credentials retrieved successfully');
  } catch (error) {
    console.error('[Credential Controller] Get by batch failed:', error.message);
    return errorResponse(res, error.message, 400);
  }
};

export const verifyCredential = async (req, res) => {
  try {
    const { vcData } = req.body;

    if (!vcData) {
      return errorResponse(res, 'VC data is required', 400);
    }

    const verification = await vcService.verifyCredential(vcData);

    return successResponse(res, verification, 'Verification completed');
  } catch (error) {
    console.error('[Credential Controller] Verify failed:', error.message);
    return errorResponse(res, error.message, 400);
  }
};

export const checkRevocationStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const status = await vcService.checkRevocationStatus(id);

    return successResponse(res, status, 'Revocation status retrieved');
  } catch (error) {
    console.error('[Credential Controller] Check revocation failed:', error.message);
    return errorResponse(res, error.message, 400);
  }
};

export const getAllCredentials = async (req, res) => {
  try {
    const { revoked, credentialType, limit, offset } = req.query;

    const filters = {
      revoked: revoked === 'true' ? true : revoked === 'false' ? false : undefined,
      credentialType,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined
    };

    if (req.user.role === 'exporter') {
      filters.exporterId = req.user.id;
    }

    const credentials = await Credential.findAll(filters);

    return successResponse(res, credentials, 'Credentials retrieved successfully');
  } catch (error) {
    console.error('[Credential Controller] Get all failed:', error.message);
    return errorResponse(res, error.message, 400);
  }
};

export const regenerateQR = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await vcService.regenerateQRCode(id);

    return successResponse(res, result, 'QR code regenerated successfully');
  } catch (error) {
    console.error('[Credential Controller] Regenerate QR failed:', error.message);
    return errorResponse(res, error.message, 400);
  }
};

export const getStatistics = async (req, res) => {
  try {
    const stats = await Credential.getStatistics();

    return successResponse(res, stats, 'Statistics retrieved successfully');
  } catch (error) {
    console.error('[Credential Controller] Get statistics failed:', error.message);
    return errorResponse(res, error.message, 400);
  }
};

export default {
  issueCredential,
  getCredentialById,
  getCredentialQR,
  revokeCredential,
  getCredentialsByBatch,
  verifyCredential,
  checkRevocationStatus,
  getAllCredentials,
  regenerateQR,
  getStatistics
};
