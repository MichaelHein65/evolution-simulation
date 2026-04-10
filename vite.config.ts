import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const configuredBase = env.VITE_BASE_PATH || '/'
  const base = configuredBase.endsWith('/') ? configuredBase : `${configuredBase}/`

  return {
    plugins: [react()],
    base,
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
    },
  }
})
