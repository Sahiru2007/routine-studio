import {_electron as electron} from 'playwright'
import assert from 'node:assert/strict'
import {existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs'
import {spawnSync} from 'node:child_process'
import {join,resolve} from 'node:path'

const root=resolve(import.meta.dirname,'..')
const baseline=resolve(root,'artifacts/release/0.8.0-rc.1/installer/Routine-Studio-Setup-0.8.0-rc.1-unsigned.exe')
const candidate=resolve(root,'artifacts/release/0.8.0-rc.2/installer/Routine-Studio-Setup-0.8.0-rc.2-unsigned.exe')
const install=resolve(root,'.runtime/Routine Studio Branding RC2 Installed With Spaces')
const data=resolve(root,'.runtime/branding-installer-data')
const artifacts=resolve(root,'artifacts/windows-branding-rc2')
const executable=join(install,'Routine Studio.exe')
const uninstaller=join(install,'Uninstall Routine Studio.exe')
const browserPath='E:/AI/Caches/ms-playwright'
const resumeAfterUninstall=process.argv.includes('--resume-after-uninstall')
const resume=process.argv.includes('--resume-after-upgrade')||resumeAfterUninstall
for(const path of [root,baseline,candidate,install,data,artifacts,browserPath])assert.match(path,/^E:[\\/]/i)
for(const file of [baseline,candidate])assert.ok(existsSync(file),'Missing installer: '+file)
if(!resume){
 assert.equal(existsSync(install),false,'Refusing to overwrite an existing verification installation: '+install)
 assert.equal(existsSync(data),false,'Refusing to overwrite existing verification data: '+data)
}else{
 assert.ok(existsSync(join(data,'workflows.sqlite')),'Resume requested without isolated upgrade data')
 if(!resumeAfterUninstall)assert.ok(existsSync(executable),'Resume requested without the isolated upgraded executable')
}
mkdirSync(artifacts,{recursive:true})

function run(file,args,options={}){
 const result=spawnSync(file,args,{windowsHide:true,encoding:'utf8',timeout:180000,...options})
 assert.equal(result.status,0,`${file} failed (${result.status}): ${result.stdout}\n${result.stderr}`)
 return result.stdout.trim()
}
function installVersion(file){
 run(file,['/S','/currentuser',`/D=${install}`])
 Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,3000)
 assert.ok(existsSync(executable),'Installed executable missing')
}
function waitRemoved(path){
 const signal=new Int32Array(new SharedArrayBuffer(4)),deadline=Date.now()+30000
 while(existsSync(path)&&Date.now()<deadline)Atomics.wait(signal,0,0,250)
}
function powershell(script,args=[]){return run('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',resolve(root,'scripts',script),...args])}
function state(){
 const command=`$entries=@(Get-ChildItem 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall' -ErrorAction SilentlyContinue|ForEach-Object{Get-ItemProperty $_.PSPath}|Where-Object{$_.DisplayName -like 'Routine Studio*'}|Select-Object DisplayName,DisplayVersion,Publisher,DisplayIcon,UninstallString,QuietUninstallString); $desktop=Join-Path ([Environment]::GetFolderPath('Desktop')) 'Routine Studio.lnk'; $start=Join-Path ([Environment]::GetFolderPath('StartMenu')) 'Programs\\Routine Studio.lnk'; $shell=New-Object -ComObject WScript.Shell; function Link($p){if(Test-Path -LiteralPath $p){$l=$shell.CreateShortcut($p);[ordered]@{path=$p;target=$l.TargetPath;icon=$l.IconLocation}}}; [ordered]@{entries=$entries;entry=($entries|Select-Object -First 1);desktop=(Link $desktop);start=(Link $start)}|ConvertTo-Json -Depth 5 -Compress`
 return JSON.parse(run('powershell.exe',['-NoProfile','-Command',command]))
}
function versionInfo(path){
 const command=`$v=(Get-Item -LiteralPath '${path.replaceAll("'","''")}').VersionInfo; [ordered]@{fileDescription=$v.FileDescription;productName=$v.ProductName;companyName=$v.CompanyName;fileVersion=$v.FileVersion;productVersion=$v.ProductVersion;legalCopyright=$v.LegalCopyright}|ConvertTo-Json -Compress`
 return JSON.parse(run('powershell.exe',['-NoProfile','-Command',command]))
}
function extractIcon(path,name){
 const output=join(artifacts,name)
 const command=`Add-Type -AssemblyName System.Drawing; $i=[System.Drawing.Icon]::ExtractAssociatedIcon('${path.replaceAll("'","''")}'); $b=$i.ToBitmap(); $b.Save('${output.replaceAll("'","''")}',[System.Drawing.Imaging.ImageFormat]::Png); $b.Dispose(); $i.Dispose()`
 run('powershell.exe',['-NoProfile','-Command',command]);return output
}
const env={...process.env,ROUTINE_STUDIO_DATA:data,ROUTINE_STUDIO_BROWSER_PATH:browserPath,ROUTINE_STUDIO_TEST:'1',TEMP:join(data,'temp'),TMP:join(data,'temp')}
delete env.ELECTRON_RUN_AS_NODE;delete env.NODE_COMPILE_CACHE;delete env.ELECTRON_RENDERER_URL
let app,page
async function launch(){app=await electron.launch({executablePath:executable,cwd:install,env});page=await app.firstWindow();await page.getByRole('heading',{name:'Workflow library',exact:true}).waitFor()}
async function close(){if(app){await page.evaluate(()=>window.studio.dirty(false)).catch(()=>{});await app.close();app=null}}

