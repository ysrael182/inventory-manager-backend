import { FastifyRequest, FastifyReply } from 'fastify';
import * as saleService from '../services/sale.service';
import { Sale } from '../types'; // Adjust tracking paths to match your project layouts

// Explicitly type the expected query string fields incoming from Fastify
interface GetAllSalesQuery {
  page?: number;
  pageSize?: number;
  query?: string;
  startDate?: string;
  endDate?: string;
  total?: number;
  totalOperator?: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
}

export const getAllSales = async (
  request: FastifyRequest<{ Querystring: GetAllSalesQuery }>, 
  reply: FastifyReply
) => {
  try {
    const { 
      page, 
      pageSize, 
      query, 
      startDate, 
      endDate, 
      total, 
      totalOperator 
    } = request.query;

    // Structure arguments to exactly match your service's new method footprint
    const salesResult = await saleService.fetchAllSales({
      page,
      pageSize,
      query,
      dateRange: {
        startDate,
        endDate
      },
      totalFilter: {
        total,
        totalOperator
      }
    });

    return reply.code(200).send(salesResult);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Failed to retrieve sales records.' });
  }
};

export const createSale = async (
  request: FastifyRequest<{ Body: Sale }>, 
  reply: FastifyReply
) => {
  try {
    const saleData = request.body;
    const newSale = await saleService.executeSaleTransaction(saleData);
    
    return reply.code(201).send(newSale);
  } catch (error: any) {
    request.log.error(error);

    if (error.message && error.message.includes('out of stock')) {
      return reply.code(400).send({ error: error.message });
    }

    return reply.code(500).send({ error: 'An error occurred while creating the sale.' });
  }
};
