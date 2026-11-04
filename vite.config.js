import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Windows network shares do not reliably support native watch events.
      usePolling: true,
      interval: 750,
      binaryInterval: 1500,
      ignored: ['**/.git/**', '**/node_modules/**', '**/dist/**'],
    },
  },
})
