import {build} from 'vite'
import {copyFileSync,mkdirSync} from 'node:fs'
import {resolve} from 'node:path'
const root=resolve(import.meta.dirname,'..'),outDir=resolve(root,'out/recorder-extension')
mkdirSync(outDir,{recursive:true})
for(const name of ['background','content'])await build({configFile:false,logLevel:'warn',build:{outDir,emptyOutDir:false,minify:false,lib:{entry:resolve(root,'apps/recorder-extension/'+name+'.ts'),name:'RoutineRecorder',formats:['iife'],fileName:()=>name+'.js'}}})
copyFileSync(resolve(root,'apps/recorder-extension/manifest.json'),resolve(outDir,'manifest.json'))
