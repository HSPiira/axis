import { PrismaClient } from "@/generated/prisma"
import { mockDeep, DeepMockProxy } from 'jest-mock-extended'
import { jest } from '@jest/globals'

const mockPrisma = mockDeep<PrismaClient>()
export const prismaMock = mockPrisma

jest.mock('@/lib/prisma', () => ({
    __esModule: true,
    prisma: mockPrisma
})) 