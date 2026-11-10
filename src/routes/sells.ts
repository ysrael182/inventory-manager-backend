import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import * as controller from '../controllers/saleController'; 
import { Sale } from '../types';

export default async function saleRoutes(app: FastifyInstance) {
  
  // 1. Swagger & Validation Schema for creating a sale
  const createSaleSchema = {
    description: 'Create a new customer sale transaction',
    tags: ['Sales'],
    body: {
      type: 'object',
      required: ['userId', 'items', 'subtotal', 'discount', 'total'],
      properties: {
        userId: { type: 'integer', description: 'ID of the cashier or user' },
        subtotal: { type: 'number', description: 'Total price of items before discount' },
        discount: { type: 'number', default: 0.0, description: 'On-the-fly markdown discount' },
        total: { type: 'number', description: 'Final actual amount paid by customer' },
        note: { type: 'string', nullable: true, description: 'Optional custom override notes' },
        items: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            required: ['productId', 'price', 'qty'],
            properties: {
              productId: { type: 'integer' },
              price: { type: 'number', description: 'Retail price assigned on the fly' },
              qty: { type: 'integer', minimum: 1 }
            }
          }
        }
      }
    },
    response: {
      201: {
        description: 'Sale recorded successfully',
        type: 'object',
        properties: {
          id: { type: 'integer' },
          userId: { type: 'integer' },
          subtotal: { type: 'number' },
          discount: { type: 'number' },
          total: { type: 'number' },
          note: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  };

  // 2. Updated Swagger Schema for listing sales (Supports filtering & pagination envelope)
  const getAllSalesSchema = {
    description: 'Retrieve a paginated and filtered list of past historical sales transactions',
    tags: ['Sales'],
    querystring: {
      type: 'object',
      properties: {
        page: { type: 'integer', default: 1, minimum: 1, description: 'Target pagination page' },
        pageSize: { type: 'integer', default: 10, minimum: 1, description: 'Number of rows to return' },
        query: { type: 'string', description: 'Search text targeting user ID or user name' },
        startDate: { type: 'string', format: 'date', description: 'ISO start date boundary (YYYY-MM-DD)' },
        endDate: { type: 'string', format: 'date', description: 'ISO end date boundary (YYYY-MM-DD)' },
        total: { type: 'number', description: 'Target invoice final amount value to filter by' },
        totalOperator: { 
          type: 'string', 
          enum: ['gt', 'gte', 'lt', 'lte', 'eq'], 
          default: 'eq',
          description: 'Comparison operator match rule targeting the total value' 
        }
      }
    },
    response: {
      200: {
        description: 'Paginated sales results matched successfully',
        type: 'object',
        required: ['data', 'meta'],
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                userId: { type: 'integer' },
                subtotal: { type: 'number' },
                discount: { type: 'number' },
                total: { type: 'number' },
                note: { type: 'string', nullable: true },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
              }
            }
          },
          meta: {
            type: 'object',
            required: ['totalItems', 'itemCount', 'itemsPerPage', 'totalPages', 'currentPage'],
            properties: {
              totalItems: { type: 'integer', description: 'Total records matching filter criteria in DB' },
              itemCount: { type: 'integer', description: 'Number of elements returned in current array slice' },
              itemsPerPage: { type: 'integer' },
              totalPages: { type: 'integer' },
              currentPage: { type: 'integer' }
            }
          }
        }
      }
    }
  };

  // --- Endpoints Definitions ---

  // GET /sales
  app.get(
    '/sales', 
    { schema: getAllSalesSchema }, 
    async (request: any, reply: FastifyReply) => {
      return controller.getAllSales(request, reply);
    }
  );

  // POST /sales
  app.post<{ Body: Sale }>(
    '/sales', 
    { schema: createSaleSchema }, 
    async (request: FastifyRequest<{ Body: Sale }>, reply: FastifyReply) => {
      return controller.createSale(request, reply);
    }
  );
}
