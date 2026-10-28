import {describe,it,expect,vi,afterEach} from 'vitest'
import {EventEmitter} from 'node:events'
const transport=vi.hoisted(()=>({child:null as any}))
vi.mock('node:child_process',()=>({fork:()=>transport.child}))
import {Runner} from './runner'
import {WorkflowStore} from './store'
import {blankWorkflow,newStep} from '../../../packages/workflow-schema'
import {ParentMessage} from '../../../packages/execution-schema'
function setup(){
 vi.useFakeTimers();const store=new WorkflowStore(':memory:'),recorder={acquireExecution:vi.fn(async()=>{}),releaseExecution:vi.fn()}
 const child=Object.assign(new EventEmitter(),{connected:true,pid:123,send:vi.fn(),kill:vi.fn(()=>{child.emit('exit',1);return true})});transport.child=child
 const runner=new Runner('E:/projects/routine-studio','E:/test-data',store,recorder as any),w=store.save({...blankWorkflow(),steps:[{...newStep('navigate'),type:'navigate',url:'http://example.test/'},{...newStep('click'),type:'click',selector:'#submit'}]})
 const run=runner.prepare({workflowId:w.id,revision:w.revision,inputs:{}});let sequence=0
 const emit=(message:object)=>child.emit('message',{runId:run.id,seq:++sequence,...message})
 return {store,recorder,child,runner,run,emit,get:()=>runner.get({runId:run.id})}
}
afterEach(()=>vi.useRealTimers())
describe('main supervision state transitions',()=>{
 it('blocks takeover while a persisted prior worker PID is alive, without killing it',()=>{const t=setup();try{t.store.db.prepare("INSERT INTO metadata(key,value) VALUES('execution-worker-lease',?)").run(JSON.stringify({pid:process.pid,runId:crypto.randomUUID()}));expect(t.runner.workerStopped()).toBe(false);expect(()=>t.runner.reserveBatch(crypto.randomUUID())).toThrow('prior worker');expect(()=>t.runner.prepare({workflowId:t.run.plan.snapshot.id,revision:1,inputs:{}})).toThrow('confirmed stopped');expect(t.child.kill).not.toHaveBeenCalled()}finally{t.store.close()}})
 it('persists dispatch before sending, pauses between steps, resumes and stops without later clicks',async()=>{const t=setup();try{await t.runner.start({runId:t.run.id});expect(ParentMessage.parse(t.child.send.mock.calls[0][0]).type).toBe('init');t.emit({type:'ready'});t.runner.pause({runId:t.run.id});await vi.advanceTimersByTimeAsync(600);expect(t.get().state).toBe('paused');expect(t.get().inFlight).toBe(null);t.runner.resume({runId:t.run.id});t.child.send.mockImplementation((m:any)=>{if(m.type==='step')expect(t.get().inFlight).toBe(m.index)});await vi.advanceTimersByTimeAsync(600);expect(t.get().inFlight).toBe(0);t.runner.pause({runId:t.run.id});expect(t.get().state).toBe('pause_requested');t.emit({type:'result',index:0,outcome:'completed',detail:'Navigated',uncertain:false});expect(t.get().state).toBe('paused');t.runner.stop({runId:t.run.id});await vi.advanceTimersByTimeAsync(2000);expect(t.get().state).toBe('stopped');expect(t.child.send.mock.calls.filter(([m]:any)=>m.type==='step')).toHaveLength(1);t.child.emit('exit',0);expect(t.recorder.releaseExecution).toHaveBeenCalled()}finally{t.store.close()}})
 it('rejects session mismatch and out-of-order results without another dispatch',async()=>{const t=setup();try{await t.runner.start({runId:t.run.id});t.emit({type:'ready'});await vi.advanceTimersByTimeAsync(600);t.child.emit('message',{runId:crypto.randomUUID(),seq:2,type:'result',index:0,outcome:'completed',detail:'Wrong session',uncertain:false});expect(t.get().state).toBe('interrupted');expect(t.get().uncertain).toBe(true);expect(t.child.kill).toHaveBeenCalled();await vi.advanceTimersByTimeAsync(1000);expect(t.child.send.mock.calls.filter(([m]:any)=>m.type==='step')).toHaveLength(1)}finally{t.store.close()}})
 it('does not accept a result for a step that was not dispatched',async()=>{const t=setup();try{await t.runner.start({runId:t.run.id});t.emit({type:'ready'});t.emit({type:'result',index:1,outcome:'completed',detail:'Unexpected',uncertain:false});expect(t.get().state).toBe('interrupted');expect(t.get().nextStep).toBe(0)}finally{t.store.close()}})
 it('preserves configured assertion failure as terminal and prohibits Resume/Start retries',async()=>{const t=setup();try{await t.runner.start({runId:t.run.id});t.emit({type:'ready'});await vi.advanceTimersByTimeAsync(600);t.emit({type:'result',index:0,outcome:'assertion_failed',detail:'Condition not met',uncertain:false});expect(t.get().state).toBe('assertion_failed');expect(()=>t.runner.resume({runId:t.run.id})).toThrow();await expect(t.runner.start({runId:t.run.id})).rejects.toThrow();t.child.emit('exit',0)}finally{t.store.close()}})
})
