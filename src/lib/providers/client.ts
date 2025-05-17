import { prisma } from "@/lib/prisma"

export class ClientProvider {
    async get(clientId: string) {
        return prisma.client.findUnique({
            where: { id: clientId },
        })
    }

    async update(clientId: string, data: any) {
        return prisma.client.update({
            where: { id: clientId },
            data,
        })
    }

    async list() {
        return prisma.client.findMany({
            orderBy: { createdAt: "desc" },
        })
    }

    async delete(clientId: string) {
        return prisma.client.delete({
            where: { id: clientId },
        })
    }
} 