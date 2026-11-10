import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../prisma';

export interface CreateProviderBody {
    name: string;
    contact?: string;
}

export interface UpdateProviderBody {
    name?: string;
    contact?: string;
}

export interface ProviderParams {
    id: string;
}

export async function getAllProviders(request: FastifyRequest, reply: FastifyReply) {
    try {
        const providers = await prisma.provider.findMany();
        return reply.status(200).send(providers);
    } catch (error) {
        return reply.status(500).send({ message: 'Internal server error' });
    }
}

export async function getProviderById(
    request: FastifyRequest<{ Params: ProviderParams }>, 
    reply: FastifyReply
) {
    try {
        const id = parseInt(request.params.id, 10);
        if (isNaN(id)) {
            return reply.status(400).send({ message: 'Invalid ID format' });
        }

        const provider = await prisma.provider.findUnique({
            where: { id }
        });

        if (!provider) {
            return reply.status(404).send({ message: 'Provider not found' });
        }

        return reply.status(200).send(provider);
    } catch (error) {
        return reply.status(500).send({ message: 'Internal server error' });
    }
}

export async function createProvider(
    request: FastifyRequest<{ Body: CreateProviderBody }>, 
    reply: FastifyReply
) {
    try {
        const { name, contact } = request.body;

        const newProvider = await prisma.provider.create({
            data: {
                name,
                contact
            }
        });

        return reply.status(201).send(newProvider);
    } catch (error) {
        return reply.status(500).send({ message: 'Internal server error' });
    }
}

export async function updateProvider(
    request: FastifyRequest<{ Params: ProviderParams; Body: UpdateProviderBody }>, 
    reply: FastifyReply
) {
    try {
        const id = parseInt(request.params.id, 10);
        if (isNaN(id)) {
            return reply.status(400).send({ message: 'Invalid ID format' });
        }

        const { name, contact } = request.body;

        const updatedProvider = await prisma.provider.update({
            where: { id },
            data: {
                name,
                contact
            }
        });

        return reply.status(200).send(updatedProvider);
    } catch (error: any) {
        if (error.code === 'P2025') {
            return reply.status(404).send({ message: 'Provider not found' });
        }
        return reply.status(500).send({ message: 'Internal server error' });
    }
}

export async function deleteProvider(
    request: FastifyRequest<{ Params: ProviderParams }>, 
    reply: FastifyReply
) {
    try {
        const id = parseInt(request.params.id, 10);
        if (isNaN(id)) {
            return reply.status(400).send({ message: 'Invalid ID format' });
        }

        await prisma.provider.delete({
            where: { id }
        });

        return reply.status(200).send({ 
            success: true, 
            message: `Provider with ID ${id} deleted successfully.` 
        });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return reply.status(404).send({ message: 'Provider not found' });
        }
        return reply.status(500).send({ message: 'Internal server error' });
    }
}
