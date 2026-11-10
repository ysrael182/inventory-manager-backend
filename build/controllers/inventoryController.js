"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInventory = exports.getInventory = void 0;
// src/controllers/inventoryController.ts
const prisma_1 = require("../prisma");
const getInventory = () => prisma_1.prisma.inventory.findMany();
exports.getInventory = getInventory;
const createInventory = (data) => prisma_1.prisma.inventory.create({ data });
exports.createInventory = createInventory;
