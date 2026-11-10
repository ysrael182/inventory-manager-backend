import { FastifyReply, FastifyRequest } from "fastify";
import { login as loginService } from '../services/user.service';


export const login = async (request: FastifyRequest, reply: FastifyReply) => {
  const { username, password, role } = request.body as { username: string; password: string, role?: string };
    
    try {
    const user = await loginService(username, password, role);

    // If loginService returns null/false, reject
    if (!user) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    // Sign JWT using Fastify's jwt instance
    const token = (request.server as any).jwt.sign({ id: user.id, username: user.username, role: user.role });

    return { token, user };
  } catch (error) {
    return reply.status(401).send({ error: 'Invalid credentials' });
  }
}
