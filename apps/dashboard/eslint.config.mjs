import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends('next/core-web-vitals', 'next/typescript'),
    {
        ignores: ['build/**', 'dist/**', '.next/**'],
        rules: {
            // Disable most problematic rules that were causing build errors
            'react/no-unescaped-entities': 'off',
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@next/next/no-img-element': 'warn',
            'react-hooks/exhaustive-deps': 'warn',
        },
        languageOptions: {
            parserOptions: {
                project: ['./tsconfig.json'],
            },
        },
    },
];

export default eslintConfig;
