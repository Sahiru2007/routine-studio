import type {Workflow,Locator} from '../workflow-schema'
import type {RecordingEvent} from './index'
export function attachEvidence(w:Workflow,recording:{id:string;events:RecordingEvent[]}):Workflow{
 let pageUrl='';const targets=recording.events.flatMap(e=>{if(e.payload.type==='navigate')pageUrl=e.payload.url;return e.payload.type==='fill'||e.payload.type==='click'?[{event:e,pageUrl,target:e.payload.target,type:e.payload.type}]:[]})
 let stepPage='',lastSequence=0
 return {...w,steps:w.steps.map(s=>{
 if(s.type==='navigate'){stepPage=s.url;return s}
 if(s.type==='unsupported'||s.target?.provenance)return s
 const captured=targets.find(t=>t.event.sequence>lastSequence&&t.type===s.type&&t.target.selector===s.selector&&(!stepPage||t.pageUrl===stepPage))
 if(!captured)return s
 lastSequence=captured.event.sequence
 const alternatives:{label:string;locator:Locator}[]=[{label:'Recorded CSS selector',locator:{strategy:'css',value:captured.target.selector}}]
 for(const c of captured.target.candidates){
 if(c.kind==='label'&&c.value)alternatives.push({label:'Label: '+c.value,locator:{strategy:'label',value:c.value}})
 if(c.kind==='attribute'&&['id','name','data-testid','aria-label','placeholder'].includes(c.name))alternatives.push({label:c.name+': '+c.value,locator:{strategy:'attribute',attribute:c.name as 'id',value:c.value}})
 if(c.kind==='role'&&['button','link','textbox','combobox','checkbox','radio','heading','status'].includes(c.name)&&c.value)alternatives.push({label:'Role '+c.name+': '+c.value,locator:{strategy:'role',role:c.name as 'button',value:c.value}})
 }
 return {...s,target:{preferred:{strategy:'css',value:s.selector},alternatives:alternatives.slice(0,20),pageUrl:captured.pageUrl,provenance:{recordingId:recording.id,sequence:captured.event.sequence,pageUrl:captured.pageUrl,recordedSelector:captured.target.selector,candidates:captured.target.candidates}}}
 })}
}
