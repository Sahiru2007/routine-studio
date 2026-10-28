import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
const root = resolve(import.meta.dirname, '..')
if (!/^E:/i.test(root)) throw Error('Routine Studio must stay on E:')
for (const dir of ['temp','data','cache']) mkdirSync(resolve(root,'.runtime',dir),{recursive:true})
const env = {...process.env, TEMP:resolve(root,'.runtime/temp'),TMP:resolve(root,'.runtime/temp'), electron_config_cache:'E:/AI/Cache/electron', PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD:'1'}
delete env.ELECTRON_RUN_AS_NODE
delete env.NODE_COMPILE_CACHE
const child = spawn(process.execPath, [resolve(root,'node_modules/electron-vite/bin/electron-vite.js'),process.argv[2] || 'preview'],{cwd:root,env,stdio:'inherit'})
child.on('exit',code=>process.exit(code ?? 1))


