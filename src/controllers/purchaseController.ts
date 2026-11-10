import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../prisma';

export interface CreatePurchaseItem {
    productId: number;
    price: number;
    qty: number;
    providerId?: number;
}

export interface CreatePurchaseBody {
    note?: string;
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
    items?: UpdatePurchaseItem[];
}

export interface PurchaseParams {
    id: string;
}

export async function getAllPurchases(request: FastifyRequest, reply: FastifyReply) {
    try {
        const purchases = await prisma.purchase.findMany({
            include: {
                items: true
            }
        });
        return reply.status(200).send(purchases);
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
            include: {
                items: true
            }
        });

        if (!purchase) {
            return reply.status(404).send({ message: 'Purchase not found' });
        }

        return reply.status(200).send(purchase);
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
        const { note, items } = request.body;

        const newPurchase = await prisma.purchase.create({
            data: {
                note,
                items: {
                    create: items.map(item => ({
                        productId: item.productId,
                        price: item.price,
                        qty: item.qty,
                        providerId: item.providerId 
                    }))
                }
            },
            include: {
                items: true
            }
        });

        return reply.status(201).send(newPurchase);
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

        const { note, items } = request.body;

        const updatedPurchase = await prisma.purchase.update({
            where: { id },
            data: {
                note,
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
            include: {
                items: true
            }
        });

        return reply.status(200).send(updatedPurchase);
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
