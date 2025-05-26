import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import {nodePolyfills} from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(),
    nodePolyfills({
      exclude:['fs'],
      include: ['buffer', 'process'],
      globals: true,
      protocolImports: true,
    }),
  ],
  define: {
    'process.env' :{}
  },
   server: {
    watch: {
      usePolling: true, // Needed for Docker/WSL2 or some file systems
      interval: 1000,  // Polling interval (ms)
    },
    hmr: true,         // Enable Hot Module Replacement
  },
})
