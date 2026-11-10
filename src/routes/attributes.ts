// src/routes/attributes.ts
import { FastifyInstance } from 'fastify';
import * as controller from '../controllers/attributesController';

export default async function attributeRoutes(app: FastifyInstance) {
  app.get('/attributes', async () => controller.getAttributes());
  app.post('/attributes', async (req: any) => controller.createAttribute(req.body));
}
