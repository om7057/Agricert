import crypto from 'crypto';
import env from '../config/env.js';

const INJI_CONFIG = {
  certifyUrl: env.INJI_CERTIFY_URL || 'https://api.inji.certify.io',
  verifyUrl: env.INJI_VERIFY_URL || 'https://api.inji.verify.io',
  walletUrl: env.INJI_WALLET_URL || 'https://api.inji.wallet.io',
  apiKey: env.INJI_API_KEY || 'placeholder-api-key',
  timeout: 30000
};

export const signCredential = async (vcData) => {
  try {
    console.log('[Inji Service] Signing credential (PLACEHOLDER MODE)');
    
    const signature = crypto
      .createHash('sha256')
      .update(JSON.stringify(vcData))
      .digest('hex');
    
    const signedVC = {
      ...vcData,
      proof: {
        type: 'RsaSignature2018',
        created: new Date().toISOString(),
        proofPurpose: 'assertionMethod',
        verificationMethod: 'did:web:agriqcert.org#key-1',
        jws: `placeholder-signature-${signature.substring(0, 32)}`
      }
    };
    
    return {
      success: true,
      signedCredential: signedVC,
      signature: signature,
      verificationMethod: 'did:web:agriqcert.org#key-1'
    };
  } catch (error) {
    console.error('[Inji Service] Signing failed:', error.message);
    throw new Error(`Credential signing failed: ${error.message}`);
  }
};

export const verifySignature = async (vcData) => {
  try {
    console.log('[Inji Service] Verifying signature (PLACEHOLDER MODE)');
    
    if (!vcData.proof || !vcData.proof.jws) {
      return {
        valid: false,
        error: 'No proof found in credential'
      };
    }
    
    const hasValidStructure = 
      vcData['@context'] &&
      vcData.type &&
      vcData.issuer &&
      vcData.credentialSubject &&
      vcData.proof;
    
    return {
      valid: hasValidStructure,
      issuer: vcData.issuer?.id,
      issuanceDate: vcData.issuanceDate,
      expirationDate: vcData.expirationDate,
      verified: true
    };
  } catch (error) {
    console.error('[Inji Service] Verification failed:', error.message);
    return {
      valid: false,
      error: error.message
    };
  }
};

export const publishToWallet = async (vcData, recipientDID) => {
  try {
    console.log('[Inji Service] Publishing to wallet (PLACEHOLDER MODE)');
    
    const walletId = `wallet-${crypto.randomBytes(8).toString('hex')}`;
    
    return {
      success: true,
      walletId,
      recipientDID,
      publishedAt: new Date().toISOString(),
      deepLink: `inji://credential/${walletId}`
    };
  } catch (error) {
    console.error('[Inji Service] Wallet publish failed:', error.message);
    throw new Error(`Failed to publish to wallet: ${error.message}`);
  }
};

export const revokeCredential = async (credentialId) => {
  try {
    console.log('[Inji Service] Revoking credential (PLACEHOLDER MODE)');
    
    return {
      success: true,
      credentialId,
      revokedAt: new Date().toISOString(),
      revocationListUrl: `${INJI_CONFIG.certifyUrl}/revocation/${credentialId}`
    };
  } catch (error) {
    console.error('[Inji Service] Revocation failed:', error.message);
    throw new Error(`Failed to revoke credential: ${error.message}`);
  }
};

export const checkRevocationStatus = async (credentialId) => {
  try {
    console.log('[Inji Service] Checking revocation status (PLACEHOLDER MODE)');
    
    return {
      credentialId,
      revoked: false,
      checkedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Inji Service] Revocation check failed:', error.message);
    throw new Error(`Failed to check revocation: ${error.message}`);
  }
};

export const generateDID = (entityType, entityId) => {
  const sanitizedId = entityId.toString().replace(/[^a-zA-Z0-9-]/g, '-');
  return `did:web:agriqcert.org:${entityType}:${sanitizedId}`;
};

export const validateCredential = (vcData) => {
  const requiredFields = [
    '@context',
    'type',
    'issuer',
    'issuanceDate',
    'credentialSubject'
  ];
  
  const missingFields = requiredFields.filter(field => !vcData[field]);
  
  if (missingFields.length > 0) {
    return {
      valid: false,
      errors: missingFields.map(f => `Missing required field: ${f}`)
    };
  }
  
  if (!Array.isArray(vcData.type) || !vcData.type.includes('VerifiableCredential')) {
    return {
      valid: false,
      errors: ['Credential type must include VerifiableCredential']
    };
  }
  
  return {
    valid: true,
    errors: []
  };
};

export default {
  signCredential,
  verifySignature,
  publishToWallet,
  revokeCredential,
  checkRevocationStatus,
  generateDID,
  validateCredential
};
