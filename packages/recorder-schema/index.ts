import {z} from 'zod'
import {blankWorkflow,WorkflowSchema,type Workflow,type Step} from '../workflow-schema'
export const HttpUrl=z.url().max(2048).refine(v=>/^https?:/.test(v)&&!new URL(v).username&&!new URL(v).password,'Use an http/https URL without credentials')
const short=z.string().max(160)
export const FieldMetadata=z.object({tag:short,type:short,name:short,id:short,autocomplete:short,label:short,hidden:z.boolean()}).strict()
export type FieldInfo=z.infer<typeof FieldMetadata>
export function sensitiveField(f:FieldInfo):boolean{return f.hidden||['password','hidden'].includes(f.type.toLowerCase())||/(password|passcode|passwd|secret|token|auth|otp|one.?time|pin\b|credit|card|cc-|ccnum|cvv|cvc|iban|routing|account.?number|ssn|social.?security)/i.test([f.type,f.name,f.id,f.autocomplete,f.label].join(' '))}
export const TargetSchema=z.object({selector:z.string().min(1).max(1000),field:FieldMetadata,candidates:z.array(z.object({kind:z.enum(['label','role','attribute','context']),name:short,value:short}).strict()).max(12)}).strict()
export const PayloadSchema=z.discriminatedUnion('type',[
 z.object({type:z.literal('navigate'),url:HttpUrl}).strict(),
 z.object({type:z.literal('click'),target:TargetSchema}).strict(),
 z.object({type:z.literal('fill'),target:TargetSchema,value:z.string().max(10000)}).strict(),
 z.object({type:z.literal('warning'),code:z.enum(['sensitive','unsupported','ambiguous','tab','connection']),message:z.string().max(300)}).strict()
]).superRefine((e,ctx)=>{if((e.type==='fill'||e.type==='click')&&sensitiveField(e.target.field))ctx.addIssue({code:'custom',message:'Sensitive targets must not be recorded'})})
export const ContentMessage=z.object({kind:z.literal('event'),documentId:z.uuid(),localSequence:z.number().int().positive(),payload:PayloadSchema}).strict()
export const EventSchema=z.object({sessionId:z.uuid(),sequence:z.number().int().positive(),documentId:z.uuid(),localSequence:z.number().int().positive(),payload:PayloadSchema}).strict()
export type RecordingEvent=z.infer<typeof EventSchema>
export type Payload=z.infer<typeof PayloadSchema>
export const RecordingDocument=z.object({formatVersion:z.literal(1),id:z.uuid(),startedAt:z.iso.datetime(),stoppedAt:z.iso.datetime(),events:z.array(EventSchema).max(1000),warnings:z.array(z.string().max(300)).max(100)}).strict().superRefine((r,ctx)=>{
 let sequence=0;const locals=new Map<string,number>()
 for(const e of r.events){if(e.sessionId!==r.id||e.sequence!==sequence+1||e.localSequence!==(locals.get(e.documentId)??0)+1)ctx.addIssue({code:'custom',message:'Invalid recording session or event order'});sequence=e.sequence;locals.set(e.documentId,e.localSequence)}
})
export type RecordingDocumentType=z.infer<typeof RecordingDocument>
export const RecordingStateSchema=z.object({state:z.enum(['idle','starting','recording','stopping','review','cancelled','interrupted','error']),sessionId:z.uuid().nullable(),eventCount:z.number().int().nonnegative(),warnings:z.array(z.string()),message:z.string(),workflow:WorkflowSchema.nullable(),targets:z.array(TargetSchema).optional()}).strict()
export type RecordingState=z.infer<typeof RecordingStateSchema>
export const StartRecording=z.object({url:HttpUrl}).strict()
export const SaveRecording=z.object({sessionId:z.uuid(),workflow:WorkflowSchema}).strict()
export class EventCollector{
 events:RecordingEvent[]=[]
 private locals=new Map<string,number>()
 constructor(readonly sessionId:string){}
 accept(raw:unknown){const e=EventSchema.parse(raw)
 if(e.sessionId!==this.sessionId)throw Error('Recording session mismatch')
 if(e.sequence!==this.events.length+1||e.localSequence!==(this.locals.get(e.documentId)??0)+1)throw Error('Recording event out of order, missing or duplicated')
 if(this.events.length>=1000)throw Error('Recording limit reached (1000 events); stop and review')
 this.locals.set(e.documentId,e.localSequence);this.events.push(e);return e}
}
export function normalize(events:RecordingEvent[]):Workflow{
 const workflow={...blankWorkflow(),title:'Recorded workflow',description:'Captured browser actions. Review before use; no success checks were inferred.'},steps:Step[]=[]
 for(const e of events){const p=e.payload;if(p.type==='warning')continue
 if(p.type==='navigate'){if(steps.at(-1)?.type==='navigate'&&(steps.at(-1) as {url:string}).url===p.url)continue;steps.push({id:crypto.randomUUID(),type:'navigate',label:('Open '+new URL(p.url).pathname).slice(0,160),url:p.url});continue}
 const label=p.target.field.label||p.target.field.name||p.target.candidates.find(c=>c.kind==='role')?.value||'element'
 if(p.type==='fill'){const previous=steps.at(-1);if(previous?.type==='fill'&&previous.selector===p.target.selector){previous.value={kind:'literal',text:p.value};continue}
 steps.push({id:crypto.randomUUID(),type:'fill',label:('Fill '+label).slice(0,160),selector:p.target.selector,value:{kind:'literal',text:p.value}})
 }else steps.push({id:crypto.randomUUID(),type:'click',label:('Click '+label).slice(0,160),selector:p.target.selector})}
 return WorkflowSchema.parse({...workflow,steps})
}
export function convertFillToInput(w:Workflow,stepId:string):Workflow{
 const step=w.steps.find(s=>s.id===stepId);if(step?.type!=='fill'||step.value.kind!=='literal')throw Error('Choose a literal fill step')
 const id=crypto.randomUUID();let n=1;while(w.inputs.some(i=>i.name==='recorded_input_'+n))n++
 return WorkflowSchema.parse({...w,inputs:[...w.inputs,{id,name:'recorded_input_'+n,sample:step.value.text}],steps:w.steps.map(s=>s.id===stepId?{...step,value:{kind:'input',inputId:id}}:s)})
}
