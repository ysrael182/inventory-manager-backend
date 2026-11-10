// src/controllers/productsController.ts
import { prisma } from '../prisma';
import { FastifyReply, FastifyRequest } from "fastify";
import { getProducts as getProductsFromService } from '../services/product.service';

export const getProducts = async (request: FastifyRequest, reply: FastifyReply) => {
  const { query, page, pageSize } = request.query as { query?: string; page?: number; pageSize?: number };

  try {
    const result = await getProductsFromService({ query, page, pageSize });
    return reply.send(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    return reply.status(500).send({ error: 'Failed to fetch products' });
  }
};

export const getProductById = async (id: number) => {
  return await prisma.product.findUnique({ 
    where: { id }, 
    include: { 
      unit: true, // Dynamically includes the relation with the Unit table
      attributes: true, 
      saleItems: true 
    } 
  });
};

export const createProduct = async (request: FastifyRequest, reply: FastifyReply) => {
  // Updated: Extracted unitId instead of the unit string
  const { name, identifier, description, price, qty, unitId, attributes } = request.body as any;

  try {
    const newProduct = await prisma.product.create({
      data: {
        name,
        identifier,
        price,
        qty,
        unitId, // Links the product to its specific unit row in the database
        description: description ?? null,
        ...(attributes && {
          attributes: {
            create: attributes // Expects an array matching the ProductAttribute schema shape
          }
        })
      },
      include: {
        unit: true // Automatically includes the nested Unit object in the 201 response
      }
    });

    return reply.status(201).send(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    return reply.status(400).send({ error: 'Failed to create product' });
  }
};

export const updateProduct = (id: number, data: { name?: string; identifier?: string; unitId?: number }) =>
  prisma.product.update({ 
    where: { id }, 
    data,
    include: { unit: true }
  });

export const deleteProduct = (id: number) =>
  prisma.product.delete({ where: { id } });
