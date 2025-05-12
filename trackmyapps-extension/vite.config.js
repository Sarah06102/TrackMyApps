import { defineConfig } from 'vite'
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'src/content.js', dest: '.' },
        { src: 'public/manifest.json', dest: '.' },
        { src: 'public/icon.png', dest: '.' },
        { src: 'public/success.svg', dest: '.' },
        { src: 'public/vite.svg', dest: '.' } 
      ]
    })
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
