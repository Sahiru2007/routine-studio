import { app,BrowserWindow,ipcMain,dialog,session } from 'electron'
import { join,resolve } from 'node:path'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { WorkflowStore } from './store'
import { IdSchema } from '../../../packages/workflow-schema'
const root=resolve(app.getAppPath())
const dataPath=process.env.ROUTINE_STUDIO_DATA || join(root,'.runtime','data')
if(!/^E:[\\/]/i.test(dataPath))throw Error('Application data must be on E:')
mkdirSync(dataPath,{recursive:true})
for(const name of ['userData','sessionData','logs','crashDumps']) {const path=join(dataPath,name);mkdirSync(path,{recursive:true});app.setPath(name,path)}
app.commandLine.appendSwitch('disk-cache-dir',join(dataPath,'cache'))
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache')
let store:WorkflowStore
let dirty=false
app.whenReady().then(()=>{
 store=new WorkflowStore(join(dataPath,'workflows.sqlite'));store.seed()
 const win=new BrowserWindow({width:1480,height:940,minWidth:1060,minHeight:700,backgroundColor:'#111419',title:'Routine Studio',webPreferences:{preload:join(fileURLToPath(new URL('..',import.meta.url)),'preload/index.cjs'),sandbox:true,contextIsolation:true,nodeIntegration:false}})
 win.setMenuBarVisibility(false)
 const dev=process.env.ELECTRON_RENDERER_URL
 const entry=join(fileURLToPath(new URL('..',import.meta.url)),'renderer/index.html')
 const trusted=(url:string)=> dev?url===dev||url===dev+'/':url===new URL('file:///'+entry.replaceAll('\\','/')).href
 const check=(event:Electron.IpcMainInvokeEvent|Electron.IpcMainEvent)=>{if(event.sender!==win.webContents||event.senderFrame!==win.webContents.mainFrame||!trusted(event.senderFrame.url))throw Error('Untrusted IPC sender')}
 for(const [name,handler] of Object.entries({
 list:()=>store.list(),save:(value:unknown)=>store.save(value),remove:(value:unknown)=>store.remove(IdSchema.parse(value)),status:()=>({dataPath,databasePath:join(dataPath,'workflows.sqlite')})
 }))ipcMain.handle('studio:'+name,(event,value)=>{check(event);try{return {ok:true,value:handler(value)}}catch(error){return {ok:false,error:error instanceof Error?error.message:'Operation failed'}}})
 ipcMain.on('studio:dirty',(event,value)=>{check(event);if(typeof value==='boolean')dirty=value})
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}))
 win.webContents.on('will-navigate',event=>event.preventDefault())
 session.defaultSession.setPermissionRequestHandler((_wc,_permission,callback)=>callback(false))
 win.on('close',event=>{if(dirty&&dialog.showMessageBoxSync(win,{type:'warning',buttons:['Keep editing','Discard changes'],defaultId:0,cancelId:0,title:'Unsaved changes',message:'Discard your unsaved workflow changes?'})!==1)event.preventDefault()})
 if(dev)win.loadURL(dev);else win.loadFile(entry)
})
app.on('window-all-closed',()=>app.quit())
app.on('will-quit',()=>store?.close())

