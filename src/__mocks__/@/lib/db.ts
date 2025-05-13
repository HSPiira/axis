import { PrismaClient } from '../../../../generated/prisma';

interface MockPrisma {
    user: {
        create: jest.Mock;
        delete: jest.Mock;
        findUnique: jest.Mock;
        findMany: jest.Mock;
    };
    role: {
        findUnique: jest.Mock;
        create: jest.Mock;
        findMany: jest.Mock;
    };
    userRole: {
        create: jest.Mock;
        findMany: jest.Mock;
        deleteMany: jest.Mock;
        delete: jest.Mock;
    };
    organization: {
        findMany: jest.Mock;
        findFirst: jest.Mock;
        create: jest.Mock;
        deleteMany: jest.Mock;
        count: jest.Mock;
        findUnique: jest.Mock;
        update: jest.Mock;
    };
    industry: {
        findMany: jest.Mock;
        findFirst: jest.Mock;
        findUnique: jest.Mock;
        create: jest.Mock;
        update: jest.Mock;
        delete: jest.Mock;
    };
    $transaction: jest.Mock;
    $connect: jest.Mock;
    $disconnect: jest.Mock;
}

const mockPrisma: MockPrisma = {
    user: {
        create: jest.fn(),
        delete: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
    },
    role: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
    },
    userRole: {
        create: jest.fn(),
        findMany: jest.fn(),
        deleteMany: jest.fn(),
        delete: jest.fn(),
    },
    organization: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        deleteMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
    },
    industry: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
};

export const prisma = mockPrisma as unknown as PrismaClient;
export default prisma; 