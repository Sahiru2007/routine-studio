import {z} from 'zod'
import {parse as parseCss,walk as walkCss} from 'css-tree'
const id=z.uuid(),text=z.string().max(10000),JsonSchema=z.json()
export const LocatorSchema=z.discriminatedUnion('strategy',[
 z.object({strategy:z.literal('css'),value:z.string().max(1000)}).strict(),
 z.object({strategy:z.literal('label'),value:z.string().max(160)}).strict(),
 z.object({strategy:z.literal('role'),role:z.enum(['button','link','textbox','combobox','checkbox','radio','heading','status']),value:z.string().max(160)}).strict(),
 z.object({strategy:z.literal('attribute'),attribute:z.enum(['id','name','data-testid','aria-label','placeholder']),value:z.string().max(160)}).strict()
])
export type Locator=z.infer<typeof LocatorSchema>
export const ProvenanceSchema=z.object({recordingId:id,sequence:z.number().int().positive(),pageUrl:z.string().max(2048),recordedSelector:z.string().max(1000),candidates:z.array(z.object({kind:z.enum(['label','role','attribute','context']),name:z.string().max(160),value:z.string().max(160)}).strict()).max(12)}).strict()
export const TargetSchema=z.object({preferred:LocatorSchema,alternatives:z.array(z.object({label:z.string().max(200),locator:LocatorSchema}).strict()).max(20),provenance:ProvenanceSchema.optional(),pageUrl:z.string().max(2048).optional()}).strict()
const base={id,label:z.string().max(160)},target={selector:z.string().max(1000),target:TargetSchema.optional()}
export const StepSchema=z.discriminatedUnion('type',[
 z.object({...base,type:z.literal('navigate'),url:z.string().max(2048)}).strict(),
 z.object({...base,...target,type:z.literal('fill'),value:z.discriminatedUnion('kind',[z.object({kind:z.literal('literal'),text}).strict(),z.object({kind:z.literal('input'),inputId:z.string().max(64)}).strict()])}).strict(),
 z.object({...base,...target,type:z.literal('click')}).strict(),
 z.object({...base,...target,type:z.literal('assert-visible'),expectedText:z.object({mode:z.enum(['exact','contains']),value:text}).strict().optional()}).strict(),
 z.object({...base,type:z.literal('unsupported'),selector:z.string().max(1000),original:JsonSchema.refine(v=>JSON.stringify(v).length<=20000,'Unsupported step evidence is too large')}).strict()
])
export const InputSchema=z.object({id,name:z.string().max(160),sample:text,required:z.boolean(),validation:z.object({format:z.enum(['text','email']),minLength:z.number().min(-1000000).max(1000000),maxLength:z.number().min(-1000000).max(1000000)}).strict()}).strict()
export const WorkflowDraftSchema=z.object({formatVersion:z.literal(2),id,title:z.string().max(160),description:text,example:z.boolean(),revision:z.number().int().nonnegative(),updatedAt:z.iso.datetime(),inputs:z.array(InputSchema).max(200),steps:z.array(StepSchema).max(1000)}).strict().superRefine((w,ctx)=>{const ids=new Set<string>();for(const item of [...w.inputs,...w.steps]){if(ids.has(item.id))ctx.addIssue({code:'custom',message:'Duplicate input or step ID; cannot safely save this document'});ids.add(item.id)}})
export type Workflow=z.infer<typeof WorkflowDraftSchema>
export type Step=z.infer<typeof StepSchema>
export type Issue={severity:'error'|'warning';message:string;stepId?:string;inputId?:string}
export function validUrl(value:string){try{const u=new URL(value);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password}catch{return false}}
export function locatorProblem(locator:Locator):string|null{
 if(!locator.value.trim())return 'Choose a target value.'
 if(/[\x00-\x1f]/.test(locator.value))return 'Target values cannot contain control characters.'
 if(locator.strategy==='css'){
 if(/[>+~,]\s*$/.test(locator.value)||/^[>+~,]/.test(locator.value.trim())||/[#.](?:\s|$)/.test(locator.value)||/,\s*,/.test(locator.value))return 'CSS target is incomplete or malformed.'
 try{const ast=parseCss(locator.value,{context:'selectorList'});walkCss(ast,node=>{if(node.type==='Raw'||node.type==='PseudoElementSelector'||(node.type==='PseudoClassSelector'&&!['nth-child','nth-of-type','first-child','last-child'].includes(node.name)))throw Error('Unsupported selector')})}catch{return 'Malformed or unsupported CSS target. Use standard selectors and simple structural pseudo-classes; JavaScript, XPath, shadow-piercing and extended engines are not accepted.'}
 }
 return null
}
export function preferredTarget(step:Exclude<Step,{type:'navigate'}>):Locator{return step.type!=='unsupported'&&step.target?step.target.preferred:{strategy:'css',value:step.selector}}
export function validateWorkflow(w:Workflow):Issue[]{
 const issues:Issue[]=[];const add=(message:string,stepId?:string,inputId?:string,severity:Issue['severity']='error')=>issues.push({severity,message,...(stepId?{stepId}:{}),...(inputId?{inputId}:{})})
 if(!w.title.trim())add('Give the workflow a title.')
 if(!w.steps.length)add('Add at least one supported step.')
 const names=new Set<string>()
 for(const input of w.inputs){if(!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(input.name))add('Input names must start with a letter and contain only letters, numbers and underscores.',undefined,input.id)
 if(names.has(input.name))add('Input names must be unique.',undefined,input.id);names.add(input.name)
 if(![input.validation.minLength,input.validation.maxLength].every(n=>Number.isInteger(n)&&n>=0&&n<=10000))add('Text lengths must be whole numbers between 0 and 10000.',undefined,input.id)
 if(input.validation.minLength>input.validation.maxLength)add('Minimum text length cannot exceed maximum length.',undefined,input.id)
 const sample=input.sample
 if(input.required&&!sample.trim())add('Required input needs a nonblank sample value.',undefined,input.id)
 if(sample&&(sample.length<input.validation.minLength||sample.length>input.validation.maxLength))add('Sample value is outside the configured text-length range.',undefined,input.id)
 if(sample&&input.validation.format==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sample))add('Sample must be a simple email address.',undefined,input.id)
 }
 for(const step of w.steps){if(!step.label.trim())add('Give this step a readable label.',step.id)
 if(step.type==='unsupported'){add('Unsupported or malformed step retained for review. Replace it explicitly; its original JSON is preserved.',step.id);continue}
 if(step.type==='navigate'){if(!validUrl(step.url))add('Enter a valid http/https navigation URL without credentials.',step.id);continue}
 const problem=locatorProblem(preferredTarget(step));if(problem)add(problem,step.id)
 if(step.target?.pageUrl!==undefined&&!validUrl(step.target.pageUrl))add('Enter a valid required page URL for target inspection.',step.id)
 if(!step.target?.provenance)add('No original recording provenance is linked to this target; review it manually.',step.id,undefined,'warning')
 add('Target match/meaning and workflow execution have not been verified.',step.id,undefined,'warning')
 if(step.type==='fill'&&step.value.kind==='input'&&!w.inputs.some(i=>step.value.kind==='input'&&i.id===step.value.inputId))add('Fill step references a missing input. Choose an existing input or use a literal value.',step.id)
 if(step.type==='assert-visible'&&step.expectedText&&!step.expectedText.value.trim())add('Enter expected text or disable the text condition.',step.id)
 }
 if(!w.steps.some(s=>s.type==='assert-visible'))add('No explicit visible UI check has been added. Recording does not infer success.',undefined,undefined,'warning')
 return issues
}
export const WorkflowSchema=WorkflowDraftSchema.superRefine((w,ctx)=>{for(const i of validateWorkflow(w).filter(i=>i.severity==='error'))ctx.addIssue({code:'custom',message:i.message})})
export const IdSchema=id
export function blankWorkflow():Workflow{return {formatVersion:2,id:crypto.randomUUID(),title:'Untitled workflow',description:'',example:false,revision:0,updatedAt:new Date().toISOString(),inputs:[],steps:[]}}
export function inputDefinition(name:string,sample=''){return {id:crypto.randomUUID(),name,sample,required:true,validation:{format:'text' as const,minLength:0,maxLength:10000}}}
export function newStep(type:Exclude<Step['type'],'unsupported'>):Step{const common={id:crypto.randomUUID(),label:({navigate:'Open page',fill:'Fill field',click:'Click element','assert-visible':'Check element'})[type]};return type==='navigate'?{...common,type,url:'https://example.com'}:type==='fill'?{...common,type,selector:'input',value:{kind:'literal',text:''}}:{...common,type,selector:'button'}}
export function moveStep(w:Workflow,id:string,delta:number):Workflow{const steps=[...w.steps],i=steps.findIndex(s=>s.id===id),j=i+delta;if(i<0||j<0||j>=steps.length)return w;[steps[i],steps[j]]=[steps[j],steps[i]];return {...w,steps}}
export function removeInput(w:Workflow,id:string):Workflow{if(w.steps.some(s=>s.type==='fill'&&s.value.kind==='input'&&s.value.inputId===id))throw Error('This input is used by a fill step. Change that step before removing the input.');return {...w,inputs:w.inputs.filter(i=>i.id!==id)}}
export function exampleWorkflow():Workflow{const w=blankWorkflow(),input=inputDefinition('customer_name','Alex Example');return {...w,title:'Customer entry',description:'Synthetic example for learning the editor. This workflow has never been recorded or executed.',example:true,inputs:[input],steps:[{...newStep('navigate'),type:'navigate',url:'https://example.com/customers/new'},{...newStep('fill'),type:'fill',selector:'[name="customer_name"]',value:{kind:'input',inputId:input.id}},{...newStep('click'),type:'click',selector:'button[type="submit"]'},{...newStep('assert-visible'),type:'assert-visible',selector:'[role="status"]'}]}}
export function migrateWorkflow(value:unknown):Workflow{
 if(!value||typeof value!=='object')throw Error('Invalid workflow document')
 const old=value as Record<string,unknown>
 if(old.formatVersion===2)return WorkflowDraftSchema.parse(value)
 if(old.formatVersion!==1)throw Error('Unsupported workflow format version')
 const inputs=(old.inputs as {id:string;name:string;sample:string}[]).map(i=>({...inputDefinition(i.name,i.sample),id:i.id}))
 const steps=(old.steps as unknown[]).map(source=>{const parsed=StepSchema.safeParse(source);const s=source&&typeof source==='object'?source as Record<string,unknown>:{};return parsed.success?parsed.data:{id:typeof s.id==='string'&&z.uuid().safeParse(s.id).success?s.id:crypto.randomUUID(),label:typeof s.label==='string'?s.label.slice(0,160):'Unsupported legacy step',type:'unsupported' as const,selector:'',original:source as z.infer<typeof JsonSchema>}})
 return WorkflowDraftSchema.parse({...old,formatVersion:2,inputs,steps})
}
export function workflowContent(w:Workflow){const {revision,updatedAt,...content}=w;return JSON.stringify(content)}
export function matchesExpectedText(actual:string,condition:{mode:'exact'|'contains';value:string}){const clean=(s:string)=>s.replace(/\s+/g,' ').trim();return condition.mode==='exact'?clean(actual)===clean(condition.value):clean(actual).includes(clean(condition.value))}
export const InspectionRequest=z.object({locator:LocatorSchema,requiredUrl:z.string().max(2048)}).strict().superRefine((r,ctx)=>{const problem=locatorProblem(r.locator);if(problem)ctx.addIssue({code:'custom',message:problem});if(!validUrl(r.requiredUrl))ctx.addIssue({code:'custom',message:'Set a valid required page URL before inspecting.'})})
export type InspectionResult={state:'matches'|'open-page';count:number|null;message:string}
