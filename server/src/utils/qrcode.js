import QRCode from 'qrcode';
import crypto from 'crypto';

export const generateQR = async (vcData) => {
  try {
    const qrData = {
      format: 'vc',
      credential: vcData,
      timestamp: new Date().toISOString(),
      checksum: generateChecksum(vcData)
    };

    const qrString = JSON.stringify(qrData);

    const qrOptions = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 512,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    };

    const qrBase64 = await QRCode.toDataURL(qrString, qrOptions);
    
    return {
      qrCode: qrBase64,
      qrData: qrString,
      checksum: qrData.checksum,
      format: 'image/png'
    };
  } catch (error) {
    throw new Error(`QR generation failed: ${error.message}`);
  }
};

export const generateQRBuffer = async (vcData) => {
  try {
    const qrData = {
      format: 'vc',
      credential: vcData,
      timestamp: new Date().toISOString(),
      checksum: generateChecksum(vcData)
    };

    const qrString = JSON.stringify(qrData);

    const qrOptions = {
      errorCorrectionLevel: 'H',
      type: 'png',
      quality: 0.95,
      margin: 1,
      width: 512
    };

    const buffer = await QRCode.toBuffer(qrString, qrOptions);
    
    return {
      buffer,
      qrData: qrString,
      checksum: qrData.checksum
    };
  } catch (error) {
    throw new Error(`QR buffer generation failed: ${error.message}`);
  }
};

export const generateInjiCompatibleQR = async (vcUrl, vcData) => {
  try {
    const injiPayload = {
      ver: '1.0',
      type: 'VC',
      url: vcUrl,
      format: 'jwt',
      data: {
        credential: vcData,
        issuanceDate: vcData.issuanceDate,
        expirationDate: vcData.expirationDate
      }
    };

    const qrString = JSON.stringify(injiPayload);

    const qrOptions = {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 2,
      width: 400
    };

    const qrBase64 = await QRCode.toDataURL(qrString, qrOptions);
    
    return {
      qrCode: qrBase64,
      qrData: qrString,
      url: vcUrl,
      format: 'inji-compatible'
    };
  } catch (error) {
    throw new Error(`Inji QR generation failed: ${error.message}`);
  }
};

export const generateVerificationQR = async (credentialId, verificationUrl) => {
  try {
    const verifyPayload = {
      type: 'verify',
      credentialId,
      verificationUrl,
      timestamp: new Date().toISOString()
    };

    const qrString = JSON.stringify(verifyPayload);

    const qrOptions = {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 2,
      width: 300
    };

    const qrBase64 = await QRCode.toDataURL(qrString, qrOptions);
    
    return {
      qrCode: qrBase64,
      qrData: qrString,
      verificationUrl,
      credentialId
    };
  } catch (error) {
    throw new Error(`Verification QR generation failed: ${error.message}`);
  }
};

export const generateChecksum = (data) => {
  const dataString = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto
    .createHash('sha256')
    .update(dataString)
    .digest('hex');
};

export const verifyQRChecksum = (qrData, providedChecksum) => {
  const calculatedChecksum = generateChecksum(qrData);
  return calculatedChecksum === providedChecksum;
};

export const generateQRWithMetadata = async (vcData, metadata = {}) => {
  try {
    const qrPayload = {
      format: 'vc',
      credential: vcData,
      metadata: {
        batchId: metadata.batchId,
        productType: metadata.productType,
        origin: metadata.origin,
        ...metadata
      },
      timestamp: new Date().toISOString(),
      checksum: generateChecksum(vcData)
    };

    const qrString = JSON.stringify(qrPayload);

    const qrOptions = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 512
    };

    const qrBase64 = await QRCode.toDataURL(qrString, qrOptions);
    
    return {
      qrCode: qrBase64,
      qrData: qrString,
      metadata: qrPayload.metadata,
      checksum: qrPayload.checksum
    };
  } catch (error) {
    throw new Error(`QR with metadata generation failed: ${error.message}`);
  }
};

export const generateMultiFormatQR = async (vcData, formats = ['png', 'svg']) => {
  try {
    const qrData = {
      format: 'vc',
      credential: vcData,
      timestamp: new Date().toISOString(),
      checksum: generateChecksum(vcData)
    };

    const qrString = JSON.stringify(qrData);
    const results = {};

    const baseOptions = {
      errorCorrectionLevel: 'H',
      quality: 0.95,
      margin: 1,
      width: 512
    };

    for (const format of formats) {
      if (format === 'png') {
        const qrBase64 = await QRCode.toDataURL(qrString, {
          ...baseOptions,
          type: 'image/png'
        });
        results.png = qrBase64;
      } else if (format === 'svg') {
        const qrSvg = await QRCode.toString(qrString, {
          ...baseOptions,
          type: 'svg'
        });
        results.svg = qrSvg;
      } else if (format === 'terminal') {
        const qrTerminal = await QRCode.toString(qrString, {
          type: 'terminal'
        });
        results.terminal = qrTerminal;
      }
    }

    return {
      formats: results,
      qrData: qrString,
      checksum: qrData.checksum
    };
  } catch (error) {
    throw new Error(`Multi-format QR generation failed: ${error.message}`);
  }
};
