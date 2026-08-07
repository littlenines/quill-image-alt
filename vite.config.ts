/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [dts({ rollupTypes: true })],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'QuillImageAlt',
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['quill'],
      output: [
        { format: 'es', entryFileNames: 'index.es.js', globals: { quill: 'Quill' } },
        { format: 'cjs', entryFileNames: 'index.cjs.js', globals: { quill: 'Quill' } },
        {
          format: 'iife',
          name: 'QuillImageAlt',
          entryFileNames: 'index.iife.js',
          globals: { quill: 'Quill' },
          // Quill's UMD build doesn't expose `Quill.Module` directly - it
          // has to be pulled via `Quill.import('core/module')`. This module
          // does `import { Module } from 'quill'`, which the IIFE bundle
          // turns into a `Quill.Module` property read, so shim it in first.
          banner:
            '(function(){if(typeof Quill!=="undefined"&&!Quill.Module)try{Quill.Module=Quill.import("core/module");}catch(e){}})();',
        },
      ],
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  },
})
