const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');

const mockPrisma = {
    user: {
        create: jest.fn(async (data) => {
            console.log('MOCK prisma.user.create called with:', data);
            if (data.data.email === 'test@example.com') {
                console.log('MOCK prisma.user.create throwing unique constraint error');
                throw new Error('Unique constraint failed on the fields: (`email`)');
            }
            console.log('MOCK prisma.user.create returning:', { id: '1', ...data.data });
            return { id: '1', ...data.data };
        }),
        findUnique: jest.fn().mockResolvedValue(null),
    },
    organization: {
        findUnique: jest.fn().mockResolvedValue({ id: '1', name: 'Test Org' }),
    },
};

module.exports = { prisma: mockPrisma }; 