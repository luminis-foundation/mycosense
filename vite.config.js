import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  // Treat .wasm files as static assets so sql.js can locate them via ?url import
  assetsInclude: ['**/*.wasm'],
  test: {
    environment: 'node',
    globals: false,
  },
})
