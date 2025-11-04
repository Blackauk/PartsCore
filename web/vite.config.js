import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

// This ensures __dirname works in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // 👇 Important for GitHub Pages
  // This must exactly match your repo name and is case-sensitive
  base: '/PartsCore/',

  // Optional: clean alias setup so you can use "@/..." imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  // Optional: local dev server settings
  server: {
    open: true,        // automatically open browser
    port: 5173,        // local dev port
    hmr: { overlay: false },  // suppress full-screen error overlay
  },

  // Optional: build settings (safe defaults)
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
