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
      include: {
        unit: true,
        attributes: true,
        providers: true,
        purchasedProducts: {
          include: {
            provider: true,
          },
        },
      },
    }),
    prisma.product.count({
      where: whereClause,
    }),
  ]);

  const totalPages = Math.ceil(totalItems / pageSize);

   const mapppedData: Product[] = data.map((product) => {
       // Extract unique providers from purchased products
       const providers = product.purchasedProducts
         ?.filter(pp => pp.provider)
         .map(pp => pp.provider!)
         // Deduplicate by provider ID
         .filter((provider, index, self) => 
           index === self.findIndex(p => p.id === provider.id)
         ) ?? [];

       return {
         ...product,
         price: Number(product.price), // Converts Prisma Decimal to number if needed
         // Ensure TypeScript handles the potentially null description safely
         description: product.description ?? null,
         // Include nested relations
         unit: product.unit ? {
           id: product.unit.id,
           name: product.unit.name,
           abbreviation: product.unit.abbreviation ?? '',
         } : undefined,
         attributes: product.attributes?.map(attr => ({
           id: attr.id,
           productId: attr.productId,
           attributeId: attr.attributeId,
         })) ?? [],
         providers: product.providers?.map(p => ({
           id: p.id,
           name: p.name,
           contact: p.contact ?? null,
           createdAt: p.createdAt,
           updatedAt: p.updatedAt,
         })) ?? [],
       };
     });
  // Return a structured metadata object
  return {
    data: mapppedData,
    page,
    pageSize,
    totalPages,
    totalItems,
  };
};