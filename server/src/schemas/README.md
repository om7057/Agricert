# Digital Product Passport Schema

## Overview

W3C-compliant Verifiable Credential schema for agricultural quality certification.

## Schema Structure

### Core Components

- **@context**: W3C credentials context + custom agricultural vocabulary
- **type**: VerifiableCredential + AgriQualityCertificate
- **issuer**: DID-based issuer identification
- **credentialSubject**: Agricultural product data

### Agricultural-Specific Fields

#### Product Information

- `batchId`: Unique batch identifier
- `productName`: Specific product (e.g., "Basmati Rice")
- `productType`: Category (Grain, Tea, Spice, etc.)
- `origin`: Geographic details with coordinates
- `quantity`: Value and unit
- `harvestDate`: Harvest timestamp

#### Quality Parameters

All parameters include:

- `value`: Measured value
- `unit`: Measurement unit
- `limit`: Regulatory limit
- `status`: pass/fail/warning

Parameters tracked:

1. **moistureContent**: Critical for storage
2. **aflatoxinLevel**: Food safety (ppb)
3. **pesticideResidue**: Chemical safety (mg/kg)
4. **foreignMatter**: Contamination percentage
5. **brokenGrains**: Quality grading

#### Inspection Details

- `inspectionId`: Unique inspection reference
- `inspectionDate`: When inspection occurred
- `inspector`: QA agency details with license
- `result`: pass/fail/conditional
- `grade`: Quality grade (A, B, C, etc.)
- `remarks`: Inspector notes

#### Compliance Standards

Support for multiple international standards:

- **FSSAI**: Indian food safety
- **APEDA**: Agricultural export
- **EU Organic**: European organic certification
- **USDA**: US Department of Agriculture

#### Supply Chain Tracking

- `stages`: Array of supply chain events
- `transportConditions`: Temperature, humidity, packaging
- Each stage includes: location, timestamp, handler

#### Attachments

Support for linked documents:

- Lab reports
- Certification documents
- Inspection photos
- Transport documents

### Real-World Examples

#### Basmati Rice (Punjab)

```json
{
  "productName": "1121 Basmati Rice",
  "productType": "Grain",
  "origin": {
    "country": "India",
    "state": "Punjab",
    "district": "Amritsar"
  },
  "qualityParameters": {
    "moistureContent": { "value": 12.5, "limit": 14, "status": "pass" },
    "brokenGrains": { "value": 2.5, "limit": 5, "status": "pass" }
  }
}
```

#### Darjeeling Tea

```json
{
  "productName": "Darjeeling First Flush",
  "productType": "Tea",
  "origin": {
    "country": "India",
    "state": "West Bengal",
    "district": "Darjeeling"
  },
  "certifications": [
    {
      "type": "Geographical Indication",
      "certificationBody": "Tea Board of India"
    }
  ]
}
```

#### Alphonso Mango

```json
{
  "productName": "Alphonso Mango",
  "productType": "Fruit",
  "origin": {
    "country": "India",
    "state": "Maharashtra",
    "district": "Ratnagiri"
  },
  "qualityParameters": {
    "pesticideResidue": { "value": 0.05, "limit": 0.5, "status": "pass" }
  }
}
```

## Usage with QR Codes

### Standard QR

Embeds full VC data in QR code for offline verification.

### Inji-Compatible QR

Follows Inji Certify/Verify format:

```json
{
  "ver": "1.0",
  "type": "VC",
  "url": "https://agriqcert.org/vc/{id}",
  "format": "jwt",
  "data": {
    /* VC data */
  }
}
```

### Verification QR

Lightweight QR for quick verification:

```json
{
  "type": "verify",
  "credentialId": "VC-123",
  "verificationUrl": "https://agriqcert.org/verify/{id}"
}
```

## Integration Notes

### For Exporters

- All fields must be populated during batch creation
- Origin coordinates improve traceability
- Multiple certifications can be attached

### For QA Agencies

- Quality parameters auto-populate from inspection
- Status calculation is automatic (pass if value < limit)
- Remarks field supports detailed observations

### For Importers/Customs

- QR scan reveals full product history
- Compliance status immediately visible
- Attached documents accessible via signed URLs

## Standards Compliance

- **W3C VC Data Model 1.1**: Full compliance
- **JSON-LD**: Proper context definitions
- **DID**: Decentralized identifier support
- **JWT**: Proof format compatibility

## Security Features

1. **Checksum**: SHA-256 hash for data integrity
2. **Timestamp**: Issuance and expiration dates
3. **Proof**: Cryptographic signature
4. **Revocation**: Status list support (planned)

## Future Enhancements

- [ ] Biometric authentication integration
- [ ] IoT sensor data integration
- [ ] Blockchain anchoring
- [ ] Multi-signature support
- [ ] Credential revocation registry
