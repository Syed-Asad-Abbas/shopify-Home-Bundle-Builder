import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../assets',
    emptyOutDir: false, // Don't empty the Shopify assets folder!
    minify: false, // Output unminified JS for readability
    cssMinify: false, // Output unminified CSS for readability
    rollupOptions: {
      input: resolve(__dirname, 'src/main.jsx'),
      output: {
        entryFileNames: 'bundle-builder.js',
        chunkFileNames: 'bundle-builder-[name].js',
        assetFileNames: 'bundle-builder.[ext]',
      },
    },
  },
})
