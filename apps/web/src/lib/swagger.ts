import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BeTheHero API',
      version: '1.0.0',
      description:
        'REST API for responsible pet adoption — workspaces, pets, interests, adoptions, and follow-ups.',
      contact: {
        name: 'BeTheHero',
      },
    },
    servers: [{ url: '/' }],
    tags: [
      {
        name: 'Auth',
        description:
          'Authentication — register, login, logout, password reset, email verification',
      },
      { name: 'Me', description: 'Authenticated user — profile and password' },
      { name: 'Workspaces', description: 'Partner organizations / shelters' },
      { name: 'Pets', description: 'Pet registration and listing' },
      {
        name: 'Admin',
        description: 'Pet approval/rejection (ADMIN / SUPER_ADMIN)',
      },
      { name: 'Adoptions', description: 'Adoption registration and details' },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'bth_access',
          description:
            'JWT stored in the bth_access cookie. Obtain it via POST /api/auth/login.',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            code: { type: 'string' },
            details: { type: 'array', items: { type: 'object' } },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Unauthenticated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { message: 'Unauthenticated' },
            },
          },
        },
        ForbiddenError: {
          description: 'Forbidden — insufficient permissions',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { message: 'Forbidden', code: 'FORBIDDEN' },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { message: 'Not found', code: 'NOT_FOUND' },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                message: 'Invalid payload',
                details: [{ path: ['email'], message: 'Invalid email' }],
              },
            },
          },
        },
      },
    },
    security: [{ cookieAuth: [] }],
  },
  apis: ['./src/lib/swagger/definitions/**/*.ts'],
}

export const swaggerSpec = swaggerJsdoc(options)
