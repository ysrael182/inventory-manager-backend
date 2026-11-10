// src/server.ts
import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import fastifyJwt from '@fastify/jwt';
import productRoutes from './routes/products';
import attributeRoutes from './routes/attributes';
import userRoutes from './routes/users';
import sellRoutes from './routes/sells';
import providerRoutes from './routes/providers';
import unitRoutes from './routes/units';
import purchaseRoutes from './routes/purchases';

import dotenv from 'dotenv';
import cors from '@fastify/cors'
import { registerSharedSchemas } from './schemas/shared';

dotenv.config();

const app = Fastify({ logger: true, ajv: {
    customOptions: {
      strict: false, // allows "example"
    }
  } });


app.register(cors, {
  origin: ['http://localhost:4000'], // allow your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
});

registerSharedSchemas(app);

// Register JWT plugin
app.register(fastifyJwt, { secret: process.env.JWT_SECRET || 'supersecret' });

// Decorator for authentication
app.decorate("authenticate", async function (request: any, reply: any) {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.send(err);
  }
});

// Login route to issue JWT
app.post('/login', async (request, reply) => {
  const { email, password } = request.body as { email: string; password: string };

  // Replace with Prisma user lookup
  if (email !== 'test@test.com' || password !== '1234') {
    return reply.status(401).send({ error: 'Invalid credentials' });
  }

  const token = app.jwt.sign({ email });
  return { token };
});

// Swagger setup
app.register(swagger, {
  openapi: {
    info: {
      title: 'Library inventory API',
      description: 'Fastify + Prisma + Postgres API docs',
      version: '1.0.0',
    },
  },
});

app.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false,
  },
});

// Register routes (protect inside each file with preHandler if needed)
app.register(productRoutes);
app.register(attributeRoutes);
app.register(userRoutes);
app.register(sellRoutes);
app.register(providerRoutes);
app.register(unitRoutes);
app.register(purchaseRoutes);

app.listen({ port: 3000 });
