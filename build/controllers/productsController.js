"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
// src/controllers/productsController.ts
const prisma_1 = require("../prisma");
const getProducts = () => prisma_1.prisma.product.findMany({ include: { inventory: true, attributes: true, soldItems: true } });
exports.getProducts = getProducts;
const getProductById = (id) => prisma_1.prisma.product.findUnique({ where: { id }, include: { inventory: true, attributes: true, soldItems: true } });
exports.getProductById = getProductById;
const createProduct = (data) => prisma_1.prisma.product.create({ data });
exports.createProduct = createProduct;
const updateProduct = (id, data) => prisma_1.prisma.product.update({ where: { id }, data });
exports.updateProduct = updateProduct;
const deleteProduct = (id) => prisma_1.prisma.product.delete({ where: { id } });
exports.deleteProduct = deleteProduct;
