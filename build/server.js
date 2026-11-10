"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const fastify_1 = __importDefault(require("fastify"));
const products_1 = __importDefault(require("./routes/products"));
const inventory_1 = __importDefault(require("./routes/inventory"));
const attributes_1 = __importDefault(require("./routes/attributes"));
const users_1 = __importDefault(require("./routes/users"));
const sells_1 = __importDefault(require("./routes/sells"));
const app = (0, fastify_1.default)({ logger: true });
app.register(products_1.default);
app.register(inventory_1.default);
app.register(attributes_1.default);
app.register(users_1.default);
app.register(sells_1.default);
app.listen({ port: 3000 });
