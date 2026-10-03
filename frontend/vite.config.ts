import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import electron from 'vite-plugin-electron/simple';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    electron({
      main: {
        entry: 'electron/main.ts',
        vite: {
          build: {
            rollupOptions: {
              external: [/node_modules/, 'better-sqlite3', 'drizzle-orm', 'drizzle-orm/better-sqlite3', 'electron']
            }
          }
        }
      },
      preload: {
        input: 'electron/preload.ts',
      },
    }),
  ],
  base: './', // Use relative paths for electron
  build: {
    rollupOptions: {
      external: ['better-sqlite3']
    }
  }
});
