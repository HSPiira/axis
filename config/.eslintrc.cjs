module.exports = {
    extends: ['next/core-web-vitals'],
    rules: {
        '@typescript-eslint/no-unused-expressions': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-this-alias': 'off',
        'no-undef': 'off',
        'no-prototype-builtins': 'off',
        'no-unused-private-class-members': 'off',
        'no-redeclare': 'off',
        'no-constant-binary-expression': 'off',
        'no-empty': 'off',
        'no-useless-escape': 'off',
        'no-cond-assign': 'off',
        '@typescript-eslint/no-require-imports': 'off',
        '@typescript-eslint/no-unsafe-function-type': 'off',
        'react/react-in-jsx-scope': 'off'
    },
    overrides: [
        {
            files: ['*.d.ts'],
            rules: {
                '@typescript-eslint/no-unused-vars': 'off',
                '@typescript-eslint/no-explicit-any': 'off'
            }
        },
        {
            files: ['src/generated/**/*'],
            rules: {
                '@typescript-eslint/no-unused-vars': 'off',
                '@typescript-eslint/no-explicit-any': 'off',
                '@typescript-eslint/no-unused-expressions': 'off',
                'no-undef': 'off',
                'no-redeclare': 'off'
            }
        },
        {
            files: ['**/*.test.ts', '**/*.test.tsx'],
            rules: {
                '@typescript-eslint/no-unused-vars': 'off',
                '@typescript-eslint/no-explicit-any': 'off',
                'no-undef': 'off'
            }
        }
    ],
    ignorePatterns: [
        'src/generated/**/*',
        'node_modules/**/*',
        '.next/**/*',
        'out/**/*',
        'build/**/*',
        'dist/**/*',
        'src/generated/prisma/**/*',
        'src/generated/prisma/runtime/**/*',
        'src/generated/prisma/wasm.js',
        '**/*.test.ts',
        '**/*.test.tsx'
    ]
} 