import { prisma } from "@/lib/prisma";
import type { Industry } from "@prisma/client";

export type ClientIndustryCreateInput = {
    clientId: string;
    industryId: string;
};

export type ClientIndustryUpdateInput = {
    industryId: string;
};

export class ClientIndustryProvider {
    async findByClient(clientId: string): Promise<Industry | null> {
        const client = await prisma.client.findUnique({
            where: { id: clientId },
            include: { industry: true }
        });
        return client?.industry || null;
    }

    async create(data: ClientIndustryCreateInput): Promise<Industry> {
        const client = await prisma.client.update({
            where: { id: data.clientId },
            data: { industryId: data.industryId },
            include: { industry: true }
        });
        return client.industry!;
    }

    async update(clientId: string, data: ClientIndustryUpdateInput): Promise<Industry> {
        const client = await prisma.client.update({
            where: { id: clientId },
            data: { industryId: data.industryId },
            include: { industry: true }
        });
        return client.industry!;
    }

    async delete(clientId: string): Promise<Industry | null> {
        const client = await prisma.client.update({
            where: { id: clientId },
            data: { industryId: null },
            include: { industry: true }
        });
        return client.industry;
    }
}
