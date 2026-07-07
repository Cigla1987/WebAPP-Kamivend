import { defineConfig } from 'electron-vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

const uiRoot = path.resolve(__dirname, '../../packages/ui/src');
const domainRoot = path.resolve(__dirname, '../../packages/domain/src');

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, 'src/main/index.ts'),
        },
      },
    },
    resolve: {
      alias: {
        '#': path.resolve(__dirname, './src'),
      },
    },
  },
  preload: {
    build: {
      externalizeDeps: {
        exclude: ['@better-auth/electron'],
      },
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, 'src/preload/index.ts'),
        },
      },
    },
  },
  renderer: {
    root: path.resolve(__dirname, 'src/renderer'),
    build: {
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, 'src/renderer/index.html'),
        },
      },
    },
    plugins: [react(), tailwindcss()],
    resolve: {
  alias: [
    {
      find: '#',
      replacement: path.resolve(__dirname, './src/renderer'),
    },
    {
      find: /^@vending\/ui$/,
      replacement: path.resolve(uiRoot, 'index.ts'),
    },
    {
      find: /^@vending\/ui\/(.*)$/,
      replacement: `${uiRoot}/$1`,
    },
    {
      find: /^@vending\/domain$/,
      replacement: path.resolve(domainRoot, 'index.ts'),
    },
    {
      find: /^#lib\/(.*)$/,
      replacement: `${uiRoot}/lib/$1`,
    },
    {
      find: /^#components\/(.*)$/,
      replacement: `${uiRoot}/components/$1`,
    },
    {
      find: /^#hooks\/(.*)$/,
      replacement: `${uiRoot}/hooks/$1`,
    },
  ],
},
  },
});
