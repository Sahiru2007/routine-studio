import {packager} from '@electron/packager'
import {mkdirSync} from 'node:fs'
import {resolve} from 'node:path'
import {spawnSync} from 'node:child_process'

const root=resolve(import.meta.dirname,'..')
const out=resolve(root,'artifacts','milestone-6a','package')
if(!/^E:[\\/]/i.test(root)||!/^E:[\\/]/i.test(out))throw Error('Packaging source and output must stay on E:')
for(const path of [out,resolve(root,'.runtime','temp')])mkdirSync(path,{recursive:true})
const buildEnv={...process.env,TEMP:resolve(root,'.runtime','temp'),TMP:resolve(root,'.runtime','temp'),electron_config_cache:'E:/AI/Cache/electron',PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD:'1'}
for(const [entry,args] of [[resolve(root,'scripts','build-extension.mjs'),[]],[resolve(root,'node_modules','electron-vite','bin','electron-vite.js'),['build']]]){const build=spawnSync(process.execPath,[entry,...args],{cwd:root,stdio:'inherit',env:buildEnv});if(build.status!==0)throw Error('Production build failed; no package was produced.')}
const paths=await packager({
 dir:root,
 out,
 name:'Routine Studio',
 executableName:'Routine Studio',
 platform:'win32',
 arch:'x64',
 asar:false,
 overwrite:true,
 prune:true,
 electronVersion:'45.0.0',
 ignore:[
  /^\/(?:\.git|\.runtime|artifacts|apps|packages|scripts|docs)(?:\/|$)/,
  /^\/(?:AGENTS\.md|electron\.vite\.config\.ts|tsconfig\.json)$/,
  /(?:^|\/)\.(?:env|npmrc)$/,
  /(?:^|\/).+\.(?:log|tsbuildinfo)$/
 ]
})
console.log('Unpacked Windows candidate: '+paths[0])
