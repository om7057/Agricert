import * as Batch from '../models/Batch.js';
import * as Inspection from '../models/Inspection.js';
import * as Credential from '../models/Credential.js';
import * as User from '../models/User.js';
import * as injiService from './inji.service.js';
import * as qrcodeUtil from '../utils/qrcode.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const vcTemplate = JSON.parse(
  readFileSync(join(__dirname, '../schemas/digital-product-passport.json'), 'utf-8')
);

export const issueCredential = async (batchId, inspectionId, issuedBy) => {
  try {
    const batch = await Batch.findById(batchId);
    if (!batch) {
      throw new Error('Batch not found');
    }

    const inspection = await Inspection.findById(inspectionId);
    if (!inspection) {
      throw new Error('Inspection not found');
    }

    if (inspection.result !== 'pass') {
      throw new Error('Cannot issue credential for failed inspection');
    }

    const exporter = await User.findById(batch.exporter_id);
    const inspector = await User.findById(inspection.inspector_id);

    const existingCredential = await Credential.findByInspectionId(inspectionId);
    if (existingCredential && !existingCredential.revoked) {
      throw new Error('Credential already issued for this inspection');
    }

    const vcData = constructVC(batch, inspection, exporter, inspector);

    const validation = injiService.validateCredential(vcData);
    if (!validation.valid) {
      throw new Error(`Invalid VC structure: ${validation.errors.join(', ')}`);
    }

    const { signedCredential, signature } = await injiService.signCredential(vcData);

    const credentialUrl = `${process.env.BASE_URL || 'https://agriqcert.org'}/api/credentials/${batchId}`;
    const qrResult = await qrcodeUtil.generateInjiCompatibleQR(credentialUrl, signedCredential);

    const credential = await Credential.create({
      batchId: batch.id,
      inspectionId: inspection.id,
      credentialType: 'AgriQualityCertificate',
      vcData: signedCredential,
      qrCode: qrResult.qrCode,
      qrData: qrResult.qrData,
      signature,
      issuedBy,
      expiresAt: signedCredential.expirationDate
    });

    await Batch.update(batch.id, { status: 'certified' });

    return {
      credential,
      vcData: signedCredential,
      qrCode: qrResult.qrCode,
      credentialUrl
    };
  } catch (error) {
    console.error('[VC Service] Issuance failed:', error.message);
    throw error;
  }
};

export const constructVC = (batch, inspection, exporter, inspector) => {
  const now = new Date();
  const expiryDate = new Date(now);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  const qualityParams = inspection.quality_parameters || {};
  
  const parseQualityParam = (param) => {
    if (!param) return null;
    return {
      value: param.value ?? null,
      unit: param.unit ?? '%',
      limit: param.limit ?? null,
      status: param.status ?? 'unknown'
    };
  };

  const vcData = {
    ...vcTemplate,
    issuanceDate: now.toISOString(),
    expirationDate: expiryDate.toISOString(),
    credentialSubject: {
      type: 'AgriQualityCertificate',
      batchId: batch.batch_number || batch.id,
      productName: batch.product_name,
      productType: batch.product_type,
      origin: {
        country: batch.origin_country || '',
        state: batch.origin_state || '',
        district: batch.origin_district || '',
        farmLocation: {
          latitude: batch.origin_latitude || null,
          longitude: batch.origin_longitude || null
        }
      },
      quantity: {
        value: parseFloat(batch.quantity) || 0,
        unit: batch.unit || 'kg'
      },
      harvestDate: batch.harvest_date || batch.created_at,
      exporter: {
        id: injiService.generateDID('exporter', exporter.id),
        name: exporter.name || exporter.email,
        registrationNumber: exporter.registration_number || '',
        address: exporter.address || ''
      },
      qualityStandard: {
        standard: inspection.quality_standard || 'FSSAI',
        version: '2024',
        complianceLevel: inspection.grade || 'A'
      },
      inspection: {
        inspectionId: inspection.id,
        inspectionDate: inspection.inspection_date || inspection.created_at,
        inspector: {
          id: injiService.generateDID('inspector', inspector.id),
          name: inspector.name || inspector.email,
          licenseNumber: inspector.license_number || ''
        },
        result: inspection.result,
        grade: inspection.grade || 'A',
        remarks: inspection.remarks || ''
      },
      qualityParameters: {
        moistureContent: parseQualityParam(qualityParams.moistureContent),
        aflatoxinLevel: parseQualityParam(qualityParams.aflatoxinLevel),
        pesticideResidue: parseQualityParam(qualityParams.pesticideResidue),
        foreignMatter: parseQualityParam(qualityParams.foreignMatter),
        brokenGrains: parseQualityParam(qualityParams.brokenGrains)
      },
      certifications: batch.certifications || [],
      supplyChain: {
        stages: [
          {
            stage: 'Harvest',
            location: `${batch.origin_district}, ${batch.origin_state}`,
            timestamp: batch.harvest_date || batch.created_at,
            handler: exporter.name
          },
          {
            stage: 'Inspection',
            location: inspection.inspection_location || 'Quality Lab',
            timestamp: inspection.inspection_date || inspection.created_at,
            handler: inspector.name
          }
        ],
        transportConditions: batch.transport_conditions || {
          temperature: null,
          humidity: null,
          packaging: batch.packaging_type || ''
        }
      },
      compliance: {
        fssai: {
          compliant: batch.fssai_compliant || false,
          licenseNumber: batch.fssai_license || ''
        },
        apeda: {
          compliant: batch.apeda_compliant || false,
          registrationNumber: batch.apeda_registration || ''
        },
        euOrganic: {
          compliant: batch.eu_organic_compliant || false,
          certificateNumber: batch.eu_organic_cert || ''
        },
        usda: {
          compliant: batch.usda_compliant || false,
          certificateNumber: batch.usda_cert || ''
        }
      },
      attachments: (batch.attachments || []).map(att => ({
        type: att.file_type || 'document',
        description: att.file_name || 'Attachment',
        url: att.s3_url || ''
      }))
    }
  };

  return vcData;
};

