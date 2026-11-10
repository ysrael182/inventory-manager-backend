"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.getUsers = void 0;
// src/controllers/usersController.ts
const prisma_1 = require("../prisma");
const getUsers = () => prisma_1.prisma.user.findMany();
exports.getUsers = getUsers;
const createUser = (data) => prisma_1.prisma.user.create({ data });
exports.createUser = createUser;
