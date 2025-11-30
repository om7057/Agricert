/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication and authorization
 *   - name: Batches
 *     description: Batch management operations
 *   - name: Inspections
 *     description: Quality inspection operations
 *   - name: Credentials
 *     description: Verifiable Credential operations
 *   - name: Verification
 *     description: Credential verification operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     VerifiableCredential:
 *       type: object
 *       properties:
 *         '@context':
 *           type: array
 *           items:
 *             type: string
 *         type:
 *           type: array
 *           items:
 *             type: string
 *         issuer:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: did:web:agriqcert.org
 *             name:
 *               type: string
 *             type:
 *               type: string
 *         issuanceDate:
 *           type: string
 *           format: date-time
 *         expirationDate:
 *           type: string
 *           format: date-time
 *         credentialSubject:
 *           type: object
 *           properties:
 *             batchId:
 *               type: string
 *             productName:
 *               type: string
 *             productType:
 *               type: string
 *             origin:
 *               type: object
 *             qualityParameters:
 *               type: object
 *             inspection:
 *               type: object
 *             certifications:
 *               type: array
 *         proof:
 *           type: object
 *     QRCodeResponse:
 *       type: object
 *       properties:
 *         qrCode:
 *           type: string
 *           description: Base64 encoded QR code image
 *         qrData:
 *           type: string
 *           description: JSON string embedded in QR code
 *         checksum:
 *           type: string
 *           description: SHA-256 checksum for verification
 *         format:
 *           type: string
 *           example: image/png
 */

/**
 * @swagger
 * /api/batches:
 *   post:
 *     summary: Create a new batch
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productType
 *               - productName
 *               - quantity
 *               - unit
 *               - originLocation
 *               - destinationCountry
 *             properties:
 *               productType:
 *                 type: string
 *                 example: Grain
 *               productName:
 *                 type: string
 *                 example: Basmati Rice
 *               quantity:
 *                 type: number
 *                 example: 1000
 *               unit:
 *                 type: string
 *                 example: kg
 *               originLocation:
 *                 type: string
 *                 example: Punjab, India
 *               destinationCountry:
 *                 type: string
 *                 example: USA
 *               packagingType:
 *                 type: string
 *                 example: Jute bags
 *               storageConditions:
 *                 type: string
 *                 example: Cool and dry
 *     responses:
 *       201:
 *         description: Batch created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *   get:
 *     summary: Get all batches (role-based filtering)
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [submitted, under_inspection, certified, rejected]
 *       - in: query
 *         name: productType
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Batches retrieved successfully
 *       401:
 *         description: Unauthorized
 *
 * /api/batches/{id}:
 *   get:
 *     summary: Get batch by ID
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Batch retrieved successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Batch not found
 *   put:
 *     summary: Update batch
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *               unit:
 *                 type: string
 *               packaging_type:
 *                 type: string
 *               storage_conditions:
 *                 type: string
 *               destination_country:
 *                 type: string
 *     responses:
 *       200:
 *         description: Batch updated successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Access denied
 *       404:
 *         description: Batch not found
 *   delete:
 *     summary: Delete batch
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Batch deleted successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Batch not found
 *
 * /api/batches/{id}/attachments:
 *   post:
 *     summary: Upload attachments to batch
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Files uploaded successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Access denied
 *
 * /api/batches/{id}/assign-qa:
 *   post:
 *     summary: Assign QA agency to batch (Admin only)
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qaAgencyId
 *             properties:
 *               qaAgencyId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: QA Agency assigned successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Access denied
 *
 * /api/inspections/pending:
 *   get:
 *     summary: Get pending inspections for QA agency
 *     tags: [Inspections]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending inspections retrieved successfully
 *       401:
 *         description: Unauthorized
 *
 * /api/inspections:
 *   post:
 *     summary: Start new inspection
 *     tags: [Inspections]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - batchId
 *             properties:
 *               batchId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Inspection started successfully
 *       400:
 *         description: Bad request
 *
 * /api/inspections/{id}:
 *   get:
 *     summary: Get inspection by ID
 *     tags: [Inspections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Inspection retrieved successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Inspection not found
 *   put:
 *     summary: Update inspection parameters
 *     tags: [Inspections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               moisture_level:
 *                 type: number
 *                 example: 12.5
 *               pesticide_content:
 *                 type: number
 *                 example: 0.005
 *               aflatoxin_level:
 *                 type: number
 *                 example: 8.0
 *               grain_quality_score:
 *                 type: number
 *                 example: 95
 *               is_organic:
 *                 type: boolean
 *                 example: false
 *               is_gmo_free:
 *                 type: boolean
 *                 example: true
 *               meets_iso_22000:
 *                 type: boolean
 *                 example: true
 *               inspector_name:
 *                 type: string
 *                 example: Dr. John Smith
 *               inspector_license:
 *                 type: string
 *                 example: QA-12345
 *               lab_name:
 *                 type: string
 *                 example: AgriTest Labs
 *               remarks:
 *                 type: string
 *                 example: Excellent quality
 *     responses:
 *       200:
 *         description: Inspection updated successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Access denied
 *
 * /api/inspections/{id}/submit:
 *   post:
 *     summary: Submit inspection result
 *     tags: [Inspections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - result
 *             properties:
 *               result:
 *                 type: string
 *                 enum: [passed, failed, conditional]
 *                 example: passed
 *     responses:
 *       200:
 *         description: Inspection result submitted successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Access denied
 *
 * /api/inspections/batch/{batchId}:
 *   get:
 *     summary: Get inspection by batch ID
 *     tags: [Inspections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: batchId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Inspection retrieved successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Not found
 *
 * /api/credentials/issue:
 *   post:
 *     summary: Issue a Verifiable Credential
 *     tags: [Credentials]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - batchId
 *               - inspectionId
 *             properties:
 *               batchId:
 *                 type: integer
 *                 example: 1
 *               inspectionId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Credential issued successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 credential:
 *                   type: object
 *                 qrCode:
 *                   type: string
 *                 credentialUrl:
 *                   type: string
 *       400:
 *         description: Bad request
 *
 * /api/credentials/{id}:
 *   get:
 *     summary: Get credential by ID
 *     tags: [Credentials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Credential retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerifiableCredential'
 *       404:
 *         description: Credential not found
 *
 * /api/credentials/{id}/qr:
 *   get:
 *     summary: Get QR code image for credential
 *     tags: [Credentials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: QR code image
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: QR code not found
 *
 * /api/credentials/{id}/revoke:
 *   post:
 *     summary: Revoke a credential
 *     tags: [Credentials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Failed re-inspection
 *     responses:
 *       200:
 *         description: Credential revoked successfully
 *       400:
 *         description: Bad request
 *
 * /api/credentials/batch/{batchId}:
 *   get:
 *     summary: Get credentials for a batch
 *     tags: [Credentials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: batchId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Credentials retrieved successfully
 *       404:
 *         description: Not found
 *
 * /api/credentials/verify:
 *   post:
 *     summary: Verify a Verifiable Credential
 *     tags: [Credentials]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vcData
 *             properties:
 *               vcData:
 *                 $ref: '#/components/schemas/VerifiableCredential'
 *     responses:
 *       200:
 *         description: Verification result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                 issuer:
 *                   type: object
 *                 issuanceDate:
 *                   type: string
 *                 expirationDate:
 *                   type: string
 */
