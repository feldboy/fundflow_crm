/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.js'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.config.*',
        '**/*.test.*',
        'src/index.jsx',
        'public/',
        'build/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      'components': resolve(__dirname, './src/components'),
      'pages': resolve(__dirname, './src/pages'),
      'services': resolve(__dirname, './src/services'),
      'hooks': resolve(__dirname, './src/hooks'),
      'utils': resolve(__dirname, './src/utils'),
      'styles': resolve(__dirname, './src/styles'),
    },
  },
});
