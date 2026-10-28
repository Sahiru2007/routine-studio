import {describe,it,expect} from 'vitest'
import {EventCollector,normalize,sensitiveField,EventSchema,RecordingDocument,convertFillToInput,type RecordingEvent,type Payload} from './index'
const field={tag:'input',type:'text',name:'customer_name',id:'customer-name',autocomplete:'off',label:'Customer name',hidden:false}
const target={selector:'input[id="customer-name"]',field,candidates:[{kind:'label' as const,name:'label',value:'Customer name'}]}
const sessionId=crypto.randomUUID(),documentId=crypto.randomUUID()
const event=(sequence:number,payload:Payload,doc=documentId):RecordingEvent=>({sessionId,sequence,documentId:doc,localSequence:sequence,payload})
describe('recorder boundaries and normalization',()=>{
 it('coalesces consecutive fills while retaining navigation and action order',()=>{
 const events=[event(1,{type:'navigate',url:'http://localhost/'}),event(2,{type:'fill',target,value:'A'}),event(3,{type:'fill',target,value:'Alex Example'}),event(4,{type:'click',target:{...target,selector:'button[id="save"]'}}),event(5,{type:'navigate',url:'http://localhost/saved'},crypto.randomUUID()),event(6,{type:'fill',target,value:'Another page value'})]
 const w=normalize(events);expect(w.steps.map(s=>s.type)).toEqual(['navigate','fill','click','navigate','fill']);expect(w.steps[1]).toMatchObject({value:{kind:'literal',text:'Alex Example'}});expect(w.steps.some(s=>s.type==='assert-visible')).toBe(false)
 })
 it('validates session, global order, per-document order and unknown fields',()=>{
 const collector=new EventCollector(sessionId),e=event(1,{type:'navigate',url:'http://localhost/'})
 collector.accept(e);expect(()=>collector.accept(e)).toThrow('order');expect(()=>collector.accept({...e,sessionId:crypto.randomUUID(),sequence:2})).toThrow('mismatch');expect(()=>collector.accept({...e,sequence:2})).toThrow('order');expect(EventSchema.safeParse({...e,cookies:'not permitted'}).success).toBe(false)
 expect(RecordingDocument.safeParse({formatVersion:1,id:crypto.randomUUID(),startedAt:new Date().toISOString(),stoppedAt:new Date().toISOString(),events:[e],warnings:[]}).success).toBe(false)
 })
 it.each([{type:'password'},{type:'hidden'},{name:'card_number'},{autocomplete:'cc-csc'},{label:'One-time authentication code'},{id:'routing_number'},{hidden:true}])('excludes sensitive metadata %j',patch=>{
 const sensitive={...field,...patch};expect(sensitiveField(sensitive)).toBe(true)
 expect(EventSchema.safeParse(event(1,{type:'fill',target:{...target,field:sensitive},value:'SYNTHETIC-SECRET'})).success).toBe(false)
 })
 it('keeps ordinary customer fields and converts values into stable input references',()=>{
 expect(sensitiveField(field)).toBe(false);const w=normalize([event(1,{type:'fill',target,value:'Alex Example'})]);const converted=convertFillToInput(w,w.steps[0].id)
 expect(converted.steps[0].id).toBe(w.steps[0].id);expect(converted.inputs[0].sample).toBe('Alex Example');expect(converted.steps[0]).toMatchObject({value:{kind:'input',inputId:converted.inputs[0].id}})
 })
})
