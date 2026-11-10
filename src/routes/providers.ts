import { FastifyInstance } from 'fastify';
import { 
    getAllProviders, 
    getProviderById, 
    createProvider, 
    updateProvider, 
    deleteProvider 
} from '../controllers/providerController';

export default async function providerRoutes(app: FastifyInstance) {
    
    const providerResponseSchema = {
        type: 'object',
        properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            contact: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
        },
        example: {
            id: 1,
            name: 'Acme Corp',
            contact: 'john@acme.com',
            createdAt: '2026-09-13T12:00:00Z',
            updatedAt: '2026-09-13T12:00:00Z'
        }
    };


    app.get('/providers', {
        schema: {
            description: 'Get all providers',
            tags: ['Providers'],
            response: {
                200: {
                    type: 'array',
                    items: providerResponseSchema
                }
            }
        }
    }, getAllProviders);

    app.get('/providers/:id', {
        schema: {
            description: 'Get a specific provider by ID',
            tags: ['Providers'],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'integer', description: 'The numeric ID of the provider' }
                }
            },
            response: {
                200: providerResponseSchema,
                404: { type: 'object', properties: { message: { type: 'string' } } }
            }
        }
    }, getProviderById);

    app.post('/providers', {
        schema: {
            description: 'Create a new provider',
            tags: ['Providers'],
            body: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: { type: 'string', minLength: 1 },
                    contact: { type: 'string', minLength: 1 }
                },
                example: {
                    name: 'Global Supplies',
                    contact: '+123456789'
                }    
            },
            response: {
                201: providerResponseSchema
            }
        }
    }, createProvider);

    app.put('/providers/:id', {
        schema: {
            description: 'Update an existing provider by ID',
            tags: ['Providers'],
            params: {
                type: 'object',
                required: ['id'],
                properties: { id: { type: 'integer' } }
            },
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string', minLength: 1 },
                    contact: { type: 'string', minLength: 1 }
                }
            },
            response: {
                200: providerResponseSchema
            }
        }
    }, updateProvider);

    app.delete('/providers/:id', {
        schema: {
            description: 'Delete a provider by ID',
            tags: ['Providers'],
            params: {
                type: 'object',
                required: ['id'],
                properties: { id: { type: 'integer' } }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' }
                    }
                }
            }
        }
    }, deleteProvider);
}
