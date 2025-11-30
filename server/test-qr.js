import { generateQR, generateInjiCompatibleQR, generateChecksum } from './src/utils/qrcode.js';

const testVC = {
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://www.w3.org/2018/credentials/examples/v1"
  ],
  "type": ["VerifiableCredential", "AgriQualityCertificate"],
  "issuer": {
    "id": "did:web:agriqcert.org",
    "name": "AgriQCert Quality Assurance"
  },
  "issuanceDate": "2025-11-30T10:00:00Z",
  "expirationDate": "2026-11-30T10:00:00Z",
  "credentialSubject": {
    "batchId": "BATCH-2025-001",
    "productName": "Basmati Rice",
    "productType": "Grain",
    "origin": {
      "country": "India",
      "state": "Punjab",
      "district": "Amritsar"
    },
    "qualityParameters": {
      "moistureContent": {
        "value": 12.5,
        "unit": "%",
        "limit": 14,
        "status": "pass"
      }
    }
  }
};

async function test() {
  try {
    console.log('Testing QR Code Generation...\n');
    
    // Test 1: Standard QR
    console.log('1. Generating standard QR code...');
    const standardQR = await generateQR(testVC);
    console.log('✓ Standard QR generated');
    console.log(`   Checksum: ${standardQR.checksum}`);
    console.log(`   Data length: ${standardQR.qrData.length} bytes\n`);
    
    // Test 2: Inji-compatible QR
    console.log('2. Generating Inji-compatible QR code...');
    const injiQR = await generateInjiCompatibleQR('https://agriqcert.org/vc/123', testVC);
    console.log('✓ Inji QR generated');
    console.log(`   URL: ${injiQR.url}`);
    console.log(`   Format: ${injiQR.format}\n`);
    
    // Test 3: Checksum verification
    console.log('3. Testing checksum...');
    const checksum = generateChecksum(testVC);
    console.log('✓ Checksum generated');
    console.log(`   Value: ${checksum}\n`);
    
    console.log('All tests passed! ✓');
    
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

test();
