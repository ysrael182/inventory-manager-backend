// src/routes/products.ts
import { FastifyInstance } from 'fastify';
import { FastifyRequest, FastifyReply } from 'fastify';
import * as controller from '../controllers/productsController';

export default async function productRoutes(app: FastifyInstance) {

  app.get('/products', 
    {
      schema: {
        description: 'Get a paginated list of products with their units, attributes, and providers',
        tags: ['Products'],
        summary: 'Search products',
        querystring: {
          type: 'object',
          properties: {
            query: { 
              type: 'string', 
              description: 'Search term to filter products' 
            },
            page: { 
              type: 'integer', 
              minimum: 1, 
              default: 1, 
              description: 'Page number' 
            },
            pageSize: { 
              type: 'integer', 
              minimum: 1, 
              maximum: 100, 
              default: 10, 
              description: 'Number of items per page' 
            }
          }
        },
        response: {
          200: {
            description: 'Product list successfully retrieved',
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: { $ref: 'Product#' }
              },
              page: { type: 'integer' },
              pageSize: { type: 'integer' }, 
              totalPages: { type: 'integer' },
              totalItems: { type: 'integer' }
            }
          }
        }
      }
    }, 
    async (request: FastifyRequest, reply: FastifyReply) => controller.getProducts(request, reply)
  );

  app.post('/products', 
    {
      schema: {
        summary: 'Create a new product',
        description: 'Creates a product along with its required pricing, quantity, unitId, and optional relations including providers.',
        tags: ['Products'],
        body: {
                  type: 'object',
                  required: ['name', 'identifier', 'price', 'qty', 'unitId'],
                  properties: {
                    name: { type: 'string' },
                    identifier: { type: 'string' },
                    description: { type: 'string', nullable: true },
                    price: { type: 'number', minimum: 0 },
                    qty: { type: 'integer' },
                    unitId: { type: 'integer', description: 'Foreign key to the Unit table' },
                    attributes: { 
                      type: 'array', 
                      items: { $ref: 'ProductAttribute#' } 
                    },
                    providers: {
                      type: 'array',
                      items: { type: 'integer' },
                      description: 'Array of provider IDs to associate with the product (e.g., [1, 2])'
                    }
                  }
                },
        response: {
          201: {
            description: 'Product successfully created',
            $ref: 'Product#'
          },
          400: {
            type: 'object',
            properties: {
              statusCode: { type: 'number' },
              error: { type: 'string' },
              message: { type: 'string' }
            }
          }
        }
      }
    }, 
    async (request: FastifyRequest, reply: FastifyReply) => controller.createProduct(request, reply)
  );

  app.delete('/products/:id', 
    {
      schema: {
        summary: 'Delete a product by ID',
        description: 'Permanently deletes a product from the database. This action cannot be undone.',
        tags: ['Products'],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { 
              type: 'integer', 
              minimum: 1,
              description: 'Product ID to delete' 
            }
          }
        },
        response: {
          200: {
            description: 'Product successfully deleted',
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              identifier: { type: 'string' },
              description: { type: 'string', nullable: true },
              price: { type: 'number' },
              qty: { type: 'integer' },
              stockStatus: { type: 'string', enum: ['IN_STOCK', 'OUT_OF_STOCK'] },
              unitId: { type: 'integer' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          },
          404: {
            type: 'object',
            properties: {
              statusCode: { type: 'number' },
              error: { type: 'string' },
              message: { type: 'string' }
            }
          },
          400: {
            type: 'object',
            properties: {
              statusCode: { type: 'number' },
              error: { type: 'string' },
              message: { type: 'string' }
            }
          }
        }
      }
    }, 
    async (request: FastifyRequest, reply: FastifyReply) => controller.deleteProduct(request, reply)
  );

  app.put('/products/:id', 
    {
      schema: {
        summary: 'Update a product by ID',
        description: 'Updates a product including its providers.',
        tags: ['Products'],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { 
              type: 'integer', 
              minimum: 1,
              description: 'Product ID to update' 
            }
          }
        },
        body: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    identifier: { type: 'string' },
                    description: { type: 'string', nullable: true },
                    price: { type: 'number', minimum: 0 },
                    qty: { type: 'integer' },
                    unitId: { type: 'integer', description: 'Foreign key to the Unit table' },
                    providers: {
                      type: 'array',
                      items: { type: 'integer' },
                      description: 'Array of provider IDs to associate with the product (e.g., [1, 2])'
                    }
                  }
                },
        response: {
          200: {
            description: 'Product successfully updated',
            $ref: 'Product#'
          },
          404: {
            type: 'object',
            properties: {
              statusCode: { type: 'number' },
              error: { type: 'string' },
              message: { type: 'string' }
            }
          },
          400: {
            type: 'object',
            properties: {
              statusCode: { type: 'number' },
              error: { type: 'string' },
              message: { type: 'string' }
            }
          }
        }
      }
    }, 
    async (request: FastifyRequest, reply: FastifyReply) => controller.updateProductHandler(request, reply)
  );
}
