import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../prisma';


export interface CreateUnitBody {
    name: string;
    abbreviation?: string;
}

export interface UpdateUnitBody {
    name?: string;
    abbreviation?: string;
}

export interface UnitParams {
    id: string;
}

export async function getAllUnits(request: FastifyRequest, reply: FastifyReply) {
    try {
        const units = await prisma.unit.findMany();
        return reply.status(200).send(units);
    } catch (error) {
        return reply.status(500).send({ message: 'Internal server error' });
    }
}

export async function getUnitById(
    request: FastifyRequest<{ Params: UnitParams }>, 
    reply: FastifyReply
) {
    try {
        const id = parseInt(request.params.id, 10);
        if (isNaN(id)) {
            return reply.status(400).send({ message: 'Invalid ID format' });
        }

        const unit = await prisma.unit.findUnique({
            where: { id }
        });

        if (!unit) {
            return reply.status(404).send({ message: 'Unit not found' });
        }

        return reply.status(200).send(unit);
    } catch (error) {
        return reply.status(500).send({ message: 'Internal server error' });
    }
}

export async function createUnit(
    request: FastifyRequest<{ Body: CreateUnitBody }>, 
    reply: FastifyReply
) {
    try {
        const { name, abbreviation } = request.body;

        const newUnit = await prisma.unit.create({
            data: {
                name,
                abbreviation
            }
        });

        return reply.status(201).send(newUnit);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return reply.status(409).send({ message: 'Unit name already exists' });
        }
        return reply.status(500).send({ message: 'Internal server error' });
    }
}

export async function updateUnit(
    request: FastifyRequest<{ Params: UnitParams; Body: UpdateUnitBody }>, 
    reply: FastifyReply
) {
    try {
        const id = parseInt(request.params.id, 10);
        if (isNaN(id)) {
            return reply.status(400).send({ message: 'Invalid ID format' });
        }

        const { name, abbreviation } = request.body;

        const updatedUnit = await prisma.unit.update({
            where: { id },
            data: {
                name,
                abbreviation
            }
        });

        return reply.status(200).send(updatedUnit);
    } catch (error: any) {
        if (error.code === 'P2025') {
            return reply.status(404).send({ message: 'Unit not found' });
        }
        if (error.code === 'P2002') {
            return reply.status(409).send({ message: 'Unit name already exists' });
        }
        return reply.status(500).send({ message: 'Internal server error' });
    }
}

export async function deleteUnit(
    request: FastifyRequest<{ Params: UnitParams }>, 
    reply: FastifyReply
) {
    try {
        const id = parseInt(request.params.id, 10);
        if (isNaN(id)) {
            return reply.status(400).send({ message: 'Invalid ID format' });
        }

        await prisma.unit.delete({
            where: { id }
        });

        return reply.status(200).send({ 
            success: true, 
            message: `Unit with ID ${id} deleted successfully.` 
        });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return reply.status(404).send({ message: 'Unit not found' });
        }
        return reply.status(500).send({ message: 'Internal server error' });
    }
}
