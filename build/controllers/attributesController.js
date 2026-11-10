"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAttribute = exports.getAttributes = void 0;
// src/controllers/attributesController.ts
const prisma_1 = require("../prisma");
const getAttributes = () => prisma_1.prisma.attribute.findMany();
exports.getAttributes = getAttributes;
const createAttribute = (data) => prisma_1.prisma.attribute.create({ data });
exports.createAttribute = createAttribute;
