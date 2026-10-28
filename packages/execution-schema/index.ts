import {z} from 'zod'
import {WorkflowSchema,preferredTarget,type Workflow} from '../workflow-schema'
import {sensitiveField} from '../recorder-schema'
const uuid=z.uuid(),at=z.iso.datetime()
export const InputValues=z.record(uuid,z.string().max(10000)).refine(v=>Object.keys(v).length<=200,'Too many input values')
export const PrepareRun=z.object({workflowId:uuid,revision:z.number().int().positive(),inputs:InputValues}).strict()
export const RunId=z.object({runId:uuid}).strict()
export const OriginDecision=z.object({runId:uuid,requestId:uuid,allow:z.boolean()}).strict()
const origin=z.url().max(300).refine(v=>{try{return ['http:','https:'].includes(new URL(v).protocol)&&new URL(v).origin===v}catch{return false}},'Invalid origin')
export const RunPlan=z.object({runId:uuid,createdAt:at,snapshot:WorkflowSchema,inputs:InputValues,steps:z.array(z.object({stepId:uuid,index:z.number().int().min(0).max(999),fillValue:z.string().max(10000).optional()}).strict()).max(1000),reviewedOrigins:z.array(origin).min(1).max(100),hasChecks:z.boolean(),limits:z.object({stepTimeoutMs:z.number().int().min(1000).max(15000)}).strict().optional()}).strict().superRefine((p,ctx)=>{
 if(p.snapshot.revision<1||p.steps.length!==p.snapshot.steps.length||p.snapshot.steps[0]?.type!=='navigate')ctx.addIssue({code:'custom',message:'Run must use a saved revision and begin with navigation'})
 p.steps.forEach((s,i)=>{if(s.index!==i||s.stepId!==p.snapshot.steps[i]?.id)ctx.addIssue({code:'custom',message:'Resolved step order does not match snapshot'})})
 const expectedOrigins=[...new Set(p.snapshot.steps.flatMap(s=>s.type==='navigate'?[new URL(s.url).origin]:[]))]
 if(JSON.stringify(expectedOrigins)!==JSON.stringify(p.reviewedOrigins)||p.hasChecks!==p.snapshot.steps.some(s=>s.type==='assert-visible'))ctx.addIssue({code:'custom',message:'Reviewed scope/checks must match the snapshot'})
 if(Object.keys(p.inputs).length!==p.snapshot.inputs.length||p.snapshot.inputs.some(i=>typeof p.inputs[i.id]!=='string'||i.required&&!p.inputs[i.id].trim()))ctx.addIssue({code:'custom',message:'Actual inputs must resolve every saved definition'})
 p.snapshot.steps.forEach((s,i)=>{if(s.type==='unsupported'||(s.type==='fill'?p.steps[i]?.fillValue!==(s.value.kind==='literal'?s.value.text:p.inputs[s.value.inputId]):p.steps[i]?.fillValue!==undefined))ctx.addIssue({code:'custom',message:'Resolved values must match the immutable snapshot and actual inputs'})})
})
export type Plan=z.infer<typeof RunPlan>
export const RunState=z.enum(['review','starting','running','pause_requested','paused','awaiting_origin','stop_requested','completed','assertion_failed','action_failed','stopped','interrupted'])
export type State=z.infer<typeof RunState>
export const terminal=(state:State)=>['completed','assertion_failed','action_failed','stopped','interrupted'].includes(state)
export const PendingOrigin=z.object({requestId:uuid,origin,requestedAt:at}).strict()
export const RunEvent=z.object({sequence:z.number().int().positive(),at,type:z.enum(['prepared','started','dispatch','completed','assertion_failed','action_failed','interrupted','pause_requested','paused','resumed','stop_requested','stopped','origin_requested','origin_approved','origin_denied','warning','finished']),stepIndex:z.number().int().min(0).max(999).optional(),detail:z.string().max(500)}).strict()
export const RunRecord=z.object({formatVersion:z.literal(1),id:uuid,plan:RunPlan,state:RunState,createdAt:at,updatedAt:at,finishedAt:at.nullable(),nextStep:z.number().int().min(0).max(1000),inFlight:z.number().int().min(0).max(999).nullable(),pauseRequested:z.boolean(),stopRequested:z.boolean(),uncertain:z.boolean(),message:z.string().max(500),pendingOrigin:PendingOrigin.nullable(),events:z.array(RunEvent).max(6000)}).strict()
export type Run=z.infer<typeof RunRecord>
export const RunSummary=z.object({id:uuid,title:z.string().max(160),revision:z.number().int().positive(),state:RunState,createdAt:at,updatedAt:at,uncertain:z.boolean()}).strict()
export type Summary=z.infer<typeof RunSummary>
export function detail(value:string){return value.replace(/[\x00-\x1f\x7f]/g,' ').slice(0,500)}
export function makePlan(workflow:Workflow,values:unknown):Plan{
 const parsed=WorkflowSchema.safeParse(workflow)
 if(!parsed.success)throw Error('Workflow is incomplete/invalid. Resolve blocking configuration issues before running: '+parsed.error.issues.slice(0,3).map(i=>i.message).join(' ').slice(0,600))
 const w=parsed.data,inputs=actualInputs(w,values)
 if(w.revision<1||w.steps[0]?.type!=='navigate')throw Error('Choose a saved workflow that starts with an explicit navigate step.')
 for(const step of w.steps)if(step.type==='unsupported')throw Error('Unsupported steps cannot execute.')
 const steps=w.steps.map((s,index)=>({index,stepId:s.id,...(s.type==='fill'?{fillValue:s.value.kind==='literal'?s.value.text:inputs[s.value.inputId]}:{})}))
 for(const s of w.steps)if(s.type==='fill'&&sensitiveField({tag:'input',type:'text',name:preferredTarget(s).value,id:'',autocomplete:'',label:s.label,hidden:false}))throw Error('A fill target appears sensitive; password/payment/authentication fills are unsupported.')
 return RunPlan.parse({runId:crypto.randomUUID(),createdAt:new Date().toISOString(),snapshot:w,inputs,steps,reviewedOrigins:[...new Set(w.steps.flatMap(s=>s.type==='navigate'?[new URL(s.url).origin]:[]))],hasChecks:w.steps.some(s=>s.type==='assert-visible')})
}
export function newRun(plan:Plan):Run{return RunRecord.parse({formatVersion:1,id:plan.runId,plan,state:'review',createdAt:plan.createdAt,updatedAt:plan.createdAt,finishedAt:null,nextStep:0,inFlight:null,pauseRequested:false,stopRequested:false,uncertain:false,message:'Review this immutable saved revision, actual values and origin scope; Start is explicit.',pendingOrigin:null,events:[{sequence:1,at:plan.createdAt,type:'prepared',detail:'Immutable pre-run snapshot prepared; no browser actions started.'}]})}
export function append(run:Run,type:z.infer<typeof RunEvent>['type'],message:string,stepIndex?:number){const now=new Date().toISOString();run.updatedAt=now;run.events.push(RunEvent.parse({sequence:run.events.length+1,at:now,type,detail:detail(message),...(stepIndex===undefined?{}:{stepIndex})}));run.message=detail(message)}
export function interrupt(run:Run,message:string){if(terminal(run.state))return;run.uncertain=run.inFlight!==null;append(run,'interrupted',message,run.inFlight??undefined);run.state='interrupted';run.pendingOrigin=null;run.finishedAt=new Date().toISOString()}
const envelope={runId:uuid,seq:z.number().int().positive()}
export const ParentMessage=z.discriminatedUnion('type',[
 z.object({...envelope,type:z.literal('init'),plan:RunPlan,storageRoot:z.string().max(500).regex(/^E:[\\/]/i),test:z.boolean()}).strict(),
 z.object({...envelope,type:z.literal('step'),index:z.number().int().min(0).max(999)}).strict(),
 z.object({...envelope,type:z.literal('pause'),paused:z.boolean()}).strict(),
 z.object({...envelope,type:z.literal('origin'),requestId:uuid,allow:z.boolean()}).strict(),
 z.object({...envelope,type:z.literal('shutdown')}).strict()
])
export type Parent=z.infer<typeof ParentMessage>
export const WorkerMessage=z.discriminatedUnion('type',[
 z.object({...envelope,type:z.literal('ready'),port:z.number().int().positive().optional()}).strict(),
 z.object({...envelope,type:z.literal('heartbeat')}).strict(),
 z.object({...envelope,type:z.literal('origin'),requestId:uuid,origin}).strict(),
 z.object({...envelope,type:z.literal('warning'),detail:z.string().max(500)}).strict(),
 z.object({...envelope,type:z.literal('result'),index:z.number().int().min(0).max(999),outcome:z.enum(['completed','assertion_failed','action_failed','interrupted']),detail:z.string().max(500),uncertain:z.boolean()}).strict(),
 z.object({...envelope,type:z.literal('fatal'),detail:z.string().max(500)}).strict()
])
export type Worker=z.infer<typeof WorkerMessage>

export function actualInputs(w:Workflow,values:unknown){const inputs=InputValues.parse(values)
 if(Object.keys(inputs).some(id=>!w.inputs.some(i=>i.id===id)))throw Error('An input does not belong to the saved workflow revision.')
 for(const input of w.inputs){
 if(sensitiveField({tag:'input',type:'text',name:input.name,id:'',autocomplete:'',label:'',hidden:false}))throw Error('Sensitive authentication/payment inputs are not supported; do not supply secrets.')
 const value=inputs[input.id]??''
 if(input.required&&!value.trim())throw Error('Required input missing: '+input.name+'. Samples are never used automatically.')
 if(value&&(value.length<input.validation.minLength||value.length>input.validation.maxLength))throw Error('Input length is invalid: '+input.name)
 if(value&&input.validation.format==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))throw Error('Input is not a simple email address: '+input.name)
 inputs[input.id]=value
 }
 return inputs
}
