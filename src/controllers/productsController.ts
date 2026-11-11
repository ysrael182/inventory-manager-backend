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
      saleItems: true,
      providers: true
    } 
  });
};

export const createProduct = async (request: FastifyRequest, reply: FastifyReply) => {
  // Updated: Extracted unitId instead of the unit string
    const { name, identifier, description, price, qty, unitId, attributes, providers } = request.body as any;

  // Handle both formats: [1, 2] or [{ id: 1 }, { id: 2 }]
  const providerIds = providers?.map((p: number | { id: number }) => typeof p === 'number' ? p : p.id) ?? [];

  try {
    const newProduct = await prisma.product.create({
          data: {
            name,
            identifier,
            price,
            qty,
            stockStatus: qty > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
            unitId, // Links the product to its specific unit row in the database
            description: description ?? null,
            ...(attributes && {
              attributes: {
                create: attributes // Expects an array matching the ProductAttribute schema shape
              }
            }),
            ...(providerIds.length > 0 && {
              providers: {
                connect: providerIds.map((id: number) => ({ id }))
              }
            })
          },
      include: {
        unit: true, // Automatically includes the nested Unit object in the 201 response
        providers: true
      }
    });

    return reply.status(201).send(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    return reply.status(400).send({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (id: number, data: { name?: string; identifier?: string; description?: string | null; price?: number; qty?: number; unitId?: number; providers?: (number | { id: number })[] }) => {
  const { providers, ...productData } = data;
  
  // Handle both formats: [1, 2] or [{ id: 1 }, { id: 2 }]
  const providerIds = providers?.map((p: number | { id: number }) => typeof p === 'number' ? p : p.id) ?? [];
  
  return await prisma.product.update({ 
    where: { id }, 
    data: {
      ...productData,
      ...(data.qty !== undefined && {
        stockStatus: data.qty > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK'
      }),
      ...(providerIds.length > 0 && {
        providers: {
          set: providerIds.map((id: number) => ({ id }))
        }
      })
    },
    include: { unit: true, providers: true }
  });
};

export const updateProductHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const productId = parseInt(id, 10);
  const { name, identifier, description, price, qty, unitId, providers } = request.body as any;

  try {
    const updatedProduct = await updateProduct(productId, { name, identifier, description, price, qty, unitId, providers });
    return reply.send(updatedProduct);
  } catch (error: any) {
    console.error('Error updating product:', error);
    if (error.code === 'P2025') {
      return reply.status(404).send({ error: 'Product not found' });
    }
    return reply.status(400).send({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const productId = parseInt(id, 10);

  try {
    const deletedProduct = await prisma.product.delete({ where: { id: productId } });
    return reply.send(deletedProduct);
  } catch (error: any) {
    console.error('Error deleting product:', error);
    if (error.code === 'P2025') {
      return reply.status(404).send({ error: 'Product not found' });
    }
    return reply.status(400).send({ error: 'Failed to delete product' });
  }
};
