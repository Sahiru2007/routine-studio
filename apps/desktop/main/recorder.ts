import {createServer,type Server} from 'node:http'
import {randomBytes} from 'node:crypto'
import {cpSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs'
import {join,resolve} from 'node:path'
import type {BrowserContext,Worker,Page} from 'playwright'
import {inspectionBanner,inspectPage,inspectionCandidates} from './inspection'
import {z} from 'zod'
import {EventCollector,normalize,RecordingDocument,RecordingStateSchema,StartRecording,SaveRecording,type RecordingState,type RecordingDocumentType} from '../../../packages/recorder-schema'
import type {WorkflowStore} from './store'

type Lifecycle={arm:()=>Promise<void>;stop:()=>Promise<void>;cancel:()=>Promise<void>;health:()=>Promise<{active:boolean;failed:boolean;targetTab:number}>}
export class Recorder{
 private current:RecordingState={state:'idle',sessionId:null,eventCount:0,warnings:[],message:'Ready to record one dedicated browser tab.',workflow:null}
 private collector:EventCollector|null=null
 private context:BrowserContext|null=null
 private worker:Worker|null=null
 private server:Server|null=null
 private monitor:ReturnType<typeof setInterval>|null=null
 private extensionOrigin=''
 private token=''
 private startedAt=''
 private lastHeartbeat=0
 private review:RecordingDocumentType|null=null
 private generation=0
 private testPort:number|null=null
 private executableUsed=''
 private closing:Promise<void>=Promise.resolve()
 private originalPage:Page|null=null
 private inspectionBusy=false
 private executionOwned=false
 private batchReserved=false
 private executionGuard=()=>true
 setExecutionGuard(guard:()=>boolean){this.executionGuard=guard}
 constructor(private root:string,private dataPath:string,private store:WorkflowStore){}
 status(){return RecordingStateSchema.parse({...this.current,eventCount:this.collector?.events.length??0,targets:this.collector?.events.flatMap(e=>e.payload.type==='click'||e.payload.type==='fill'?[e.payload.target]:[])??[]})}
 private warn(message:string){if(!this.current.warnings.includes(message)&&this.current.warnings.length<100)this.current.warnings.push(message)}
 private async lifecycle(method:keyof Lifecycle){
 if(!this.worker)throw Error('Recorder extension is disconnected')
 const request=this.worker.evaluate(async name=>{const api=(globalThis as unknown as {studioRecorder:Lifecycle}).studioRecorder;if(!api)throw Error('Extension not ready');return api[name]()},method)
 let timer:ReturnType<typeof setTimeout>|undefined
 try{return await Promise.race([request,new Promise<never>((_ok,fail)=>{timer=setTimeout(()=>fail(Error('Extension lifecycle request timed out')),6000)})])}finally{if(timer)clearTimeout(timer)}
 }
 private async channel(){
 this.token=randomBytes(32).toString('hex')
 this.server=createServer(async(req,res)=>{
 const reject=(code:number)=>{res.writeHead(code);res.end()}
 if(req.method!=='POST'||req.headers.authorization!=='Bearer '+this.token||req.headers.origin!==this.extensionOrigin||!this.extensionOrigin)return reject(403)
 if(!['/event','/heartbeat','/warning'].includes(req.url??''))return reject(404)
 try{
 let size=0;const chunks:Buffer[]=[];for await(const chunk of req){size+=chunk.length;if(size>65536){reject(413);req.destroy();return}chunks.push(chunk)}
 const body=JSON.parse(Buffer.concat(chunks).toString('utf8'))
 if(!['recording','stopping'].includes(this.current.state))return reject(409)
 if(req.url==='/event'){
 const event=this.collector!.accept(body)
 if(event.payload.type==='warning')this.warn(event.payload.message)
 }else{
 const parsed=z.object({sessionId:z.uuid(),message:z.string().max(300).optional()}).strict().parse(body)
 if(parsed.sessionId!==this.current.sessionId)return reject(409)
 if(req.url==='/heartbeat')this.lastHeartbeat=Date.now()
 else if(parsed.message)this.warn(parsed.message)
 }
 res.writeHead(204);res.end()
 }catch{reject(400)}
 })
 await new Promise<void>((ok,fail)=>{this.server!.once('error',fail);this.server!.listen(0,'127.0.0.1',ok)})
 return 'http://127.0.0.1:'+(this.server.address() as {port:number}).port
 }
 async start(value:unknown){
 const {url}=StartRecording.parse(value)
 if(!this.executionGuard())throw Error('Previous execution worker is still alive/unconfirmed; recording is blocked.')
 if(this.executionOwned||this.batchReserved)throw Error('Recording is blocked while execution/batch owns the managed browser/profile.')
 if(this.inspectionBusy)throw Error('Wait for target inspection to finish before starting recording.')
 if(['starting','recording','stopping','review','interrupted'].includes(this.current.state))throw Error('Finish or cancel the current recording first.')
 this.current.state='starting'
 await this.release()
 const generation=++this.generation,id=crypto.randomUUID()
 this.collector=new EventCollector(id);this.review=null;this.startedAt=new Date().toISOString()
 this.current={state:'starting',sessionId:id,eventCount:0,warnings:[],message:'Launching dedicated Chromium and recorder extension…',workflow:null}
 try{
 const endpoint=await this.channel()
 const extension=join(this.dataPath,'recorder-sessions',id,'extension'),profile=join(this.dataPath,'automation-profile')
 mkdirSync(extension,{recursive:true});mkdirSync(profile,{recursive:true})
 cpSync(join(this.root,'out','recorder-extension'),extension,{recursive:true})
 const script=readFileSync(join(extension,'background.js'),'utf8')
 writeFileSync(join(extension,'background.js'),'const STUDIO_CONFIG='+JSON.stringify({sessionId:id,token:this.token,endpoint})+';\n'+script)
 process.env.PLAYWRIGHT_BROWSERS_PATH='E:/AI/Caches/ms-playwright'
 const {chromium}=await import('playwright')
 const executable=chromium.executablePath();if(!/^E:[\\/]/i.test(executable))throw Error('Chromium must be installed on E:');this.executableUsed=executable
 const test=process.env.ROUTINE_STUDIO_TEST==='1'
 const context=await chromium.launchPersistentContext(profile,{channel:'chromium',headless:false,acceptDownloads:false,downloadsPath:join(this.dataPath,'downloads'),ignoreDefaultArgs:['--disable-extensions'],args:[
 '--disable-extensions-except='+extension,'--load-extension='+extension,'--disk-cache-dir='+join(this.dataPath,'automation-cache'),...(test?['--remote-debugging-port=0']:[])],env:{...process.env,TEMP:join(this.root,'.runtime','temp'),TMP:join(this.root,'.runtime','temp')}})
 if(this.generation!==generation){await context.close();return this.status()}
 this.context=context
 this.context.on('close',()=>{if(this.generation===generation&&['starting','recording'].includes(this.current.state))this.interrupt('The dedicated browser closed unexpectedly. Review the captured actions or cancel and start again.')})
 let worker=this.context.serviceWorkers().find(w=>w.url().startsWith('chrome-extension://'))
 if(!worker)worker=await this.context.waitForEvent('serviceworker',{timeout:15000})
 this.worker=worker;this.extensionOrigin=new URL(worker.url()).origin
 // WHATWG URL.origin is null for extension URLs; compare the explicit extension scheme/host.
 this.extensionOrigin='chrome-extension://'+new URL(worker.url()).hostname
 await worker.evaluate(()=>new Promise<void>((ok,fail)=>{let n=0;const timer=setInterval(()=>{if((globalThis as unknown as {studioRecorder?:unknown}).studioRecorder){clearInterval(timer);ok()}else if(++n>100){clearInterval(timer);fail(Error('Extension startup timed out'))}},50)}))
 await this.lifecycle('arm');this.lastHeartbeat=Date.now()
 if(test){const [port]=readFileSync(join(profile,'DevToolsActivePort'),'utf8').split('\n');this.testPort=Number(port)}
 this.current.state='recording';this.current.message='Recording the original tab. Use ordinary top-level forms; stop here to review.'
 const page=this.context.pages()[0]??await this.context.newPage()
 this.originalPage=page
 page.on('close',()=>{if(this.current.state==='recording')this.interrupt('The recording tab closed. Review captured actions or cancel to restart.')})
 this.context.on('page',()=>{if(this.current.state==='recording')this.warn('Multiple tabs are unsupported. Only the original recording tab is captured.')})
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:20000})
 this.monitor=setInterval(()=>{if(this.current.state==='recording'&&Date.now()-this.lastHeartbeat>10000)this.interrupt('The recorder extension disconnected. Capture stopped; review the partial recording or cancel and restart.')},2000)
 return this.status()
 }catch(error){if(this.generation!==generation)return this.status();await this.release();this.current.state='error';this.current.message=error instanceof Error?error.message:'Recording could not start';return this.status()}
 }
 private interrupt(message:string){
 if(!['starting','recording','stopping'].includes(this.current.state))return
 this.current.state='interrupted';this.current.message=message;this.warn(message);this.makeReview();this.closeChannel();void this.release()
 }
 private makeReview(){
 if(!this.collector)return
 this.review=RecordingDocument.parse({formatVersion:1,id:this.collector.sessionId,startedAt:this.startedAt,stoppedAt:new Date().toISOString(),events:this.collector.events,warnings:this.current.warnings})
 this.current.workflow=normalize(this.collector.events)
 }
 async stop(){
 if(this.current.state!=='recording')throw Error('There is no active recording to stop.')
 this.current.state='stopping';this.current.message='Flushing final field values…'
 try{await this.lifecycle('stop');this.makeReview();this.current.state='review';this.current.message='Recording stopped. Review captured values and targets before saving a new draft.'}
 catch{this.interrupt('Extension disconnected while stopping. Review the partial recording; the final field may be missing.')}
 this.closeChannel();return this.status()
 }
 async cancel(){
 this.current.state='cancelled';this.current.message='Recording cancelled. No workflow or raw recording was saved.'
 await this.release();this.collector=null;this.review=null;this.current.workflow=null;this.current.sessionId=null;return this.status()
 }
 async save(value:unknown){
 const {sessionId,workflow}=SaveRecording.parse(value)
 if(!['review','interrupted'].includes(this.current.state)||sessionId!==this.current.sessionId||!this.review)throw Error('Recording review session mismatch')
 if(workflow.revision!==0||workflow.example||this.store.list().some(w=>w.id===workflow.id))throw Error('A recording must be saved as a new draft; existing workflows cannot be overwritten.')
 const saved=this.store.save(workflow,this.review)
 await this.release();this.collector=null;this.review=null;this.current={state:'idle',sessionId:null,eventCount:0,warnings:[],message:'Recording saved as a new editable draft.',workflow:null};return saved
 }
 private closeChannel(){if(this.monitor){clearInterval(this.monitor);this.monitor=null}this.server?.closeAllConnections();this.server?.close();this.server=null;this.token=''}
 private async release(){this.generation++;this.closeChannel();const context=this.context;this.context=null;this.originalPage=null;this.worker=null;this.testPort=null;const previous=this.closing;this.closing=(async()=>{await previous;if(context)await context.close().catch(()=>{})})();await this.closing}
 async shutdown(){this.current.state='cancelled';await this.release();this.collector=null;this.review=null}
 private checkInspection(){if(!this.executionGuard())throw Error('Previous execution worker is still alive/unconfirmed; inspection is blocked.');if(this.executionOwned||this.batchReserved)throw Error('Inspection is blocked while execution/batch owns the managed browser/profile.');if(['starting','recording','stopping'].includes(this.current.state))throw Error('Target inspection is blocked while recording is active. Stop recording first.')}
 reserveBatch(){if(!this.executionGuard())throw Error('Previous execution worker must be confirmed stopped.');if(this.batchReserved||this.executionOwned||this.inspectionBusy||['starting','recording','stopping','review','interrupted'].includes(this.current.state))throw Error('Finish recording/inspection/execution before starting a batch.');this.batchReserved=true}
 releaseBatch(){this.batchReserved=false}
 async acquireExecution(batch=false){if(!this.executionGuard())throw Error('Previous execution worker must be confirmed stopped.');if(this.batchReserved&&!batch||this.executionOwned||this.inspectionBusy||['starting','recording','stopping','review','interrupted'].includes(this.current.state))throw Error('Save/cancel recording and finish inspection before execution. Only one managed browser owner is allowed.');this.executionOwned=true;await this.release()}
 releaseExecution(){this.executionOwned=false}
 async openInspection(){
 this.checkInspection();if(this.inspectionBusy)throw Error('An inspection operation is already in progress');this.inspectionBusy=true
 try{
 if(!this.context||!this.originalPage||this.originalPage.isClosed()){
 await this.release();process.env.PLAYWRIGHT_BROWSERS_PATH='E:/AI/Caches/ms-playwright'
 const {chromium}=await import('playwright');const profile=join(this.dataPath,'automation-profile');mkdirSync(profile,{recursive:true})
 const context=await chromium.launchPersistentContext(profile,{channel:'chromium',headless:false,acceptDownloads:false,downloadsPath:join(this.dataPath,'downloads'),args:['--disk-cache-dir='+join(this.dataPath,'automation-cache'),...(process.env.ROUTINE_STUDIO_TEST==='1'?['--remote-debugging-port=0']:[])],env:{...process.env,TEMP:join(this.root,'.runtime','temp'),TMP:join(this.root,'.runtime','temp')}})
 this.context=context;this.originalPage=context.pages()[0]??await context.newPage()
 for(const page of context.pages())if(page!==this.originalPage)await page.close()
 if(process.env.ROUTINE_STUDIO_TEST==='1')this.testPort=Number(readFileSync(join(profile,'DevToolsActivePort'),'utf8').split('\n')[0])
 }
 await this.context.addInitScript(inspectionBanner);await this.originalPage.evaluate(inspectionBanner);await this.originalPage.bringToFront()
 }finally{this.inspectionBusy=false}
 }
 async inspect(value:unknown){this.checkInspection();if(this.inspectionBusy)throw Error('An inspection operation is already in progress');this.inspectionBusy=true;try{return await inspectPage(this.originalPage,value)}finally{this.inspectionBusy=false}}
 async candidates(requiredUrl:unknown){this.checkInspection();if(this.inspectionBusy)throw Error('An inspection operation is already in progress');this.inspectionBusy=true;try{return await inspectionCandidates(this.originalPage,requiredUrl)}finally{this.inspectionBusy=false}}
 async testInfo(){if(process.env.ROUTINE_STUDIO_TEST!=='1')throw Error('Unavailable');for(let i=0;i<200&&!this.context;i++)await new Promise(ok=>setTimeout(ok,50));const port=this.testPort??(this.context?Number(readFileSync(join(this.dataPath,'automation-profile','DevToolsActivePort'),'utf8').split('\n')[0]):null);return {port,raw:this.collector?.events??[],state:this.current.state,paths:{executable:this.executableUsed,profile:join(this.dataPath,'automation-profile'),cache:join(this.dataPath,'automation-cache'),downloads:join(this.dataPath,'downloads'),temp:join(this.root,'.runtime','temp')},browserVersion:this.context?.browser()?.version()}}
}
