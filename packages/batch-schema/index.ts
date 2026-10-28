import {z} from 'zod'
import {WorkflowDraftSchema,validateWorkflow,type Workflow} from '../workflow-schema'
import {makePlan,actualInputs,RunState,type Run,type Plan} from '../execution-schema'
export const LIMITS={bytes:2*1024*1024,rows:1000,columns:50,field:10000,record:100000,batchRows:100,steps:100} as const
const uuid=z.uuid(),at=z.iso.datetime(),cell=z.string().max(LIMITS.field)
export const DataRow=z.object({id:uuid,number:z.number().int().positive(),line:z.number().int().positive(),endLine:z.number().int().positive(),cells:z.array(cell).max(LIMITS.columns)}).strict()
export const Dataset=z.object({formatVersion:z.literal(1),id:uuid,title:z.string().trim().min(1).max(160),revision:z.number().int().nonnegative(),updatedAt:at,columns:z.array(z.string().max(160)).min(1).max(LIMITS.columns),rows:z.array(DataRow).min(1).max(LIMITS.rows)}).strict().superRefine((d,c)=>{if(new Set(d.rows.map(r=>r.id)).size!==d.rows.length||d.rows.some(r=>r.cells.length!==d.columns.length||r.endLine<r.line)||new Set(d.rows.map(r=>r.number)).size!==d.rows.length)c.addIssue({code:'custom',message:'Dataset row IDs/counts are inconsistent'});if(d.columns.some(s=>!s.trim())||new Set(d.columns.map(s=>s.trim())).size!==d.columns.length)c.addIssue({code:'custom',message:'Headers must be nonblank and unique'})})
export type Data=z.infer<typeof Dataset>
export const Binding=z.discriminatedUnion('source',[z.object({source:z.literal('column'),column:z.number().int().min(0).max(49),trim:z.boolean()}).strict(),z.object({source:z.literal('constant'),value:cell,trim:z.boolean()}).strict()])
export const Mapping=z.object({formatVersion:z.literal(1),id:uuid,title:z.string().trim().min(1).max(160),revision:z.number().int().nonnegative(),updatedAt:at,dataset:Dataset,workflow:WorkflowDraftSchema,bindings:z.record(uuid,Binding)}).strict().superRefine((m,c)=>{if(Object.keys(m.bindings).length>200)c.addIssue({code:'custom',message:'Too many mappings'})})
export type MapDocument=z.infer<typeof Mapping>
export type PreviewRow={id:string;number:number;line:number;endLine:number;inputs:Record<string,string>;errors:string[]}
export type Preview={rows:PreviewRow[];valid:number;invalid:number;workflowErrors:string[]}
export const Id=z.object({id:uuid}).strict()
export function preview(value:unknown):Preview{
 const m=Mapping.parse(value),workflowErrors=validateWorkflow(m.workflow).filter(i=>i.severity==='error').map(i=>i.message)
 if(m.workflow.revision<1||m.workflow.steps[0]?.type!=='navigate')workflowErrors.push('Choose a saved workflow starting with navigation.')
 const rows=m.dataset.rows.map(row=>{
 const inputs:Record<string,string>={},errors:string[]=[]
 for(const input of m.workflow.inputs){const binding=m.bindings[input.id];if(!binding){errors.push('Map input '+input.name+' to a column or explicit constant.');continue}const raw=binding.source==='constant'?binding.value:row.cells[binding.column];if(raw===undefined){errors.push('Column missing for '+input.name+'.');continue}inputs[input.id]=binding.trim?raw.trim():raw}
 if(!errors.length)try{Object.assign(inputs,actualInputs(m.workflow,inputs))}catch(e){errors.push((e as Error).message)}
 return {id:row.id,number:row.number,line:row.line,endLine:row.endLine,inputs,errors:[...workflowErrors,...errors]}
 });const first=rows.find(r=>!r.errors.length);if(first)try{makePlan(m.workflow,first.inputs)}catch(e){const message=(e as Error).message;workflowErrors.push(message);for(const row of rows)row.errors.push(message)}return {rows,valid:rows.filter(r=>!r.errors.length).length,invalid:rows.filter(r=>r.errors.length).length,workflowErrors}
}
export const Settings=z.object({maxRows:z.number().int().min(1).max(100),stepTimeoutMs:z.number().int().min(1000).max(15000),rowTimeoutMs:z.number().int().min(10000).max(300000),runTimeoutMs:z.number().int().min(10000).max(3600000),continueOnFailure:z.boolean()}).strict()
export const defaults: z.infer<typeof Settings>={maxRows:100,stepTimeoutMs:8000,rowTimeoutMs:120000,runTimeoutMs:1800000,continueOnFailure:false}
export const PrepareBatch=z.object({mapping:Mapping,rowIds:z.array(uuid).min(1).max(1000),settings:Settings}).strict()
export const BatchPlan=z.object({id:uuid,createdAt:at,mapping:Mapping,rows:z.array(z.object({rowId:uuid,number:z.number().int().positive(),line:z.number().int().positive(),plan: z.lazy(()=>RunPlanSchema)}).strict()).min(1).max(100),excluded:z.array(z.object({rowId:uuid,number:z.number().int().positive(),reason:z.string().max(1000)}).strict()).max(1000),settings:Settings,parentId:uuid.optional(),acknowledgedUncertainty:z.boolean()}).strict().superRefine((p,c)=>{
 if(p.rows.length>p.settings.maxRows||p.mapping.workflow.steps.length>100||new Set(p.rows.map(r=>r.rowId)).size!==p.rows.length||new Set(p.rows.map(r=>r.plan.runId)).size!==p.rows.length||new TextEncoder().encode(JSON.stringify(p)).byteLength>8*1024*1024)c.addIssue({code:'custom',message:'Batch snapshot exceeds its limits or duplicates rows/runs'})
 for(const r of p.rows){const source=p.mapping.dataset.rows.find(s=>s.id===r.rowId);if(!source||source.number!==r.number||source.line!==r.line||JSON.stringify(r.plan.snapshot)!==JSON.stringify(p.mapping.workflow)||r.plan.limits?.stepTimeoutMs!==p.settings.stepTimeoutMs){c.addIssue({code:'custom',message:'Row plan must match the reviewed workflow, source record and limits'});continue}for(const input of p.mapping.workflow.inputs){const b=p.mapping.bindings[input.id],raw=b?.source==='constant'?b.value:b?.source==='column'?source.cells[b.column]:undefined;if(raw===undefined||r.plan.inputs[input.id]!== (b.trim?raw.trim():raw))c.addIssue({code:'custom',message:'Row values must match the immutable mapping'})}}
})
// Imported lazily only to keep the shared modules' declarations acyclic.
import {RunPlan as RunPlanSchema} from '../execution-schema'
export type BatchSnapshot=z.infer<typeof BatchPlan>
export const BatchState=z.enum(['review','running','pause_requested','paused','paused_error','paused_uncertain','awaiting_origin','stop_requested','completed','stopped','interrupted'])
export const RowState=z.enum(['queued','running','not_run','completed','assertion_failed','action_failed','stopped','interrupted'])
export const Batch=z.object({formatVersion:z.literal(1),id:uuid,plan:BatchPlan,state:BatchState,createdAt:at,updatedAt:at,finishedAt:at.nullable(),message:z.string().max(500),current:z.number().int().min(0).max(100).nullable(),pauseRequested:z.boolean(),stopRequested:z.boolean(),rows:z.array(z.object({rowId:uuid,state:RowState,runId:uuid.nullable(),dispatched:z.boolean(),uncertain:z.boolean(),message:z.string().max(500),startedAt:at.nullable(),finishedAt:at.nullable()}).strict()).min(1).max(100),notes:z.array(z.object({at,text:z.string().max(1000),acknowledged:z.boolean()}).strict()).max(100)}).strict().superRefine((b,c)=>{if(b.id!==b.plan.id||b.rows.length!==b.plan.rows.length||b.rows.some((r,i)=>r.rowId!==b.plan.rows[i].rowId)||b.current!==null&&b.current>=b.rows.length)c.addIssue({code:'custom',message:'Batch rows do not match snapshot'})})
export type BatchRecord=z.infer<typeof Batch>
export const batchTerminal=(state:BatchRecord['state'])=>['completed','stopped','interrupted'].includes(state)
export function prepareBatch(raw:unknown):BatchRecord{
 const {mapping,rowIds,settings}=PrepareBatch.parse(raw),p=preview(mapping),selected=new Set(rowIds)
 if(selected.size!==rowIds.length||rowIds.some(id=>!p.rows.some(r=>r.id===id)))throw Error('Selection contains duplicate/unknown rows.')
 const valid=p.rows.filter(r=>selected.has(r.id)&&!r.errors.length)
 if(!valid.length)throw Error('No selected valid rows. Resolve validation errors first.')
 if(valid.length>settings.maxRows)throw Error('Valid selected rows exceed the approved row limit.')
 if(mapping.workflow.steps.length>LIMITS.steps)throw Error('Batch workflows are limited to 100 steps per row.')
 const id=crypto.randomUUID(),createdAt=new Date().toISOString(),plan=BatchPlan.parse({id,createdAt,mapping,rows:valid.map(r=>({rowId:r.id,number:r.number,line:r.line,plan:{...makePlan(mapping.workflow,r.inputs),limits:{stepTimeoutMs:settings.stepTimeoutMs}}})),excluded:p.rows.filter(r=>!selected.has(r.id)||r.errors.length).map(r=>({rowId:r.id,number:r.number,reason:r.errors.length?r.errors.join(' ').slice(0,1000):'Not selected'})),settings,acknowledgedUncertainty:false})
 if(new TextEncoder().encode(JSON.stringify(plan)).byteLength>8*1024*1024)throw Error('Batch snapshot exceeds 8 MiB; reduce selected rows or workflow size.')
 return newBatch(plan)
}
export function newBatch(plan:BatchSnapshot):BatchRecord{return Batch.parse({formatVersion:1,id:plan.id,plan,state:'review',createdAt:plan.createdAt,updatedAt:plan.createdAt,finishedAt:null,message:'Immutable review only. No browser actions. Explicit approval and Start required.',current:null,pauseRequested:false,stopRequested:false,rows:plan.rows.map(r=>({rowId:r.rowId,state:'queued',runId:null,dispatched:false,uncertain:false,message:'Never dispatched',startedAt:null,finishedAt:null})),notes:[]})}
export function summarize(b:BatchRecord){return {id:b.id,title:b.plan.mapping.title,state:b.state,createdAt:b.createdAt,completed:b.rows.filter(r=>r.state==='completed').length,failed:b.rows.filter(r=>['action_failed','assertion_failed'].includes(r.state)).length,uncertain:b.rows.filter(r=>r.uncertain).length,notRun:b.rows.filter(r=>['queued','not_run'].includes(r.state)).length,total:b.rows.length}}
export type BatchSummary=ReturnType<typeof summarize>
export const ExportRequest=z.object({kind:z.enum(['batch','run']),id:uuid,format:z.enum(['json','csv'])}).strict()
export function safeCsvCell(value:unknown){const text=String(value??'');const safe=/^[\s\u0000-\u001f]*[=+@-]|^[\t\r\n]/.test(text)?"'"+text:text;return '"'+safe.replaceAll('"','""')+'"'}
export function csvSummary(rows:unknown[][]){return '\uFEFF'+rows.map(row=>row.map(safeCsvCell).join(',')).join('\r\n')+'\r\n'}
