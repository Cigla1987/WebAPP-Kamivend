import { defineConfig } from 'vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { nitro } from 'nitro/vite';
import svgr from 'vite-plugin-svgr';

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart({
      importProtection: {
        client: {
          files: ['**/*.server.*', '**/server/**'],
        },
      },
    }),
    nitro(),
    svgr(),
    viteReact({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
  optimizeDeps: {
    exclude: ['@vending/ui', '@vending/db', '@vending/auth', '@vending/domain'],
  },
  ssr: {
    noExternal: ['@vending/ui', '@vending/db', '@vending/auth', '@vending/domain'],
  },
});

export default config;
