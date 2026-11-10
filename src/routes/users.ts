// src/routes/users.ts
import { FastifyInstance } from 'fastify';
import { FastifyReply, FastifyRequest } from "fastify";
import * as controller from '../controllers/usersController';
import * as loginController from '../controllers/loginController';

export default async function userRoutes(app: FastifyInstance) {
  app.get('/users', async () => controller.getUsers());
  app.post('/users', {

    schema: {
      description: "Register a new user",
      body: {
        type: "object",
        required: ["username", "password", "role"],
        properties: {
          username: { type: "string", minLength: 3 },
          password: { type: "string", minLength: 6 },
          role: { type: "string", enum: ["admin", "editor", "viewer"] },
        },
      },
      response: {
        201: {
          description: "User created successfully",
          type: "object",
          properties: {
            id: { type: "number" },
            username: { type: "string" },
            role: { type: "string" },
          },
        },
        400: {
          description: "Invalid input",
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
  },
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { username, password, role } = req.body as { username: string; password: string; role?: string };
    return controller.createUser({ username, password, role });
  });
  app.post('/users/login', 
  {
    schema: {
      description: "Login with username, password, and role",
      body: {
        type: "object",
        required: ["username", "password", "role"],
        properties: {
          username: { type: "string", minLength: 3 },
          password: { type: "string", minLength: 6 },
          role: { type: "string", enum: ["admin", "editor", "viewer"] },
        },
      },
      response: {
        200: {
          description: "Login successful",
          type: "object",
          properties: {
            token: { type: "string" },
            username: { type: "string" },
            role: { type: "string" },
          },
        },
        401: {
          description: "Invalid credentials",
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
  },  
  async (req: FastifyRequest, reply: FastifyReply) => {
    return loginController.login(req, reply);
  });
}
