import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `pnpm dev:local` (mode "local-src") points `quill-image-alt` at the library's
// source in ../src instead of the published package, for testing changes live.
// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  ...(mode === 'local-src' && {
    cacheDir: 'node_modules/.vite-local-src',
    resolve: {
      alias: { 'quill-image-alt': fileURLToPath(new URL('../src/index.ts', import.meta.url)) },
      dedupe: ['quill'],
    },
    server: { fs: { allow: ['..'] } },
  }),
}))
