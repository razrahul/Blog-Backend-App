import swaggerAutogen from 'swagger-autogen';
import logger from './logger/winston.logger.js';

const doc = {
  info: {
    version: '1.0.0',
    title: 'Blog-Backend App API',
    description: 'API documentation for My Blog Application',
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1', // Update this for production
      description: 'Development Server',
    },
  ],
  tags: [
    {
      name: 'Users',
      description: 'Endpoints related to user management',
    },
    {
      name: 'Books',
      description: 'Endpoints for book operations',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      apiKeyAuth: {
        type: 'apiKey',
        in: 'header', // Can be "header", "query", or "cookie"
        name: 'X-API-KEY', // Name of the API key header
        description: 'API key authentication',
      },
    },
  },
  security: [{ BearerAuth: [] }], // Apply Bearer authentication globally
  definitions: {
    Parents: {
      type: 'object',
      properties: {
        father: { type: 'string', example: 'Simon Doe' },
        mother: { type: 'string', example: 'Marie Doe' },
      },
    },
    User: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'John Doe' },
        age: { type: 'integer', example: 29 },
        parents: { $ref: '#/definitions/Parents' },
        diplomas: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              school: { type: 'string', example: 'XYZ University' },
              year: { type: 'integer', example: 2020 },
              completed: { type: 'boolean', example: true },
              internship: {
                type: 'object',
                properties: {
                  hours: { type: 'integer', example: 290 },
                  location: { type: 'string', example: 'XYZ Company' },
                },
              },
            },
          },
        },
      },
    },
    AddUser: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'John Doe' },
        age: { type: 'integer', example: 29 },
        about: { type: 'string', example: 'Software Developer' },
      },
    },
  },
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./routes/userRoutes.js', './routes/roleRoutes.js'];

// ✅ Generate Swagger documentation
swaggerAutogen({ openapi: '3.0.0' })(outputFile, endpointsFiles, doc).then(() => {
  logger.info('✅ Swagger documentation generated successfully!');
  import('./server.js'); // Auto-start server after documentation generation
});
