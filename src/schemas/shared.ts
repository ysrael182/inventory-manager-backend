import { FastifyInstance } from 'fastify';

export const unitSchema = {
  $id: 'Unit',
  type: 'object',
  required: ['id', 'name'],
  properties: {
    id: { type: 'integer' },
    name: { type: 'string', description: 'Full name of the unit (e.g., meter, package, box)' },
    abbreviation: { type: 'string', description: 'Short representation (e.g., m, pkg, bx)', nullable: true }
  }
};

export const productAttributeSchema = {
  $id: 'ProductAttribute',
  type: 'object',
  required: ['attributeId'],
  properties: {
    id: { type: 'integer' },
    productId: { type: 'integer' },
    attributeId: { type: 'integer' }
  }
};

export const soldItemSchema = {
  $id: 'SoldItem',
  type: 'object',
  required: ['qty', 'price'],
  properties: {
    id: { type: 'integer' },
    sellId: { type: 'integer' },
    productId: { type: 'integer' },
    qty: { type: 'integer' },
    price: { type: 'number' }
  }
};

export const productSchema = {
  $id: 'Product',
  type: 'object',
  required: ['name', 'identifier', 'price', 'qty', 'unitId'], // unitId is now required for writes
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    identifier: { type: 'string' },
    description: { type: 'string', nullable: true },
    price: { type: 'number', minimum: 0 },
    qty: { type: 'integer' },
    unitId: { type: 'integer', description: 'Foreign key to the Unit table' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    // Nested object relations for read responses
    unit: { $ref: 'Unit#' }, 
    attributes: { type: 'array', items: { $ref: 'ProductAttribute#' } },
    soldItems: { type: 'array', items: { $ref: 'SoldItem#' } }
  }
};

export function registerSharedSchemas(app: FastifyInstance) {
  app.addSchema(unitSchema);
  app.addSchema(productAttributeSchema);
  app.addSchema(soldItemSchema);
  app.addSchema(productSchema);
}