try{
 let saved
 if(!resume){
  installVersion(baseline)
  await launch()
  saved=await page.evaluate(()=>window.studio.save({formatVersion:2,id:crypto.randomUUID(),title:'Branding upgrade retention workflow',description:'Isolated synthetic installer fixture',example:false,revision:0,updatedAt:new Date().toISOString(),inputs:[],steps:[{id:crypto.randomUUID(),label:'Open example',type:'navigate',url:'https://example.com'}]}))
  await close()
  installVersion(candidate)
 }else{
  if(resumeAfterUninstall)installVersion(candidate)
  await launch();saved=(await page.evaluate(()=>window.studio.list())).find(workflow=>workflow.title==='Branding upgrade retention workflow');await close();assert.ok(saved,'Resume could not find the retained upgrade fixture')
 }
 assert.equal(JSON.parse(readFileSync(join(install,'resources','app','package.json'),'utf8')).version,'0.8.0-rc.2')
 await launch()
 assert.ok((await page.evaluate(()=>window.studio.list())).some(workflow=>workflow.id===saved.id),'Upgrade lost the isolated workflow')
 await page.getByRole('button',{name:'Settings & status',exact:true}).click()
 await page.getByText('Routine Studio · v0.8.0-rc.2 unsigned local candidate · PACKAGED',{exact:true}).waitFor()
 await page.screenshot({path:join(artifacts,'01-installed-application.png'),animations:'disabled'})
 await close()
 const installed=state()
 assert.equal(installed.entries.length,1,'Expected exactly one Routine Studio uninstall entry')
 assert.equal(installed.entry.DisplayName,'Routine Studio 0.8.0-rc.2')
 assert.equal(installed.entry.DisplayVersion,'0.8.0-rc.2')
 assert.equal(installed.entry.Publisher,'Sahiru Bodahewa')
 assert.ok(installed.entry.UninstallString.includes(uninstaller),'Uninstall registration does not target the isolated installation')
 assert.ok(installed.entry.DisplayIcon.includes(join(install,'uninstallerIcon.ico')),'Installed apps icon does not target the branded uninstall icon')
 for(const shortcut of [installed.desktop,installed.start]){assert.ok(shortcut,'Expected shortcut missing');assert.equal(resolve(shortcut.target),executable)}
 const info=versionInfo(executable)
 assert.deepEqual({fileDescription:info.fileDescription,productName:info.productName,companyName:info.companyName},{fileDescription:'Routine Studio',productName:'Routine Studio',companyName:'Sahiru Bodahewa'})
 const exeIcon=extractIcon(executable,'02-executable-icon.png'),installerIcon=extractIcon(candidate,'03-installer-icon.png'),uninstallerIcon=extractIcon(uninstaller,'04-uninstaller-icon.png')
 const desktopLaunch=JSON.parse(powershell('shortcut-launch-test.ps1',['-Shortcut',installed.desktop.path,'-ExpectedExecutable',executable,'-Screenshot',join(artifacts,'05-desktop-shortcut-launch.png'),'-DataPath',data,'-BrowserPath',browserPath]))
 const startLaunch=JSON.parse(powershell('shortcut-launch-test.ps1',['-Shortcut',installed.start.path,'-ExpectedExecutable',executable,'-Screenshot',join(artifacts,'06-start-shortcut-launch.png'),'-DataPath',data,'-BrowserPath',browserPath]))
 assert.equal(desktopLaunch.windowTitle,'Routine Studio');assert.equal(startLaunch.windowTitle,'Routine Studio')
 run(uninstaller,['/S','/currentuser'])
 Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,3000)
 waitRemoved(executable)
 assert.equal(existsSync(executable),false,'Uninstall left application binaries')
 const removed=state();assert.equal(removed.entries.length,0);assert.ok(!removed.desktop?.path);assert.ok(!removed.start?.path)
 assert.ok(existsSync(join(data,'workflows.sqlite')),'Uninstall removed external application data')
 installVersion(candidate)
 await launch();assert.ok((await page.evaluate(()=>window.studio.list())).some(workflow=>workflow.id===saved.id),'Reinstall did not reopen retained data');await close()
 const finalState=state()
 const result={checkedAt:new Date().toISOString(),baseline,candidate,install,data,executable,shortcuts:{desktop:finalState.desktop,start:finalState.start},installedApp:finalState.entry,versionInfo:info,icons:{exeIcon,installerIcon,uninstallerIcon},shortcutLaunches:{desktop:desktopLaunch,start:startLaunch},retainedWorkflowId:saved.id,checks:['0.8.0-rc.1 installed per-user into an E: path containing spaces','0.8.0-rc.2 upgraded in place and retained isolated workflow data','Executable metadata and established icon are embedded','Desktop and Start menu shortcuts target and open the installed application','Installed apps registration reports product version publisher install path and icon','Uninstall removed binaries shortcuts and registration while retaining data','Reinstall reopened retained compatible data']}
 writeFileSync(join(artifacts,'results.json'),JSON.stringify(result,null,2))
 console.log('PASS:',result.checks.join('\nPASS: '))
 console.log('Installed candidate left ready for review:',executable)
}finally{await close().catch(()=>{})}
