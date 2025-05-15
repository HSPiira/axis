export default {
    clearMocks: true,
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/src/__tests__/singleton.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^.prisma/client/default$': '<rootDir>/src/generated/prisma/default.js',
        '^.prisma/client$': '<rootDir>/src/generated/prisma',
        '@prisma/client': '<rootDir>/src/generated/prisma',
    },
    testMatch: ['**/__tests__/**/*.test.ts'],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            useESM: true,
        }],
    },
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    transformIgnorePatterns: [
        '/node_modules/(?!(jose|next-auth|@auth/core|@auth/prisma-adapter|next|@prisma/client)/)',
    ],
} 