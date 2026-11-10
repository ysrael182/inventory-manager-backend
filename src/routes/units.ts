import { FastifyInstance } from 'fastify';
import { 
    getAllUnits, 
    getUnitById, 
    createUnit, 
    updateUnit, 
    deleteUnit 
} from '../controllers/unitController';

export default async function unitRoutes(app: FastifyInstance) {
    
    const unitResponseSchema = {
        type: 'object',
        properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            abbreviation: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
        },
        example: {
            id: 1,
            name: 'meter',
            abbreviation: 'm',
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z'
        }
    };

    app.get('/units', {
        schema: {
            description: 'Get all measurement units',
            tags: ['Units'],
            response: {
                200: {
                    type: 'array',
                    items: unitResponseSchema
                }
            }
        }
    }, getAllUnits);

    app.get('/units/:id', {
        schema: {
            description: 'Get a specific unit by ID',
            tags: ['Units'],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'integer', description: 'The numeric ID of the unit' }
                }
            },
            response: {
                200: unitResponseSchema,
                404: { type: 'object', properties: { message: { type: 'string' } } }
            }
        }
    }, getUnitById);

    app.post('/units', {
        schema: {
            description: 'Create a new unit',
            tags: ['Units'],
            body: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: { type: 'string', minLength: 1 },
                    abbreviation: { type: 'string', minLength: 1 }
                },
                example: {
                    name: 'liter',
                    abbreviation: 'L'
                }
            },
            response: {
                201: unitResponseSchema
            }
        }
    }, createUnit);

    app.put('/units/:id', {
        schema: {
            description: 'Update an existing unit by ID',
            tags: ['Units'],
            params: {
                type: 'object',
                required: ['id'],
                properties: { id: { type: 'integer' } }
            },
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string', minLength: 1 },
                    abbreviation: { type: 'string', minLength: 1 }
                }
            },
            response: {
                200: unitResponseSchema
            }
        }
    }, updateUnit);

    app.delete('/units/:id', {
        schema: {
            description: 'Delete a unit by ID',
            tags: ['Units'],
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
    }, deleteUnit);
}
