import { prisma } from '../prisma';
import { Product } from '../types';
import { PaginationParams, PaginationResult } from '../types/pageable.interface';

export const getProducts = async ({ query, page = 1, pageSize = 10 }: PaginationParams): Promise<PaginationResult<Product>> => {
 
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  // Build the dynamic 'where' clause
  const whereClause = query
    ? {
        OR: [
          { name: { contains: query, mode: 'insensitive' as const } },
          { identifier: { contains: query, mode: 'insensitive' as const } },
          { description: { contains: query, mode: 'insensitive' as const } },
        ],
      }
    : {};

  // Run both queries in a transaction to get data and total count simultaneously
  const [data, totalItems] = await prisma.$transaction([
    prisma.product.findMany({
      where: whereClause,
      skip,
      take,
    }),
    prisma.product.count({
      where: whereClause,
    }),
  ]);

  const totalPages = Math.ceil(totalItems / pageSize);

   const mapppedData: Product[] = data.map((product) => ({
    ...product,
    price: Number(product.price), // Converts Prisma Decimal to number if needed
    // Ensure TypeScript handles the potentially null description safely
    description: product.description ?? null, 
  }));
  // Return a structured metadata object
  return {
    data: mapppedData,
    page,
    pageSize,
    totalPages,
    totalItems,
  };
};