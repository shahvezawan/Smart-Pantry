import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Replace <repository-name> with your exact GitHub repository name
  base: '/Smart-Pantry/', 
})
