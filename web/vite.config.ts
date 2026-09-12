import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [react(), VitePWA({ registerType: 'autoUpdate', includeAssets: ['icons/*'], workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg}'], runtimeCaching: [{ urlPattern: ({ url }) => url.pathname.startsWith('/api/') || url.pathname === '/health', handler: 'NetworkOnly' }] } })],
  build: { outDir: 'dist', emptyOutDir: true },
  server: { port: 5173, proxy: { '/api': 'http://127.0.0.1:3100', '/health': 'http://127.0.0.1:3100' } }
});
