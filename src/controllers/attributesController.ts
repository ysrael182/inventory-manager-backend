// src/controllers/attributesController.ts
import { prisma } from '../prisma';

export const getAttributes = () => prisma.attribute.findMany();

export const createAttribute = (data: { name: string; description?: string }) =>
  prisma.attribute.create({ data });
