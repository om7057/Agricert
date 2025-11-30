import swaggerJsdoc from 'swagger-jsdoc';
import env from './env.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AgriQCert API Documentation',
      version: '1.0.0',
      description: 'API documentation for AgriQCert - Agricultural Product Quality Certification System',
      contact: {
        name: 'AgriQCert Team',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error',
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            email: {
              type: 'string',
              example: 'user@example.com',
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
            role: {
              type: 'string',
              enum: ['exporter', 'qa_agency', 'admin'],
              example: 'exporter',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Batch: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
            },
            batch_number: {
              type: 'string',
            },
            exporter_id: {
              type: 'integer',
            },
            product_type: {
              type: 'string',
            },
            product_name: {
              type: 'string',
            },
            quantity: {
              type: 'number',
            },
            unit: {
              type: 'string',
            },
            origin_location: {
              type: 'string',
            },
            destination_country: {
              type: 'string',
            },
            packaging_type: {
              type: 'string',
            },
            storage_conditions: {
              type: 'string',
            },
            status: {
              type: 'string',
              enum: ['submitted', 'under_inspection', 'certified', 'rejected', 'deleted'],
            },
            assigned_qa_id: {
              type: 'integer',
              nullable: true,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Inspection: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
            },
            batch_id: {
              type: 'integer',
            },
            qa_agency_id: {
              type: 'integer',
            },
            inspection_date: {
              type: 'string',
              format: 'date-time',
            },
            moisture_level: {
              type: 'number',
              nullable: true,
            },
            pesticide_content: {
              type: 'number',
              nullable: true,
            },
            aflatoxin_level: {
              type: 'number',
              nullable: true,
            },
            grain_quality_score: {
              type: 'number',
              nullable: true,
            },
            is_organic: {
              type: 'boolean',
              nullable: true,
            },
            is_gmo_free: {
              type: 'boolean',
              nullable: true,
            },
            meets_iso_22000: {
              type: 'boolean',
              nullable: true,
            },
            inspector_name: {
              type: 'string',
              nullable: true,
            },
            inspector_license: {
              type: 'string',
              nullable: true,
            },
            remarks: {
              type: 'string',
              nullable: true,
            },
            inspection_result: {
              type: 'string',
              enum: ['passed', 'failed', 'conditional'],
              nullable: true,
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization',
      },
      {
        name: 'Batches',
        description: 'Batch management operations',
      },
      {
        name: 'Inspections',
        description: 'Quality inspection operations',
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/docs/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
