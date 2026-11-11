import { FastifyRequest, FastifyReply } from 'fastify';
import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';

const purchaseItemsInclude = {
    items: {
        include: {
            product: {
                select: {
                    id: true,
                    name: true,
                    unit: {
                        select: {
                            id: true,
                            name: true,
                            abbreviation: true
                        }
                    },
                    providers: {
                        select: {
                            id: true,
                            name: true,
                            contact: true
                        }
                    }
                }
            },
            provider: {
                select: {
                    id: true,
                    name: true,
                    contact: true
                }
            }
        }
    }
} satisfies Prisma.PurchaseInclude;

export interface CreatePurchaseItem {
    productId: number;
    price: number;
    qty: number;
    providerId?: number;
}

export interface CreatePurchaseBody {
    note?: string;
    purchaseDate?: string;
    items: CreatePurchaseItem[];
}

export interface UpdatePurchaseItem {
    productId: number;
    price: number;
    qty: number;
    providerId?: number;
}

export interface UpdatePurchaseBody {
    note?: string;
    purchaseDate?: string | null;
    items?: UpdatePurchaseItem[];
}

export interface PurchaseParams {
    id: string;
}

function purchaseDateAsDate(value: string): Date {
    return new Date(`${value}T00:00:00.000Z`);
}

function serializePurchaseDate(purchase: { purchaseDate?: Date | null } & Record<string, unknown>) {
    return {
        ...purchase,
        purchaseDate: purchase.purchaseDate?.toLocaleDateString('en-GB') ?? null
    };
}

export async function getAllPurchases(request: FastifyRequest, reply: FastifyReply) {
    try {
        const purchases = await prisma.purchase.findMany({
            include: purchaseItemsInclude
        });
        return reply.status(200).send(purchases.map(serializePurchaseDate));
    } catch (error) {
        return reply.status(500).send({ message: 'Internal server error' });
    }
}

export async function getPurchaseById(
    request: FastifyRequest<{ Params: PurchaseParams }>, 
    reply: FastifyReply
) {
    try {
        const id = parseInt(request.params.id, 10);
        if (isNaN(id)) {
            return reply.status(400).send({ message: 'Invalid ID format' });
        }

        const purchase = await prisma.purchase.findUnique({
            where: { id },
            include: purchaseItemsInclude
        });

        if (!purchase) {
            return reply.status(404).send({ message: 'Purchase not found' });
        }

        return reply.status(200).send(serializePurchaseDate(purchase));
    } catch (error) {
        return reply.status(500).send({ message: 'Internal server error' });
    }
}

export async function createPurchase(
    request: FastifyRequest<{ Body: CreatePurchaseBody }>, 
    reply: FastifyReply
) {
    try {
        // Corregido: Ya no extraemos providerId del nivel superior de la petición
        const { note, purchaseDate, items } = request.body;

        const newPurchase = await prisma.purchase.create({
            data: {
                note,
                purchaseDate: purchaseDate
                    ? purchaseDateAsDate(purchaseDate)
                    : purchaseDateAsDate(new Date().toISOString().slice(0, 10)),
                items: {
                    create: items.map(item => ({
                        productId: item.productId,
                        price: item.price,
                        qty: item.qty,
                        providerId: item.providerId 
                    }))
                }
            },
            include: purchaseItemsInclude
        });

        return reply.status(201).send(serializePurchaseDate(newPurchase));
    } catch (error) {
        // Es buena práctica registrar el error real en tu consola para debugging
        request.log.error(error); 
        return reply.status(500).send({ message: 'Internal server error' });
    }
}


export async function updatePurchase(
    request: FastifyRequest<{ Params: PurchaseParams; Body: UpdatePurchaseBody }>, 
    reply: FastifyReply
) {
    try {
        const id = parseInt(request.params.id, 10);
        if (isNaN(id)) {
            return reply.status(400).send({ message: 'Invalid ID format' });
        }

        const { note, purchaseDate, items } = request.body;

        const updatedPurchase = await prisma.purchase.update({
            where: { id },
            data: {
                note,
                ...(purchaseDate !== undefined && {
                    purchaseDate: purchaseDate === null ? null : purchaseDateAsDate(purchaseDate)
                }),
                // If items are provided, delete the old ones and create the new ones
                ...(items && {
                    items: {
                        deleteMany: {}, // Wipes out previous items for this purchase
                        create: items.map(item => ({
                            productId: item.productId,
                            price: item.price,
                            qty: item.qty,
                            providerId: item.providerId 
                        }))
                    }
                })
            },
            include: purchaseItemsInclude
        });

        return reply.status(200).send(serializePurchaseDate(updatedPurchase));
    } catch (error: any) {
        request.log.error(error); // Good practice to log the error details
        if (error.code === 'P2025') {
            return reply.status(404).send({ message: 'Purchase not found' });
        }
        return reply.status(500).send({ message: 'Internal server error' });
    }
}

export async function deletePurchase(
    request: FastifyRequest<{ Params: PurchaseParams }>, 
    reply: FastifyReply
) {
    try {
        const id = parseInt(request.params.id, 10);
        if (isNaN(id)) {
            return reply.status(400).send({ message: 'Invalid ID format' });
        }

        await prisma.$transaction([
            prisma.purchasedProduct.deleteMany({ where: { purchaseId: id } }),
            prisma.purchase.delete({ where: { id } })
        ]);

        return reply.status(200).send({ 
            success: true, 
            message: `Purchase with ID ${id} deleted successfully.` 
        });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return reply.status(404).send({ message: 'Purchase not found' });
        }
        return reply.status(500).send({ message: 'Internal server error' });
    }
}