export const getCredentialById = async (id) => {
  try {
    const credential = await Credential.findById(id);
    if (!credential) {
      throw new Error('Credential not found');
    }

    return credential;
  } catch (error) {
    console.error('[VC Service] Get credential failed:', error.message);
    throw error;
  }
};

export const getCredentialByBatchId = async (batchId) => {
  try {
    const credentials = await Credential.findByBatchId(batchId);
    return credentials;
  } catch (error) {
    console.error('[VC Service] Get credentials by batch failed:', error.message);
    throw error;
  }
};

export const revokeCredential = async (credentialId, revokedBy, reason) => {
  try {
    const credential = await Credential.findById(credentialId);
    if (!credential) {
      throw new Error('Credential not found');
    }

    if (credential.revoked) {
      throw new Error('Credential already revoked');
    }

    await injiService.revokeCredential(credentialId);

    const updatedCredential = await Credential.updateRevocationStatus(
      credentialId,
      revokedBy,
      reason
    );

    const batch = await Batch.findById(credential.batch_id);
    if (batch) {
      await Batch.update(batch.id, { status: 'revoked' });
    }

    return updatedCredential;
  } catch (error) {
    console.error('[VC Service] Revocation failed:', error.message);
    throw error;
  }
};

export const checkRevocationStatus = async (credentialId) => {
  try {
    const status = await Credential.checkRevocationStatus(credentialId);
    if (!status) {
      throw new Error('Credential not found');
    }

    const injiStatus = await injiService.checkRevocationStatus(credentialId);

    return {
      ...status,
      injiStatus
    };
  } catch (error) {
    console.error('[VC Service] Revocation check failed:', error.message);
    throw error;
  }
};

export const verifyCredential = async (vcData) => {
  try {
    const validation = injiService.validateCredential(vcData);
    if (!validation.valid) {
      return {
        valid: false,
        errors: validation.errors
      };
    }

    const signatureVerification = await injiService.verifySignature(vcData);
    
    if (!signatureVerification.valid) {
      return {
        valid: false,
        errors: ['Invalid signature']
      };
    }

    const expirationDate = new Date(vcData.expirationDate);
    const now = new Date();
    
    if (expirationDate < now) {
      return {
        valid: false,
        errors: ['Credential expired']
      };
    }

    if (vcData.credentialSubject?.batchId) {
      const credentials = await Credential.findByBatchId(vcData.credentialSubject.batchId);
      const matchingCredential = credentials.find(c => {
        const storedVC = typeof c.vc_json === 'string' ? JSON.parse(c.vc_json) : c.vc_json;
        return storedVC.proof?.jws === vcData.proof?.jws;
      });

      if (matchingCredential?.is_revoked) {
        return {
          valid: false,
          errors: ['Credential has been revoked']
        };
      }
    }

    return {
      valid: true,
      issuer: vcData.issuer,
      issuanceDate: vcData.issuanceDate,
      expirationDate: vcData.expirationDate,
      credentialSubject: vcData.credentialSubject
    };
  } catch (error) {
    console.error('[VC Service] Verification failed:', error.message);
    return {
      valid: false,
      errors: [error.message]
    };
  }
};

export const regenerateQRCode = async (credentialId) => {
  try {
    const credential = await Credential.findById(credentialId);
    if (!credential) {
      throw new Error('Credential not found');
    }

    const vcData = typeof credential.vc_json === 'string' 
      ? JSON.parse(credential.vc_json) 
      : credential.vc_json;

    const credentialUrl = `${process.env.BASE_URL || 'https://agriqcert.org'}/api/credentials/${credentialId}`;
    const qrResult = await qrcodeUtil.generateInjiCompatibleQR(credentialUrl, vcData);

    const updated = await Credential.updateQRCode(credentialId, qrResult.qrCode, qrResult.qrData);

    return {
      credential: updated,
      qrCode: qrResult.qrCode
    };
  } catch (error) {
    console.error('[VC Service] QR regeneration failed:', error.message);
    throw error;
  }
};

export default {
  issueCredential,
  constructVC,
  getCredentialById,
  getCredentialByBatchId,
  revokeCredential,
  checkRevocationStatus,
  verifyCredential,
  regenerateQRCode
};
