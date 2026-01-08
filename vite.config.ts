import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate large PDF libraries for better caching
          'pdf-worker': ['pdfjs-dist'],
          'pdf-lib': ['pdf-lib'],
          // Separate drag-and-drop library
          'dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
        }
      }
    }
  }
})
