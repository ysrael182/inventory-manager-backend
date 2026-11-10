"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSell = void 0;
// src/controllers/sellsController.ts
const prisma_1 = require("../prisma");
const createSell = (data) => prisma_1.prisma.sell.create({
    data: {
        userId: data.userId,
        soldItems: {
            create: data.soldItems.map(item => ({
                productId: item.productId,
                price: item.price,
                qty: item.qty
            }))
        }
    },
    include: { soldItems: true }
});
exports.createSell = createSell;
