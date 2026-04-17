import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // necesario para que Docker exponga el puerto correctamente
    port: 5173,
    // Proxy: todas las llamadas a /api se redirigen al backend en dev.
    // En Docker, el target apunta al nombre del servicio de docker-compose.
    proxy: {
      '/api': {
        target: process.env['VITE_API_URL'] ?? 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
