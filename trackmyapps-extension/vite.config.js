import { defineConfig } from 'vite'
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import react from '@vitejs/plugin-react';


// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(),
    viteStaticCopy({
      targets: [
        { src: 'src/content.js', dest: '.' },
        { src: 'manifest.json', dest: '.' },
        { src: 'public/icon.png', dest: '.' },
        { src: 'public/success.svg', dest: '.' },
        { src: 'public/vite.svg', dest: '.' }
      ]
    }),
  ],
  
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html')
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  }
});
