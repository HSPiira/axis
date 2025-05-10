const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');

const mockPrisma = {
    user: {
        create: jest.fn(async (data) => {
            if (data.data.email === 'test@example.com') {
                throw { code: 'P2002', message: 'Unique constraint violation' };
            }
            if (data.data.email === 'error@example.com') {
                throw new Error('Unexpected error');
            }
            // Generate a unique id based on email for test purposes
            const id = Buffer.from(data.data.email).toString('base64').replace(/=/g, '').slice(0, 8);
            return {
                id,
                ...data.data,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        }),
        findUnique: jest.fn().mockResolvedValue(null),
    },
    organization: {
        create: jest.fn(async (data) => {
            if (data.data.email === 'duplicate@example.com' || data.data.name === 'Duplicate Org') {
                throw { code: 'P2002', message: 'Unique constraint violation' };
            }
            if (data.data.industryId === 'invalid-industry') {
                throw { code: 'P2003', message: 'Foreign key constraint failed on the field: (`industryId`)' };
            }
            return {
                id: '1',
                ...data.data,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        }),
        findUnique: jest.fn().mockResolvedValue({ id: '1', name: 'Test Org' }),
    },
};

module.exports = { prisma: mockPrisma }; 