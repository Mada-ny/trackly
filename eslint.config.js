import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // Le projet n'utilise pas prop-types (pas de TypeScript non plus)
      'react/prop-types': 'off',
    },
  },
  {
    files: ['src/components/ui/**/*.{js,jsx}', '**/*[Pp]rovider.jsx'],
    rules: {
      // Fichiers "vendor" (pattern shadcn/ui) et providers de contexte :
      // co-localiser variants `cva`/hooks/constantes avec le composant est la
      // convention upstream — scinder casserait la compatibilité avec
      // `npx shadcn add` et la cohésion Context + Provider + hook.
      'react-refresh/only-export-components': 'off',
    },
  },
])
