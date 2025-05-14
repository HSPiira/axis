module.exports = {
    extends: ['next/core-web-vitals'],
    rules: {
        '@typescript-eslint/no-unused-expressions': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', {
            'varsIgnorePattern': '^_',
            'argsIgnorePattern': '^_',
            'ignoreRestSiblings': true
        }],
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-this-alias': 'off',
        'no-undef': 'warn',
        'no-prototype-builtins': 'off',
        'no-unused-private-class-members': 'warn',
        'no-redeclare': 'warn',
        'no-constant-binary-expression': 'warn',
        'no-empty': 'warn',
        'no-useless-escape': 'warn',
        'no-cond-assign': 'warn',
        '@typescript-eslint/no-require-imports': 'warn',
        '@typescript-eslint/no-unsafe-function-type': 'warn'
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
        'src/generated/prisma/wasm.js'
    ]
} 