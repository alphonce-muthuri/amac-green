import nextConfig from 'eslint-config-next'

const config = [
  {
    name: 'project/ignores',
    // Ignore any nested Next build outputs (some paths show up as `*/.next/...`).
    ignores: [
      '**/.next/**',
      '**/out/**',
      '**/build/**',
      '**/node_modules/**',
      // Your repo contains a nested duplicate folder (`./amac-green/*`).
      // ESLint was linting both copies, causing a bunch of unrelated errors.
      'amac-green/**',
    ],
  },
  ...nextConfig,
  {
    name: 'project/rules-overrides',
    rules: {
      // You previously disabled this in `.eslintrc.json`.
      'react/no-unescaped-entities': 'off',
      // Keep the same behavior you had before the upgrade.
      '@next/next/no-img-element': 'warn',

      // Next 16 / React 19 bring stricter React rules. Your codebase relies on
      // common patterns (mock state updates + nested render helpers) that were
      // not enforced previously, so we relax these to warnings/off to keep lint useful.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      'no-use-before-define': 'off',
      'react/no-unstable-nested-components': 'off',
    },
  },
]

export default config

