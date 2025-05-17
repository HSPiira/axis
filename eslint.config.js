import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next/dist/index.js';
import globals from 'globals';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
    js.configs.recommended,
    {
        files: ['**/*.{ts,tsx}'],
        plugins: {
            '@next/next': nextPlugin,
            '@typescript-eslint': tseslint,
        },
        languageOptions: {
            parser: tsParser,
            globals: {
                ...globals.browser,
                ...globals.node,
            },
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
        },
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
    },
    {
        files: ['**/*.d.ts'],
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
        files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
        languageOptions: {
            globals: {
                jest: 'readonly',
                describe: 'readonly',
                it: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
            },
        },
        rules: {
            // You can add test-specific rule overrides here
        },
    }
]; 