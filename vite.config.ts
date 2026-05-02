import { defineConfig } from 'vite';
import { devtools } from '@tanstack/devtools-vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import { tanstackStart } from '@tanstack/react-start/plugin/vite';

import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const config = defineConfig({
  plugins: [
    devtools(),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    tanstackStart({
      importProtection: {
        client: {
          files: ['**/*.server.*', '**/server/**'],
        },
        // server: {
        //   // Block browser-only libraries from the server
        //   specifiers: ['localforage'],
        // },
      },
    }),
    viteReact({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
});

export default config;
