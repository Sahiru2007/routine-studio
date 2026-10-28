import { app,BrowserWindow,ipcMain,dialog,session } from 'electron'
import { join,resolve } from 'node:path'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { WorkflowStore } from './store'
import { IdSchema } from '../../../packages/workflow-schema'
import {Recorder} from './recorder'
import {startDemo} from '../../../packages/demo-site/server'
import {Runner} from './runner'
import {DataStore} from './data'
import {Batches} from './batches'
import {Assistance} from './assistance'
const root=resolve(app.getAppPath())
const dataPath=process.env.ROUTINE_STUDIO_DATA || join(root,'.runtime','data')
if(!/^E:[\\/]/i.test(dataPath))throw Error('Application data must be on E:')
mkdirSync(dataPath,{recursive:true})
for(const name of ['userData','sessionData','logs','crashDumps']) {const path=join(dataPath,name);mkdirSync(path,{recursive:true});app.setPath(name,path)}
app.commandLine.appendSwitch('disk-cache-dir',join(dataPath,'cache'))
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache')
let store:WorkflowStore
let recorder:Recorder
let runner:Runner
let batches:Batches
let assistance:Assistance
let demo:Awaited<ReturnType<typeof startDemo>>|null=null
let quitting=false
let dirty=false
app.whenReady().then(()=>{
 store=new WorkflowStore(join(dataPath,'workflows.sqlite'));store.seed()
 recorder=new Recorder(root,dataPath,store)
 runner=new Runner(root,dataPath,store,recorder)
 batches=new Batches(store,runner)
 assistance=new Assistance()
 if(process.env.ROUTINE_STUDIO_TEST==='1')Object.assign(globalThis,{studioTestBatches:batches})
 if(process.env.ROUTINE_STUDIO_TEST==='1')Object.assign(globalThis,{studioTestRunner:runner})
 if(process.env.ROUTINE_STUDIO_TEST==='1')Object.assign(globalThis,{studioTestRecorder:recorder})
 const win=new BrowserWindow({width:1480,height:940,minWidth:1060,minHeight:700,backgroundColor:'#111419',title:'Routine Studio',webPreferences:{preload:join(fileURLToPath(new URL('..',import.meta.url)),'preload/index.cjs'),sandbox:true,contextIsolation:true,nodeIntegration:false}})
 win.setMenuBarVisibility(false)
 const data=new DataStore(root,store)
 const dev=process.env.ELECTRON_RENDERER_URL
 const entry=join(fileURLToPath(new URL('..',import.meta.url)),'renderer/index.html')
 const trusted=(url:string)=> dev?url===dev||url===dev+'/':url===new URL('file:///'+entry.replaceAll('\\','/')).href
 const check=(event:Electron.IpcMainInvokeEvent|Electron.IpcMainEvent)=>{if(event.sender!==win.webContents||event.senderFrame!==win.webContents.mainFrame||!trusted(event.senderFrame.url))throw Error('Untrusted IPC sender')}
 for(const [name,handler] of Object.entries({
 assistanceStatus:()=>assistance.status(),assistanceCheck:()=>assistance.check(),assistanceRun:(value:unknown)=>assistance.run(value),assistanceCancel:()=>assistance.cancel(),assistanceCandidates:(value:unknown)=>recorder.candidates(value),
 runNotes:(value:unknown)=>data.notes(value),runNote:(value:unknown)=>data.note(value),
 batchPrepare:(value:unknown)=>batches.prepare(value),batchStart:(value:unknown)=>batches.start(value),batchStatus:(value:unknown)=>batches.detail(value),batchList:()=>batches.list(),batchPause:(value:unknown)=>batches.pause(value),batchResume:(value:unknown)=>batches.resume(value),batchStop:(value:unknown)=>batches.stop(value),batchApprove:(value:unknown)=>batches.approve(value),batchNote:(value:unknown)=>batches.note(value),batchRemaining:(value:unknown)=>batches.remaining(value),resultExport:(value:unknown)=>data.export(win,value,id=>batches.get({id}),id=>runner.get({runId:id})),
 dataImport:()=>data.import(win),dataList:()=>data.list('datasets'),dataSave:(value:unknown)=>data.save('datasets',value),dataDelete:(value:unknown)=>data.remove('datasets',value),mappingList:()=>data.list('mappings'),mappingSave:(value:unknown)=>data.save('mappings',value),mappingDelete:(value:unknown)=>data.remove('mappings',value),mappingPreview:(value:unknown)=>data.preview(value),
 list:()=>store.list(),save:(value:unknown)=>store.save(value),remove:(value:unknown)=>store.remove(IdSchema.parse(value)),status:()=>({dataPath,databasePath:join(dataPath,'workflows.sqlite')}),
 recordingStatus:()=>recorder.status(),recordingStart:(value:unknown)=>recorder.start(value),recordingStop:()=>recorder.stop(),recordingCancel:()=>recorder.cancel(),recordingSave:(value:unknown)=>recorder.save(value),inspectionOpen:()=>recorder.openInspection(),inspectionCheck:(value:unknown)=>recorder.inspect(value),
 runPrepare:(value:unknown)=>runner.prepare(value),runStart:(value:unknown)=>runner.start(value),runStatus:(value:unknown)=>runner.get(value),runPause:(value:unknown)=>runner.pause(value),runResume:(value:unknown)=>runner.resume(value),runStop:(value:unknown)=>runner.stop(value),runApprove:(value:unknown)=>runner.approve(value),runList:()=>runner.list(),
 demoStart:async()=>{if(!demo)demo=await startDemo(join(dataPath,'demo'),4177);return {url:demo.url}},demoReset:()=>{if(!demo)throw Error('Start the demo first');demo.reset()}
 }))ipcMain.handle('studio:'+name,async(event,value)=>{check(event);try{return {ok:true,value:await handler(value)}}catch(error){return {ok:false,error:error instanceof Error?error.message:'Operation failed'}}})
 ipcMain.on('studio:dirty',(event,value)=>{check(event);if(typeof value==='boolean')dirty=value})
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}))
 win.webContents.on('will-navigate',event=>event.preventDefault())
 session.defaultSession.setPermissionRequestHandler((_wc,_permission,callback)=>callback(false))
 win.on('close',event=>{if(dirty&&dialog.showMessageBoxSync(win,{type:'warning',buttons:['Keep editing','Discard changes'],defaultId:0,cancelId:0,title:'Unsaved changes',message:'Discard your unsaved workflow changes?'})!==1)event.preventDefault()})
 win.on('close',event=>{if(event.defaultPrevented||quitting)return;if(['starting','recording','stopping','review','interrupted'].includes(recorder.status().state)&&dialog.showMessageBoxSync(win,{type:'warning',buttons:['Keep app open','Cancel recording and close'],defaultId:0,cancelId:0,title:'Unsaved recording',message:'Close Routine Studio and discard this unsaved recording?'})!==1)event.preventDefault()})
 win.on('close',event=>{if(event.defaultPrevented||quitting)return;if(runner.active()&&dialog.showMessageBoxSync(win,{type:'warning',buttons:['Keep app open','Stop run and close'],defaultId:0,cancelId:0,title:'Active supervised run',message:'Stop the run and close? An in-flight action may have changed data. Stop is not undo.'})!==1)event.preventDefault()})
 win.on('close',event=>{if(event.defaultPrevented||quitting||!batches.active()||runner.active())return;if(dialog.showMessageBoxSync(win,{type:'warning',buttons:['Keep app open','Stop batch and close'],defaultId:0,cancelId:0,title:'Active supervised batch',message:'Stop the batch and close? In-flight changes cannot be undone; queued rows will not start.'})!==1)event.preventDefault()})
 if(dev)win.loadURL(dev);else win.loadFile(entry)
})
app.on('window-all-closed',()=>app.quit())
app.on('before-quit',event=>{if(quitting)return;event.preventDefault();quitting=true;batches?.shutdown();Promise.all([runner?.shutdown(),recorder?.shutdown()]).finally(()=>{void demo?.close().finally(()=>app.quit());if(!demo)app.quit()})})
app.on('will-quit',()=>store?.close())

