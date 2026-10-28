import {z} from 'zod'
import {Batch,Id,prepareBatch,newBatch,summarize,batchTerminal,type BatchRecord} from '../../../packages/batch-schema'
import {terminal,type Run} from '../../../packages/execution-schema'
import type {WorkflowStore} from './store'
import type {Runner} from './runner'
export class BatchStore{
 constructor(private store:WorkflowStore){}
 put(raw:BatchRecord){const b=Batch.parse(raw),old=this.store.db.prepare('SELECT document FROM batches WHERE id=?').get(b.id);if(old&&JSON.stringify(JSON.parse(old.document as string).plan)!==JSON.stringify(b.plan))throw Error('Historical batch snapshots are immutable.');this.store.db.prepare('INSERT INTO batches VALUES(?,?) ON CONFLICT(id) DO UPDATE SET document=excluded.document').run(b.id,JSON.stringify(b))}
 get(id:string){const row=this.store.db.prepare('SELECT document FROM batches WHERE id=?').get(id);if(!row)throw Error('Batch not found.');return Batch.parse(JSON.parse(row.document as string))}
 all(){return this.store.db.prepare('SELECT document FROM batches ORDER BY rowid DESC').all().map(r=>Batch.parse(JSON.parse(r.document as string)))}
}
export class Batches{
 readonly records:BatchStore
 private current:BatchRecord|null=null
 private timer:ReturnType<typeof setInterval>|null=null
 private ticking=false
 private started=0
 private rowStarted=0
 private leased=false
 private lastContent=''
 constructor(private store:WorkflowStore,private runner:Runner){this.records=new BatchStore(store);for(const b of this.records.all()){if(!batchTerminal(b.state)){this.recover(b);this.records.put(b)}}}
 private recover(b:BatchRecord){for(const row of b.rows)if(row.runId){const r=this.runner.get({runId:row.runId});row.dispatched=r.events.some(e=>e.type==='dispatch');row.uncertain=r.uncertain||r.inFlight!==null;row.state=terminal(r.state)?r.state as typeof row.state:'interrupted';row.message=r.message;row.finishedAt=r.finishedAt}b.state='interrupted';b.message='Previous application session ended. No rows resumed; unfinished dispatches may be uncertain. Reconciliation is not established.';b.finishedAt=b.updatedAt=new Date().toISOString()}
 private persist(message?:string){if(!this.current)return;if(message)this.current.message=message.slice(0,500);const content=JSON.stringify({...this.current,updatedAt:''});if(content===this.lastContent)return;this.lastContent=content;this.current.updatedAt=new Date().toISOString();this.records.put(this.current)}
 list(){return this.records.all().slice(0,200).map(summarize)}
 get(raw:unknown){return this.records.get(Id.parse(raw).id)}
 detail(raw:unknown){const batch=this.get(raw);return {batch,runs:batch.rows.flatMap(r=>r.runId?[this.runner.get({runId:r.runId})]:[])}}
 prepare(raw:unknown){if(this.active())throw Error('Stop the active batch before preparing another.');const b=prepareBatch(raw);this.store.assertSavedSnapshot(b.plan.mapping.workflow);this.records.put(b);this.current=b;return b}
 private require(raw:unknown){const {id}=Id.parse(raw);if(!this.current||this.current.id!==id)throw Error('This batch is historical. Open it to inspect; it cannot resume automatically.');return this.current}
 async start(raw:unknown){const request=z.object({id:z.uuid(),approved:z.literal(true)}).strict().parse(raw),b=this.require({id:request.id});if(b.state!=='review')throw Error('Only an explicitly approved immutable review can Start.');this.runner.reserveBatch(b.id);this.leased=true;b.state='running';this.started=Date.now();this.persist('Explicit approval accepted. Sequential concurrency 1; fresh page/context per row, persistent dedicated profile state shared.');this.timer=setInterval(()=>void this.tick(),100);await this.tick();return this.get({id:b.id})}
 private async tick(){
 if(this.ticking||!this.current||batchTerminal(this.current.state)||this.current.state==='review')return
 this.ticking=true
 try{
 const b=this.current
 if(Date.now()-this.started>b.plan.settings.runTimeoutMs&&!b.stopRequested){this.stop({id:b.id});this.persist('Reviewed total wall-clock run limit reached. No new dispatch; Stop is not rollback.')}
 if(['paused_error','paused_uncertain'].includes(b.state)&&!b.stopRequested)return
 if(b.current!==null){
 const row=b.rows[b.current],run=row.runId?this.runner.get({runId:row.runId}):null
 if(run){
 row.dispatched=run.events.some(e=>e.type==='dispatch');row.message=run.message;row.uncertain=run.uncertain
 if(!terminal(run.state)){
 if(Date.now()-this.rowStarted>b.plan.settings.rowTimeoutMs&&!b.stopRequested){b.pauseRequested=true;this.runner.stop({runId:run.id},b.id);this.persist('Row wall-clock limit reached; row stopped without retry. Review before advancing.')}
 b.state=b.stopRequested?'stop_requested':run.state==='awaiting_origin'?'awaiting_origin':run.state==='paused'?'paused':b.pauseRequested?'pause_requested':'running';this.persist();return
 }
 row.state=run.state as typeof row.state;row.finishedAt=run.finishedAt
 this.persist()
 if(!this.runner.workerStopped())return
 if(b.stopRequested){this.finish('stopped','Stopped. Queued rows were not run; prior changes are not rolled back.');return}
 if(run.uncertain||run.state==='interrupted'){b.state='paused_uncertain';b.pauseRequested=true;this.persist('Interrupted/uncertain row. No retry or automatic advance. Stop, investigate independently and acknowledge uncertainty before a NEW remaining-only review.');return}
 if(['assertion_failed','action_failed','stopped'].includes(run.state)&&!b.plan.settings.continueOnFailure){b.state='paused_error';b.pauseRequested=true;this.persist('Definite row failure. Default pause-on-error; Resume skips this failed row and continues only queued rows. No retry.');return}
 b.current=null
 }
 }
 if(b.stopRequested){if(this.runner.workerStopped())this.finish('stopped','Stopped. Queued rows were not run. Stop is not rollback.');return}
 if(b.pauseRequested){b.state='paused';this.persist();return}
 const index=b.rows.findIndex(r=>r.state==='queued')
 if(index<0){this.finish('completed','All selected rows reached terminal outcomes. Inspect counts/checks/failures; this is not proof of business correctness.');return}
 if(!this.runner.workerStopped())return
 b.current=index;const row=b.rows[index];row.state='running';row.startedAt=new Date().toISOString();row.runId=b.plan.rows[index].plan.runId;this.rowStarted=Date.now();this.persist('Starting source record '+b.plan.rows[index].number+'. No prior row is retried.')
 this.runner.prepareSnapshot(b.plan.rows[index].plan,b.id);await this.runner.start({runId:row.runId},b.id)
 }catch{const b=this.current;if(b){b.state='paused_uncertain';b.pauseRequested=true;this.persist('Batch dispatch/controller error. No automatic retry. Stop and inspect the journal before further work.')}}finally{this.ticking=false}
 }
 pause(raw:unknown){const b=this.require(raw);if(!['running','awaiting_origin','pause_requested'].includes(b.state))throw Error('This batch cannot be paused.');b.pauseRequested=true;const row=b.current===null?null:b.rows[b.current];if(row?.runId){const r=this.runner.get({runId:row.runId});if(!terminal(r.state)&&r.state!=='paused')this.runner.pause({runId:r.id},b.id)}b.state='pause_requested';this.persist('Pause requested. No next step/row will dispatch; an in-flight action may finish.');return this.get(raw)}
 resume(raw:unknown){const b=this.require(raw);if(!['paused','paused_error'].includes(b.state))throw Error('Resume is only supported between known steps or after a definite failure. Uncertain writes cannot be retried.');if(!this.runner.workerStopped()&&b.current!==null){const row=b.rows[b.current],r=row.runId?this.runner.get({runId:row.runId}):null;if(r?.state==='paused')this.runner.resume({runId:r.id},b.id);else if(r&&!terminal(r.state))throw Error('Wait for a known paused state.')}if(b.state==='paused_error')b.current=null;b.pauseRequested=false;b.state='running';this.persist('Explicit Resume: continue undispatched work only; failed/completed steps and rows are not retried.');return this.get(raw)}
 stop(raw:unknown){const b=this.require(raw);if(batchTerminal(b.state))return this.get(raw);b.stopRequested=true;b.pauseRequested=false;for(const row of b.rows)if(row.state==='queued'){row.state='not_run';row.message='Not run: Stop prevented dispatch.'}const row=b.current===null?null:b.rows[b.current];if(row?.runId){const r=this.runner.get({runId:row.runId});if(!terminal(r.state))this.runner.stop({runId:r.id},b.id)}if(this.runner.workerStopped())this.finish('stopped','Stopped by user. Remaining queued rows were not run; Stop is not rollback.');else{b.state='stop_requested';this.persist('Stop requested. No further step/row dispatch. In-flight changes cannot be undone.')}return this.get(raw)}
 approve(raw:unknown){const request=z.object({id:z.uuid(),requestId:z.uuid(),allow:z.boolean()}).strict().parse(raw),b=this.require({id:request.id}),row=b.current===null?null:b.rows[b.current];if(!row?.runId)throw Error('No active row origin request.');this.runner.approve({runId:row.runId,requestId:request.requestId,allow:request.allow},b.id);if(!request.allow)return this.stop({id:b.id});this.persist('Explicit origin approval applies only to this row; later rows retain their reviewed scope.');return this.get({id:b.id})}
 note(raw:unknown){const {id,text,acknowledged}=z.object({id:z.uuid(),text:z.string().trim().min(1).max(1000),acknowledged:z.boolean()}).strict().parse(raw),b=this.records.get(id);if(b.notes.length>=100)throw Error('Note limit reached.');b.notes.push({at:new Date().toISOString(),text,acknowledged});b.updatedAt=new Date().toISOString();this.records.put(b);if(this.current?.id===id)this.current=b;return b}
 remaining(raw:unknown){const {id,acknowledged}=z.object({id:z.uuid(),acknowledged:z.literal(true)}).strict().parse(raw);if(this.active()||!this.runner.workerStopped())throw Error('Stop the prior batch and confirm worker exit before remaining-only review.');const old=this.records.get(id);if(!batchTerminal(old.state))throw Error('Stop the prior batch first.');const eligible=old.rows.filter(r=>!r.dispatched),ids=new Set(eligible.map(r=>r.rowId));if(!ids.size)throw Error('No never-dispatched rows remain. Failed/completed/uncertain rows cannot be retried here.');const now=new Date().toISOString(),plan={...structuredClone(old.plan),id:crypto.randomUUID(),createdAt:now,parentId:id,acknowledgedUncertainty:acknowledged,rows:old.plan.rows.filter(r=>ids.has(r.rowId)).map(r=>({...r,plan:{...r.plan,runId:crypto.randomUUID(),createdAt:now}})),excluded:[...old.plan.excluded,...old.plan.rows.filter(r=>!ids.has(r.rowId)).map(r=>({rowId:r.rowId,number:r.number,reason:'Prior dispatch exists; excluded from remaining-only work.'}))]};this.current=newBatch(plan);this.records.put(this.current);return this.current}
 private finish(state:'completed'|'stopped',message:string){const b=this.current!;b.state=state;b.finishedAt=new Date().toISOString();this.persist(message);if(this.timer){clearInterval(this.timer);this.timer=null}if(this.leased){this.runner.releaseBatch(b.id);this.leased=false}}
 active(){return !!this.current&&!batchTerminal(this.current.state)&&this.current.state!=='review'}
 shutdown(){if(this.timer){clearInterval(this.timer);this.timer=null}if(this.current&&!batchTerminal(this.current.state)){this.recover(this.current);this.persist('App shutdown interrupted the batch. Unfinished dispatches are uncertain; no automatic restart/reconciliation.')}}
}
