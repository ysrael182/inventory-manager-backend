import { FastifyInstance } from 'fastify';
import { 
    getAllPurchases, 
    getPurchaseById, 
    createPurchase, 
    updatePurchase, 
    deletePurchase 
} from '../controllers/purchaseController';

export default async function purchaseRoutes(app: FastifyInstance) {
    

    const purchasedProductSchema = {
        type: 'object',
        properties: {
            id: { type: 'integer'},
            price: { type: 'number' },
            qty: { type: 'integer' },
            purchaseId: { type: 'integer' },
            productId: { type: 'integer' },
            product: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    name: { type: 'string' },
                    unit: {
                        type: 'object',
                        properties: {
                            id: { type: 'integer' },
                            name: { type: 'string' },
                            abbreviation: { type: 'string', nullable: true }
                        }
                    },
                    providers: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: { type: 'integer' },
                                name: { type: 'string' },
                                contact: { type: 'string', nullable: true }
                            }
                        }
                    }
                }
            },
            provider: {
                type: 'object',
                nullable: true,
                properties: {
                    id: { type: 'integer' },
                    name: { type: 'string' },
                    contact: { type: 'string', nullable: true }
                }
            }
        },
        example: {
            id: 1,
            price: 29.99,
            qty: 5,
            purchaseId: 1,
            productId: 10,
            product: {
                id: 10,
                name: 'Example product',
                unit: {
                    id: 1,
                    name: 'piece',
                    abbreviation: 'pc'
                },
                providers: [
                    {
                        id: 2,
                        name: 'Example provider',
                        contact: 'provider@example.com'
                    }
                }
            },
            provider: {
                id: 2,
                name: 'Example provider',
                contact: 'provider@example.com'
            }
        }
    };

    const purchaseResponseSchema = {
        type: 'object',
        properties: {
            id: { type: 'integer' },
            note: { type: 'string', nullable: true },
            purchaseDate: { type: 'string', format: 'date', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            items: {
                type: 'array',
                items: purchasedProductSchema
            }
        },example: {
            id: 1,
            note: 'First stock order',
            purchaseDate: '2026-09-13',
            createdAt: '2026-09-13T12:00:00Z',
            updatedAt: '2026-09-13T12:00:00Z',
            items: [
                {
                    id: 1,
                    price: 29.99,
                    qty: 5,
                    purchaseId: 1,
                    productId: 10,
                    product: {
                        id: 10,
                        name: 'Example product',
                        unit: {
                            id: 1,
                            name: 'piece',
                            abbreviation: 'pc'
                        },
                        providers: [
                            {
                                id: 2,
                                name: 'Example provider',
                                contact: 'provider@example.com'
                            }
                        }
                    },
                    provider: {
                        id: 2,
                        name: 'Example provider',
                        contact: 'provider@example.com'
                    }
                }
            ]
        }   
    };

    app.get('/purchases', {
        schema: {
            description: 'Get all purchases with items',
            tags: ['Purchases'],
            response: {
                200: {
                    type: 'array',
                    items: purchaseResponseSchema
                }
            }
        }
    }, getAllPurchases);

    app.get('/purchases/:id', {
        schema: {
            description: 'Get a specific purchase by ID',
            tags: ['Purchases'],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'integer', description: 'The numeric ID of the purchase' }
                }
            },
            response: {
                200: purchaseResponseSchema,
                404: { type: 'object', properties: { message: { type: 'string' } } }
            }
        }
    }, getPurchaseById);

    app.post('/purchases', {
        schema: {
            description: 'Create a new purchase order with nested product items and their providers',
            tags: ['Purchases'],
            body: {
                type: 'object',
                // Corregido: 'providerId' ya no es requerido a nivel global de la compra
                required: ['items'], 
                properties: {
                    note: { type: 'string', example: 'Bulk purchase' },
                    purchaseDate: {
                        type: 'string',
                        format: 'date',
                        description: 'Day the purchase was made (YYYY-MM-DD); defaults to today'
                    },
                    items: {
                        type: 'array',
                        minItems: 1,
                        items: {
                            type: 'object',
                            required: ['productId', 'price', 'qty', 'providerId'],
                            properties: {
                                productId: { type: 'integer' },
                                price: { type: 'number', minimum: 0.01 },
                                qty: { type: 'integer', minimum: 1 },
                                providerId: { type: 'integer', example: 2 }
                            },
                            example: {
                                productId: 10,
                                price: 15.50,
                                qty: 10,
                                providerId: 2
                            }
                        }
                    }
                }
            },
            response: {
                201: purchaseResponseSchema
            }
        }
    }, createPurchase);


    app.put('/purchases/:id', {
        schema: {
            description: 'Update purchase date, note, and its items',
            tags: ['Purchases'],
            params: {
                type: 'object',
                required: ['id'],
                properties: { id: { type: 'integer' } }
            },
            body: {
                type: 'object',
                properties: {
                    note: { type: 'string' },
                    purchaseDate: {
                        type: 'string',
                        format: 'date',
                        nullable: true,
                        description: 'Day the purchase was made (YYYY-MM-DD); null clears the date'
                    },
                    items: {
                        type: 'array',
                        description: 'List of items belonging to this purchase',
                        items: {
                            type: 'object',
                            required: ['productId', 'price', 'qty'],
                            properties: {
                                productId: { type: 'integer' },
                                price: { type: 'number' },
                                qty: { type: 'integer' },
                                providerId: { type: 'integer' }
                            }
                        }
                    }
                }
            },
            response: {
                200: purchaseResponseSchema
            }
        }
    }, updatePurchase);


    app.delete('/purchases/:id', {
        schema: {
            description: 'Delete purchase records along with items cascadingly',
            tags: ['Purchases'],
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
    }, deletePurchase);
}
