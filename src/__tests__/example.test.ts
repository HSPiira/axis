import { describe, test, expect } from '@jest/globals'
import { prismaMock } from './singleton'
import { createMockUserWithRelations } from './utils/mock-data'

describe('Prisma Mock Example', () => {
    test('should mock a database query with relationships', async () => {
        const mockUserWithRelations = createMockUserWithRelations({
            email: 'test@example.com'
        })

        // Setup the mocks
        prismaMock.user.findUnique.mockResolvedValue(mockUserWithRelations)

        // Example of how you would test a function that uses prisma
        const result = await prismaMock.user.findUnique({
            where: {
                id: 'user_123'
            },
            include: {
                userRoles: {
                    include: {
                        role: true
                    }
                }
            }
        })

        expect(result).toEqual(mockUserWithRelations)
    })
}) 