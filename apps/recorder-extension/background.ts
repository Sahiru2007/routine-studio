import {ContentMessage,type RecordingEvent} from '../../packages/recorder-schema'
import {z} from 'zod'
declare const STUDIO_CONFIG:{sessionId:string;token:string;endpoint:string}
let active=false,targetTab:number|null=null,sequence=0,chain=Promise.resolve(),failed=false
const seen=new Map<string,number>()
async function send(path:string,body:unknown){const response=await fetch(STUDIO_CONFIG.endpoint+path,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+STUDIO_CONFIG.token},body:JSON.stringify(body),signal:AbortSignal.timeout(4000)});if(!response.ok)throw Error('Recorder channel rejected message')}
async function persist(){await chrome.storage.session.set({active,targetTab,sequence,seen:[...seen]})}
const ready=chrome.storage.session.get(['active','targetTab','sequence','seen']).then(raw=>{const s=z.object({active:z.boolean().default(false),targetTab:z.number().nullable().default(null),sequence:z.number().int().nonnegative().default(0),seen:z.array(z.tuple([z.string(),z.number()])).default([])}).parse(raw);active=s.active;targetTab=s.targetTab;sequence=s.sequence;for(const [id,n] of s.seen)seen.set(id,n)})
function enqueue(message:unknown,sender:chrome.runtime.MessageSender){
 chain=chain.then(async()=>{await ready;if(!active||failed||sender.tab?.id!==targetTab||sender.frameId!==0)return
 const e=ContentMessage.parse(message);if(e.localSequence!==(seen.get(e.documentId)??0)+1)throw Error('Missing or duplicate content event')
 const event:RecordingEvent={sessionId:STUDIO_CONFIG.sessionId,sequence:sequence+1,documentId:e.documentId,localSequence:e.localSequence,payload:e.payload}
 await send('/event',event);sequence++;seen.set(e.documentId,e.localSequence);await persist()
 }).catch(async()=>{failed=true;active=false;await persist();await badge(false)})
 return chain
}
async function badge(recording:boolean){await chrome.action.setBadgeText({text:recording?'REC':'OFF'});await chrome.action.setBadgeBackgroundColor({color:recording?'#b33f50':'#54616d'});await chrome.action.setTitle({title:recording?'Routine Studio: RECORDING this tab':'Routine Studio: recording stopped'})}
chrome.runtime.onMessage.addListener((message,sender,reply)=>{
 if(message?.kind==='hello'){ready.then(()=>reply({active:active&&!failed&&sender.tab?.id===targetTab,sessionId:STUDIO_CONFIG.sessionId}));return true}
 if(message?.kind==='event'){enqueue(message,sender).then(()=>reply({accepted:!failed}));return true}
})
async function broadcast(command:string){const tabs=await chrome.tabs.query({});await Promise.all(tabs.map(t=>t.id?chrome.tabs.sendMessage(t.id,{command}).catch(()=>{}):Promise.resolve()))}
Object.assign(globalThis,{studioRecorder:{
 async arm(){await ready;const tabs=await chrome.tabs.query({active:true,currentWindow:true});targetTab=tabs[0]?.id??null;if(targetTab===null)throw Error('No recording tab');active=true;failed=false;await persist();await badge(true)},
 async stop(){await broadcast('flush');await chain;active=false;await persist();await broadcast('stop');await badge(false);if(failed)throw Error('Extension channel disconnected')},
 async cancel(){active=false;await persist();await broadcast('stop');await chain;await badge(false)},
 async health(){await ready;return {active,failed,targetTab}}
}})
chrome.tabs.onActivated.addListener(info=>{if(active&&info.tabId!==targetTab)send('/warning',{sessionId:STUDIO_CONFIG.sessionId,message:'Multiple tabs are unsupported. Only the original recording tab is captured.'}).catch(()=>{})})
setInterval(()=>{if(active&&!failed)send('/heartbeat',{sessionId:STUDIO_CONFIG.sessionId}).catch(async()=>{failed=true;active=false;await persist();await broadcast('stop');await badge(false)})},2000)
