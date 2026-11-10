// src/controllers/usersController.ts
import { prisma } from '../prisma';
import { User } from '../types/user.interface';
import { createUser as createUserService } from '../services/user.service';

export const getUsers = () => prisma.user.findMany();

export const createUser = (data: User) => {
  return createUserService(data);
};
