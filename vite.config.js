import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5189,
    strictPort: true
  },
  build: {
    outDir: 'dist'
  }
});
