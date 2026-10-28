import {build,Platform,Arch} from 'electron-builder'
import {mkdirSync} from 'node:fs'
import {resolve} from 'node:path'
import {spawnSync} from 'node:child_process'

const root=resolve(import.meta.dirname,'..')
const label=process.env.ROUTINE_STUDIO_INSTALLER_LABEL||'final'
if(!/^[a-z0-9-]+$/i.test(label))throw Error('Installer label must contain only letters, numbers, and hyphens.')
const output=resolve(root,'artifacts','milestone-6b',label)
const temp=resolve(root,'.runtime','installer-build-temp')
for(const path of [output,temp])mkdirSync(path,{recursive:true})
for(const path of [root,output,temp,process.env.ELECTRON_BUILDER_CACHE||''])if(path&&!/^E:[\\/]/i.test(path))throw Error('Installer source, output, temp, and cache must stay on E:')
const env={...process.env,TEMP:temp,TMP:temp,electron_config_cache:'E:/AI/Cache/electron',PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD:'1',CSC_IDENTITY_AUTO_DISCOVERY:'false'}
for(const [entry,args] of [[resolve(root,'scripts','build-extension.mjs'),[]],[resolve(root,'node_modules','electron-vite','bin','electron-vite.js'),['build']]]){
 const result=spawnSync(process.execPath,[entry,...args],{cwd:root,stdio:'inherit',env})
 if(result.status!==0)throw Error('Production build failed; no installer was produced.')
}
await build({
 targets:Platform.WINDOWS.createTarget(['nsis'],Arch.x64),
 config:{
  appId:'io.github.sahiru2007.routine-studio',
  productName:'Routine Studio',
  electronVersion:'45.0.0',
  asar:false,
  npmRebuild:false,
  publish:null,
  directories:{output},
  files:['out/**/*','fixtures/csv/packaged-customers.csv','package.json','node_modules/**/*','!node_modules/.cache/**/*','!**/*.map','!**/.env*','!**/*.log'],
  win:{target:['nsis'],signAndEditExecutable:false,artifactName:'Routine-Studio-Setup-${version}-unsigned.${ext}'},
  nsis:{oneClick:false,perMachine:false,allowElevation:false,allowToChangeInstallationDirectory:true,createDesktopShortcut:false,createStartMenuShortcut:false,runAfterFinish:false,deleteAppDataOnUninstall:false,artifactName:'Routine-Studio-Setup-${version}-unsigned.${ext}'}
 }
})
console.log('Unsigned assisted installer: '+output)
