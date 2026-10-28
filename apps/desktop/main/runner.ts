import {fork,type ChildProcess} from 'node:child_process'
import {join} from 'node:path'
import {makePlan,RunPlan,newRun,RunId,PrepareRun,OriginDecision,WorkerMessage,ParentMessage,terminal,append,interrupt,type Run,type Parent,type State,type Plan} from '../../../packages/execution-schema'
import {RunStore} from './run-store'
import type {WorkflowStore} from './store'
import type {Recorder} from './recorder'
import {z} from 'zod'
const Lease=z.object({pid:z.number().int().positive(),runId:z.uuid()}).strict()

export class Runner{
 readonly records:RunStore
 private current:Run|null=null
 private batchOwner:string|null=null
 private child:ChildProcess|null=null
 private parentSeq=0
 private workerSeq=0
 private dispatchTimer:ReturnType<typeof setTimeout>|null=null
 private monitor:ReturnType<typeof setInterval>|null=null
 private lastHeartbeat=0
 private dispatchAt=0
 private port:number|null=null
 constructor(private root:string,private dataPath:string,private workflows:WorkflowStore,private recorder:Recorder){this.records=new RunStore(workflows.db);this.records.recover();recorder.setExecutionGuard?.(()=>this.workerStopped())}
 private priorStopped(){const row=this.workflows.db.prepare("SELECT value FROM metadata WHERE key='execution-worker-lease'").get();if(!row)return true;const lease=Lease.parse(JSON.parse(row.value as string));try{process.kill(lease.pid,0);return false}catch(error){if((error as NodeJS.ErrnoException).code!=='ESRCH')return false;this.workflows.db.prepare("DELETE FROM metadata WHERE key='execution-worker-lease'").run();return true}}
 private persist(){if(this.current)this.records.put(this.current)}
 prepare(value:unknown,owner?:string){
 this.checkOwner(owner)
 if(!this.workerStopped())throw Error('Previous execution worker has not been confirmed stopped. Close the earlier application/worker and try again; no automatic takeover.');
 const request=PrepareRun.parse(value)
 if(this.child||this.current&&!terminal(this.current.state)&&this.current.state!=='review')throw Error('Finish or stop the active run before preparing another.')
 const w=this.workflows.list().find(w=>w.id===request.workflowId)
 if(!w||w.revision!==request.revision)throw Error('Saved workflow revision changed. Select it again before preparing.')
 const plan=makePlan(w,request.inputs)
 if(this.current?.state==='review'){append(this.current,'stopped','Unstarted review superseded by another explicit pre-run review.');this.current.state='stopped';this.current.finishedAt=new Date().toISOString();this.persist()}
 this.current=newRun(plan);this.persist();return this.records.get(plan.runId)
 }
 private checkOwner(owner?:string){if(this.batchOwner!==null&&owner!==this.batchOwner||owner&&owner!==this.batchOwner)throw Error('Use batch controls while a supervised batch owns execution.')}
 reserveBatch(owner:string){if(this.batchOwner||!this.workerStopped()||this.current&&!terminal(this.current.state))throw Error('Finish/discard the standalone run and confirm the prior worker stopped before starting a batch.');this.recorder.reserveBatch();this.batchOwner=owner}
 releaseBatch(owner:string){this.checkOwner(owner);if(this.child)throw Error('Worker must stop before releasing the batch.');this.batchOwner=null;this.recorder.releaseBatch()}
 workerStopped(){return this.child===null&&this.priorStopped()}
 prepareSnapshot(value:unknown,owner:string){this.checkOwner(owner);if(this.child||this.current&&!terminal(this.current.state))throw Error('Previous row worker must stop first.');const plan=RunPlan.parse(value);this.current=newRun(plan);this.persist();return this.records.get(plan.runId)}
 list(){return this.records.list()}
 get(value:unknown){return this.records.get(RunId.parse(value).runId)}
 private require(value:unknown){const {runId}=RunId.parse(value);if(!this.current||this.current.id!==runId)throw Error('This run is not active; terminal/previous runs cannot be resumed.');return this.current}
 private send(body:unknown){if(!body||typeof body!=='object')throw Error('Invalid internal command');if(!this.current||!this.child?.connected)return;const message=ParentMessage.parse({...body,runId:this.current.id,seq:++this.parentSeq});this.child.send(message,error=>{if(error&&this.current&&!terminal(this.current.state))this.fail('Worker channel disconnected. Unfinished action outcome uncertain; no retry.')})}
 async start(value:unknown,owner?:string){this.checkOwner(owner);
 const run=this.require(value);if(run.state!=='review'||this.child)throw Error('Start is allowed only from a new explicit pre-run review.')
 run.state='starting';append(run,'started','Explicit Start approved the reviewed immutable snapshot and origin scope.');this.persist()
 try{await this.recorder.acquireExecution(!!owner)}catch(error){run.state='review';append(run,'warning','Start blocked: save/cancel recording and finish browser inspection first. No worker actions started.');this.persist();throw error}
 if(run.stopRequested||terminal(run.state)){this.recorder.releaseExecution();return this.records.get(run.id)}
 this.parentSeq=0;this.workerSeq=0;this.lastHeartbeat=Date.now();this.port=null
 const env={...process.env,ELECTRON_RUN_AS_NODE:'1',PLAYWRIGHT_BROWSERS_PATH:process.env.PLAYWRIGHT_BROWSERS_PATH,TEMP:join(this.dataPath,'temp'),TMP:join(this.dataPath,'temp')};delete (env as Record<string,unknown>).NODE_COMPILE_CACHE
 try{
 const child=fork(join(this.root,'out/main/worker.js'),[],{cwd:this.root,execPath:process.execPath,env,stdio:['ignore','ignore','ignore','ipc'],serialization:'json'});this.child=child
 if(!child.pid)throw Error('Worker PID unavailable');this.workflows.db.prepare("INSERT INTO metadata(key,value) VALUES('execution-worker-lease',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(JSON.stringify(Lease.parse({pid:child.pid,runId:run.id})))
 child.on('message',value=>this.receive(value));child.on('error',()=>this.fail('Worker could not start or communicate. No automatic retry.'))
 child.on('exit',()=>{if(this.current&&!terminal(this.current.state))this.fail('Worker terminated. Unfinished dispatched action may have changed data; no automatic retry.',false);this.workflows.db.prepare("DELETE FROM metadata WHERE key='execution-worker-lease'").run();this.child=null;this.port=null;if(this.monitor){clearInterval(this.monitor);this.monitor=null}this.recorder.releaseExecution()})
 this.monitor=setInterval(()=>{if(this.current&&!terminal(this.current.state)&&(Date.now()-this.lastHeartbeat>15000||this.current.inFlight!==null&&Date.now()-this.dispatchAt>80000))this.fail('Worker/action exceeded its supervision deadline. Outcome uncertain; no retry.')},1000)
 this.send({type:'init',plan:run.plan,storageRoot:this.dataPath,test:process.env.ROUTINE_STUDIO_TEST==='1'})
 }catch{this.fail('Worker startup failed. No workflow actions were dispatched.');this.recorder.releaseExecution()}
 return this.records.get(run.id)
 }
 private receive(raw:unknown){
 try{
 const message=WorkerMessage.parse(raw),run=this.current
 if(!run||message.runId!==run.id||message.seq!==this.workerSeq+1)throw Error('Worker message mismatch')
 this.workerSeq=message.seq;this.lastHeartbeat=Date.now();if(terminal(run.state))return
 if(message.type==='heartbeat')return
 if(message.type==='warning'){append(run,'warning',message.detail);this.persist();return}
 if(message.type==='fatal'){this.fail(message.detail);return}
 if(message.type==='ready'){
 if(!['starting','pause_requested','stop_requested'].includes(run.state))throw Error('Unexpected worker ready')
 this.port=message.port??null
 if(run.stopRequested){this.finish('stopped','Stopped by user before any further dispatch.');return}
 if(run.pauseRequested){run.state='paused';append(run,'paused','Paused between steps. No action dispatched.');this.persist()}else{run.state='running';this.persist();this.schedule()}
 return
 }
 if(message.type==='origin'){
 if(run.inFlight===null||run.pendingOrigin)throw Error('Unexpected origin request')
 run.pendingOrigin={requestId:message.requestId,origin:message.origin,requestedAt:new Date().toISOString()};run.state='awaiting_origin';append(run,'origin_requested','Approval required before contacting unreviewed origin '+message.origin+'. Prior actions may already have changed data.',run.inFlight);this.persist();return
 }
 if(message.type==='result'){
 if(run.inFlight!==message.index)throw Error('Unexpected step result')
 append(run,message.outcome,message.detail,message.index);run.uncertain=run.uncertain||message.uncertain;run.inFlight=null;run.pendingOrigin=null
 if(run.stopRequested&&message.outcome==='action_failed'&&!message.uncertain){this.finish('stopped','Stopped by user; blocked navigation/action did not complete. No later step dispatched. Stop is not undo.');return}
 if(message.outcome!=='completed'){this.finish(message.outcome,message.detail);return}
 run.nextStep=message.index+1
 if(run.stopRequested){this.finish('stopped','Stopped by user. In-flight step finished; no later step dispatched. Stop is not undo.');return}
 if(run.nextStep>=run.plan.steps.length){this.finish('completed','All configured steps completed. This is not proof of business/database success.');return}
 if(run.pauseRequested){run.state='paused';append(run,'paused','Paused between steps; previous in-flight action finished.');this.persist();return}
 run.state='running';this.persist();this.schedule()
 }
 }catch{this.fail('Invalid, out-of-order or session-mismatched worker message. No further dispatch or retry.')}
 }
 private schedule(){if(this.dispatchTimer)clearTimeout(this.dispatchTimer);this.dispatchTimer=setTimeout(()=>{this.dispatchTimer=null;const run=this.current;if(!run||run.state!=='running'||run.inFlight!==null||run.pauseRequested||run.stopRequested||run.pendingOrigin)return;run.inFlight=run.nextStep;this.dispatchAt=Date.now();append(run,'dispatch','Dispatch persisted before step '+(run.nextStep+1)+'; a consequential action may change data.',run.nextStep);this.persist();this.send({type:'step',index:run.nextStep})},500)}
 pause(value:unknown,owner?:string){this.checkOwner(owner);const run=this.require(value);if(!['starting','running','pause_requested','awaiting_origin'].includes(run.state))throw Error('This run cannot be paused.');run.pauseRequested=true;if(!run.pendingOrigin)run.state=run.inFlight===null&&run.state!=='starting'?'paused':'pause_requested';append(run,'pause_requested','Pause requested. It applies between steps; an in-flight action may finish.');this.persist();this.send({type:'pause',paused:true});return this.records.get(run.id)}
 resume(value:unknown,owner?:string){this.checkOwner(owner);const run=this.require(value);if(run.state!=='paused')throw Error('Resume only applies to a run paused between steps.');run.pauseRequested=false;run.state='running';append(run,'resumed','User resumed supervised dispatch; no failed action is retried.');this.persist();this.send({type:'pause',paused:false});this.schedule();return this.records.get(run.id)}
 stop(value:unknown,owner?:string){this.checkOwner(owner);const run=this.require(value);if(terminal(run.state))return this.records.get(run.id);run.stopRequested=true;append(run,'stop_requested','Stop requested. No further steps will dispatch; it is not an undo action.');if(this.dispatchTimer){clearTimeout(this.dispatchTimer);this.dispatchTimer=null}
 if(run.pendingOrigin)this.send({type:'origin',requestId:run.pendingOrigin.requestId,allow:false})
 if(run.inFlight===null){this.finish('stopped','Stopped by user before another step dispatched. No actions were undone.')}else{run.state='stop_requested';this.persist();this.send({type:'shutdown'})}
 return this.records.get(run.id)}
 approve(value:unknown,owner?:string){this.checkOwner(owner);const request=OriginDecision.parse(value),run=this.require({runId:request.runId});if(!run.pendingOrigin||run.pendingOrigin.requestId!==request.requestId||run.state!=='awaiting_origin')throw Error('Origin approval request is no longer active.');append(run,request.allow?'origin_approved':'origin_denied',(request.allow?'Explicit approval granted for ':'Approval denied for ')+run.pendingOrigin.origin,run.inFlight??undefined);this.persist();if(!request.allow)return this.stop({runId:run.id},owner);this.send({type:'origin',requestId:request.requestId,allow:true});run.pendingOrigin=null;run.state=run.pauseRequested?'pause_requested':'running';this.persist();return this.records.get(run.id)}
 private finish(state:State,message:string){const run=this.current;if(!run)return;run.state=state;run.finishedAt=new Date().toISOString();run.pendingOrigin=null;append(run,'finished',message);this.persist();if(this.dispatchTimer){clearTimeout(this.dispatchTimer);this.dispatchTimer=null}this.send({type:'shutdown'})}
 private fail(message:string,kill=true){const run=this.current;if(!run||terminal(run.state))return;interrupt(run,message);this.persist();if(this.dispatchTimer){clearTimeout(this.dispatchTimer);this.dispatchTimer=null}if(kill)this.child?.kill()}
 active(){return !!this.current&&!terminal(this.current.state)&&this.current.state!=='review'}
 async shutdown(){if(this.current&&!terminal(this.current.state)){interrupt(this.current,'App shutdown ended this run. Unfinished dispatches are uncertain; no automatic resume/retry.');this.persist()}if(this.dispatchTimer)clearTimeout(this.dispatchTimer);if(this.child){this.send({type:'shutdown'});const child=this.child;await Promise.race([new Promise<void>(ok=>child.once('exit',()=>ok())),new Promise<void>(ok=>setTimeout(()=>{child.kill();ok()},9000))])}}
 testInfo(){if(process.env.ROUTINE_STUDIO_TEST!=='1')throw Error('Unavailable');return {workerPid:this.child?.pid??null,port:this.port,active:this.current?.id??null}}
}
