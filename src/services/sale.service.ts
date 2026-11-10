import { prisma } from '../prisma';
import { Sale } from '../types';
import { PaginationParams, PaginationResult } from '../types/pageable.interface';

interface FetchSalesArgs extends PaginationParams {
  query?: string;
  dateRange?: { startDate?: string; endDate?: string };
  totalFilter?: { total?: number; totalOperator?: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' };
}

export const fetchAllSales = async ({ 
  query,
  dateRange = {},
  totalFilter = {}, 
  page = 1, 
  pageSize = 10 
}: FetchSalesArgs): Promise<PaginationResult<Sale>> => {
  
  const whereClause: any = {};

  // 1. Text Search Filter: Matches User ID or User Name
  if (query && query.trim() !== '') {
    const isNumeric = !isNaN(Number(query));
    
    whereClause.user = {
      OR: [
        ...(isNumeric ? [{ id: Number(query) }] : []),
        {
          name: {
            contains: query,
            mode: 'insensitive'
          }
        }
      ]
    };
  }

  // 2. Separate Date Range Filter
  if (dateRange.startDate || dateRange.endDate) {
    whereClause.createdAt = {};
    if (dateRange.startDate) {
      whereClause.createdAt.gte = new Date(dateRange.startDate);
    }
    if (dateRange.endDate) {
      whereClause.createdAt.lte = new Date(dateRange.endDate);
    }
  }

  // 3. Separate Total Financial Filter
  if (totalFilter.total !== undefined) {
    const totalVal = Number(totalFilter.total);
    
    switch (totalFilter.totalOperator) {
      case 'gt':   whereClause.total = { gt: totalVal }; break;
      case 'gte':  whereClause.total = { gte: totalVal }; break;
      case 'lt':   whereClause.total = { lt: totalVal }; break;
      case 'lte':  whereClause.total = { lte: totalVal }; break;
      case 'eq':   
      default:     whereClause.total = totalVal; break;
    }
  }

  // 4. Compute safe pagination parameters
  const take = Number(pageSize) > 0 ? Number(pageSize) : 10;
  const skip = (Number(page) - 1) * take;

  // 5. Execute concurrent database queries
  const [totalItems, data] = await Promise.all([
    prisma.sale.count({ where: whereClause }),
    prisma.sale.findMany({
      where: whereClause,
      skip,
      take,
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  ]);

  const totalPages = Math.ceil(totalItems / take);

  // Flat structure matches PaginationResult exactly
  return {
    data: data as unknown as Sale[],
    page: Number(page),
    pageSize: take,
    totalPages,
    totalItems
  };
};

// Execute checkout calculations, write records, and update stock counts atomically
export const executeSaleTransaction = async (data: Sale) => {
  // 1. Calculate the subtotal safely on the server-side to guarantee integrity
  let calculatedSubtotal = 0;
  for (const item of data.items) {
    calculatedSubtotal += item.price * item.qty;
  }

  // Protect against floating-point rounding errors using standard numbers
  const subtotal = Number(calculatedSubtotal.toFixed(2));
  const discount = Number((data.discount || 0).toFixed(2));
  const total = Number((subtotal - discount).toFixed(2));

  // 2. Wrap operations in a database transaction. If one step fails, everything rolls back.
  return await prisma.$transaction(async (tx) => {
    
    // Step A: Loop through items to verify stock availability and deduct quantities
    for (const item of data.items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        throw new Error(`Product with ID ${item.productId} does not exist.`);
      }

      if (product.qty < item.qty) {
        throw new Error(`Product "${product.name}" is out of stock. Available: ${product.qty}, Requested: ${item.qty}`);
      }

      // Decrement product inventory count atomically
      await tx.product.update({
        where: { id: item.productId },
        data: {
          qty: {
            decrement: item.qty
          }
        }
      });
    }

    // Step B: Persist the main Sale record and its child nested line items
    return await tx.sale.create({
      data: {
        userId: data.userId,
        subtotal,
        discount,
        total,
        note: data.note || null,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            price: Number(item.price.toFixed(2)),
            qty: item.qty
          }))
        }
      },
      include: {
        items: true
      }
    });
  });
};
