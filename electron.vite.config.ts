import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
 main: { build: { rollupOptions: { input: 'apps/desktop/main/index.ts', external: ['node:sqlite','playwright'] } } },
 preload: { build: { rollupOptions: { input: 'apps/desktop/preload/index.ts', output: { format: 'cjs', entryFileNames: 'index.cjs' } } } },
 renderer: { root: 'apps/desktop/renderer', plugins: [react()], build: { rollupOptions: { input: 'apps/desktop/renderer/index.html' } } }
})
