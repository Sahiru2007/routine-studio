import { z } from 'zod'
import type {RecordingState} from '../recorder-schema'
const id = z.string().uuid()
const base = { id, label: z.string().trim().min(1).max(160) }
export const StepSchema = z.discriminatedUnion('type', [
 z.object({...base,type:z.literal('navigate'),url:z.url().refine(v=>/^https?:/.test(v),'Use an http or https URL')}).strict(),
 z.object({...base,type:z.literal('fill'),selector:z.string().trim().min(1),value:z.discriminatedUnion('kind',[
  z.object({kind:z.literal('literal'),text:z.string().max(10000)}).strict(),
  z.object({kind:z.literal('input'),inputId:id}).strict()
 ])}).strict(),
 z.object({...base,type:z.literal('click'),selector:z.string().trim().min(1)}).strict(),
 z.object({...base,type:z.literal('assert-visible'),selector:z.string().trim().min(1)}).strict()
])
export const WorkflowSchema = z.object({
 formatVersion:z.literal(1), id, title:z.string().trim().min(1,'Give the workflow a title').max(160),
 description:z.string().max(10000), example:z.boolean(), revision:z.number().int().nonnegative(),
 updatedAt:z.iso.datetime(), inputs:z.array(z.object({id,name:z.string().trim().regex(/^[a-zA-Z][a-zA-Z0-9_]*$/,'Use a name starting with a letter; letters, numbers and underscores only'),sample:z.string().max(10000)}).strict()).max(200),
 steps:z.array(StepSchema).max(1000)
}).strict().superRefine((w,ctx)=>{
 const ids = new Set<string>()
 for(const item of [...w.inputs,...w.steps]) { if(ids.has(item.id)) ctx.addIssue({code:'custom',message:'Duplicate input or step ID'}); ids.add(item.id) }
 if(new Set(w.inputs.map(i=>i.name)).size!==w.inputs.length) ctx.addIssue({code:'custom',message:'Input names must be unique'})
 w.steps.forEach((s,index)=>{if(s.type==='fill' && s.value.kind==='input' && !w.inputs.some(i=>s.value.kind==='input' && i.id===s.value.inputId)) ctx.addIssue({code:'custom',path:['steps',index,'value'],message:'Fill step references a missing input. Choose an existing input or use a literal value.'})})
})
export type Workflow = z.infer<typeof WorkflowSchema>
export type Step = z.infer<typeof StepSchema>
export const IdSchema = id
export function blankWorkflow():Workflow {return {formatVersion:1,id:crypto.randomUUID(),title:'Untitled workflow',description:'',example:false,revision:0,updatedAt:new Date().toISOString(),inputs:[],steps:[]}}
export function newStep(type:Step['type']):Step {
 const base={id:crypto.randomUUID(),label:({navigate:'Open page',fill:'Fill field',click:'Click element','assert-visible':'Check element'})[type]}
 return type==='navigate'?{...base,type,url:'https://example.com'}:type==='fill'?{...base,type,selector:'input',value:{kind:'literal',text:''}}:{...base,type,selector:'button'}
}
export function moveStep(w:Workflow,id:string,delta:number):Workflow {
 const steps=[...w.steps],index=steps.findIndex(s=>s.id===id),target=index+delta
 if(index<0||target<0||target>=steps.length)return w
 ;[steps[index],steps[target]]=[steps[target],steps[index]]
 return {...w,steps}
}
export function removeInput(w:Workflow,id:string):Workflow {
 if(w.steps.some(s=>s.type==='fill'&&s.value.kind==='input'&&s.value.inputId===id))throw Error('This input is used by a fill step. Change that step before removing the input.')
 return {...w,inputs:w.inputs.filter(i=>i.id!==id)}
}
export function exampleWorkflow():Workflow {
 const w=blankWorkflow(),input={id:crypto.randomUUID(),name:'customer_name',sample:'Alex Example'}
 return {...w,title:'Customer entry',description:'Synthetic example for learning the editor. This workflow has never been recorded or executed.',example:true,inputs:[input],
 steps:[{...newStep('navigate'),type:'navigate',url:'https://example.com/customers/new'},
 {...newStep('fill'),type:'fill',selector:'[name="customer_name"]',value:{kind:'input',inputId:input.id}},
 {...newStep('click'),type:'click',selector:'button[type="submit"]'},
 {...newStep('assert-visible'),type:'assert-visible',selector:'[role="status"]'}]}
}
export type Bridge = {
 list:()=>Promise<Workflow[]>; save:(w:Workflow)=>Promise<Workflow>; remove:(id:string)=>Promise<void>;
 status:()=>Promise<{dataPath:string;databasePath:string}>; dirty:(value:boolean)=>void
 recordingStatus:()=>Promise<RecordingState>; recordingStart:(value:{url:string})=>Promise<RecordingState>;
 recordingStop:()=>Promise<RecordingState>; recordingCancel:()=>Promise<RecordingState>;
 recordingSave:(value:{sessionId:string;workflow:Workflow})=>Promise<Workflow>;
 demoStart:()=>Promise<{url:string}>; demoReset:()=>Promise<void>
}


