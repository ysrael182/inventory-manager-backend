// src/routes/products.ts
import { FastifyInstance } from 'fastify';
import { FastifyRequest, FastifyReply } from 'fastify';
import * as controller from '../controllers/productsController';

export default async function productRoutes(app: FastifyInstance) {

  app.get('/products', 
    {
      schema: {
        description: 'Get a paginated list of products with their units and attributes',
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
        description: 'Creates a product along with its required pricing, quantity, unitId, and optional relations.',
        tags: ['Products'],
        body: {
          $ref: 'Product#'
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
}
