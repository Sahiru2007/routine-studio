import {sensitiveField,type FieldInfo,type Payload} from '../../packages/recorder-schema'
let active=false,localSequence=0
const documentId=crypto.randomUUID(),pending=new Set<HTMLInputElement|HTMLTextAreaElement>(),lastValues=new WeakMap<Element,string>(),warnings=new Set<string>()
 let lastSubmit:Element|null=null,transport=Promise.resolve()
function send(payload:Payload){if(!active)return;const message={kind:'event',documentId,localSequence:++localSequence,payload};const delivery=chrome.runtime.sendMessage(message);transport=Promise.all([transport,delivery]).then(()=>{}).catch(()=>stop())}
function warn(code:'sensitive'|'unsupported'|'ambiguous',message:string){if(warnings.has(message))return;warnings.add(message);send({type:'warning',code,message})}
function metadata(el:Element):FieldInfo{
 const input=el as HTMLInputElement,label=input.labels?.[0]?.textContent||el.getAttribute('aria-label')||(['BUTTON','A'].includes(el.tagName)?el.textContent:'')||''
 return {tag:el.tagName.toLowerCase(),type:(el.getAttribute('type')||'text').slice(0,160),name:(el.getAttribute('name')||'').slice(0,160),id:el.id.slice(0,160),autocomplete:(el.getAttribute('autocomplete')||'').slice(0,160),label:label.trim().slice(0,160),hidden:el.closest('[hidden],[aria-hidden="true"]')!==null||el.getClientRects().length===0||input.type==='hidden'||getComputedStyle(el).display==='none'||getComputedStyle(el).visibility==='hidden'}
}
function target(el:Element){
 const field=metadata(el),candidates:{kind:'label'|'role'|'attribute'|'context';name:string;value:string}[]=[]
 if(field.label)candidates.push({kind:'label',name:'label',value:field.label})
 const role=el.getAttribute('role')||({BUTTON:'button',A:'link',INPUT:'textbox',TEXTAREA:'textbox'} as Record<string,string>)[el.tagName]||''
 if(role)candidates.push({kind:'role',name:role.slice(0,160),value:field.label})
 let selector=''
 for(const attr of ['data-testid','id','name','aria-label','placeholder']){const value=el.getAttribute(attr);if(!value||value.length>160)continue;candidates.push({kind:'attribute',name:attr,value});const candidate=el.tagName.toLowerCase()+'['+attr+'="'+CSS.escape(value)+'"]';if(!selector&&document.querySelectorAll(candidate).length===1)selector=candidate}
 const legend=el.closest('fieldset')?.querySelector('legend')?.textContent?.trim().slice(0,160);if(legend)candidates.push({kind:'context',name:'fieldset',value:legend})
 if(!selector){const parts:string[]=[];let node:Element|null=el;while(node&&node!==document.body){const tag=node.tagName.toLowerCase(),siblings=node.parentElement?Array.from(node.parentElement.children).filter(s=>s.tagName===node!.tagName):[];parts.unshift(tag+':nth-of-type('+(siblings.indexOf(node)+1)+')');node=node.parentElement}selector='body > '+parts.join(' > ');warn('ambiguous','Some targets use structural selectors. Review them; page structure changes may invalidate them.')}
 return {selector,field,candidates:candidates.slice(0,12)}
}
function supported(el:Element):el is HTMLInputElement|HTMLTextAreaElement{
 if(sensitiveField(metadata(el))){pending.delete(el as HTMLInputElement);warn('sensitive','Sensitive or hidden fields were excluded. Detection is heuristic; review other values before saving.');return false}
 return el instanceof HTMLTextAreaElement||(el instanceof HTMLInputElement&&['text','email','tel','url','search','number'].includes(el.type))
}
function flush(){for(const el of pending){pending.delete(el);if(!supported(el))continue;const value=el.value.slice(0,10000);if(lastValues.get(el)===value)continue;lastValues.set(el,value);send({type:'fill',target:target(el),value})}}
function stop(){active=false;pending.clear();const b=document.getElementById('__routine_studio_status');if(b){b.textContent='Routine Studio · Recording stopped';b.style.background='#3f4a55'}}
function banner(){const div=document.createElement('div');div.id='__routine_studio_status';div.setAttribute('role','status');div.textContent='● Routine Studio · RECORDING this tab · Stop in the app';Object.assign(div.style,{position:'fixed',bottom:'12px',right:'12px',zIndex:'2147483647',padding:'12px 18px',background:'#943b4b',color:'white',borderRadius:'8px',font:'13px system-ui',pointerEvents:'none'});document.documentElement.append(div)}
chrome.runtime.onMessage.addListener((message,_sender,reply)=>{if(message?.command==='flush'){flush();transport.then(()=>reply({flushed:true}));return true}if(message?.command==='stop'){stop();reply({stopped:true})}})
document.addEventListener('input',event=>{if(!active||!event.isTrusted)return;const el=event.target;if(el instanceof Element&&supported(el))pending.add(el)},true)
document.addEventListener('change',event=>{if(!active||!event.isTrusted)return;const el=event.target;if(el instanceof Element&&supported(el)){pending.add(el);flush()}else if(el instanceof HTMLSelectElement)warn('unsupported','Select changes are unsupported in this milestone.')},true)
document.addEventListener('focusout',()=>{if(active)flush()},true)
document.addEventListener('click',event=>{if(!active||!event.isTrusted)return;const origin=event.composedPath()[0];if(origin instanceof Element&&origin.getRootNode() instanceof ShadowRoot){warn('unsupported','Shadow DOM is unsupported; this interaction was omitted.');return}
 const el=event.target instanceof Element?event.target.closest('button,a,input[type="submit"],input[type="button"]'):null;if(!el)return;flush();if(sensitiveField(metadata(el)))return
 if(el instanceof HTMLInputElement||el instanceof HTMLButtonElement)lastSubmit=el;send({type:'click',target:target(el)})},true)
document.addEventListener('submit',event=>{if(!active||!event.isTrusted)return;flush();const el=(event as SubmitEvent).submitter;if(el&&el!==lastSubmit&&!sensitiveField(metadata(el)))send({type:'click',target:target(el)});lastSubmit=null},true)
window.addEventListener('pagehide',()=>{if(active)flush()})
function inspect(){if(document.querySelector('iframe,frame'))warn('unsupported','Frames are unsupported; only top-level HTML is captured.');if(document.querySelector('input[type="file"]'))warn('unsupported','File uploads are unsupported and their values are excluded.');if(Array.from(document.querySelectorAll('*')).some(el=>el.shadowRoot))warn('unsupported','Shadow DOM is present and unsupported.');if(document.querySelector('[contenteditable="true"],[role="combobox"]'))warn('unsupported','Custom editable widgets are unsupported.')}
chrome.runtime.sendMessage({kind:'hello'}).then(result=>{if(!result?.active)return;active=true;banner();send({type:'navigate',url:location.origin+location.pathname});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inspect,{once:true});else inspect()}).catch(()=>{})
