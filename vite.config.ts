import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set the base path for assets to be relative.
  // This is crucial for the Electron build to find JS and CSS files.
  base: './',
  define: {
    // This makes your VITE_GEMINI_API_KEY from your .env file
    // available as process.env.API_KEY in your app's code.
    'process.env.API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY)
  }
})
