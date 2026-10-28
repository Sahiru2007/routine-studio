import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
 main: { build: { rollupOptions: { input: {index:'apps/desktop/main/index.ts',worker:'apps/desktop/worker/index.ts','csv-worker':'apps/desktop/worker/csv.ts'}, external: ['node:sqlite','playwright'] } } },
 preload: { build: { rollupOptions: { input: 'apps/desktop/preload/index.ts', output: { format: 'cjs', entryFileNames: 'index.cjs' } } } },
 renderer: { root: 'apps/desktop/renderer', plugins: [react()], build: { rollupOptions: { input: 'apps/desktop/renderer/index.html' } } }
})
