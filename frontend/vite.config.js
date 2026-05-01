<<<<<<< HEAD
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
=======
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
>>>>>>> b17e05f9477a53c4c9ea788ef4d509aded512ca2

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
<<<<<<< HEAD
  server: {
    port: 5173,
    proxy: {
      // Proxy /api/* → Django backend (update port if needed)
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
=======
})
>>>>>>> b17e05f9477a53c4c9ea788ef4d509aded512ca2
