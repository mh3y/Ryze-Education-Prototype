import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
  {
    ignores: [
      'dist',
      'node_modules',
      'scripts',
      // Archive files intentionally kept for reference; not production code
      'pages/Pricing.archive.tsx',
      // Analytics file uses vendor-required patterns (arguments, .apply)
      'src/analytics.ts',
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Downgrade: setting state synchronously in an effect is a common/accepted pattern
      // (e.g. close mobile menu on route change, sync settings to sidebar state)
      'react-hooks/set-state-in-effect': 'warn',
      // React Compiler is not installed in this project — disable the static analysis check
      'react-hooks/react-compiler': 'off',
      // Relax rules that produce noise without fixing real bugs
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-empty-object-type': 'warn',
    },
  },
);
