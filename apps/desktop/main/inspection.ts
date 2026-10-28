import {domTargets} from '../../../packages/workflow-schema/dom-targets'
import type {Page} from 'playwright'
import {InspectionRequest,type InspectionResult} from '../../../packages/workflow-schema'
import {type Candidate} from '../../../packages/assistance-schema'
export function inspectionBanner(){
 const install=()=>{const old=document.getElementById('__routine_studio_status');old?.remove();let banner=document.getElementById('__routine_inspection_status');if(!banner){banner=document.createElement('div');banner.id='__routine_inspection_status';document.documentElement.append(banner)}banner.textContent='Routine Studio · INSPECTION ONLY · Open the required page yourself';Object.assign(banner.style,{position:'fixed',bottom:'12px',right:'12px',zIndex:'2147483647',padding:'12px 18px',background:'#294967',color:'white',borderRadius:'8px',font:'13px system-ui',pointerEvents:'none'})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install()
}
export async function inspectionCandidates(page:Page|null,requiredUrl:unknown):Promise<Candidate[]>{
 if(typeof requiredUrl!=='string'||requiredUrl.length>2048)throw Error('Set a valid required page URL first.')
 let required:URL;try{required=new URL(requiredUrl)}catch{throw Error('Set a valid required page URL first.')}
 if(!['http:','https:'].includes(required.protocol)||required.username||required.password)throw Error('Set a valid required page URL first.')
 if(!page||page.isClosed())throw Error('Open the inspection browser and required page first.')
 const current=new URL(page.url());if(current.origin!==required.origin||current.pathname!==required.pathname||current.search!==required.search)throw Error('The required page is not open in the original inspection tab.')
 const raw=await page.evaluate(()=>{
  const clean=(s:string|null|undefined)=>s?.replace(/\s+/g,' ').trim().slice(0,160)||''
  const sensitive=(el:Element)=>{const input=el as HTMLInputElement,name=clean([input.type,input.name,input.id,input.autocomplete,el.getAttribute('aria-label')].join(' ')).toLowerCase();return input.type==='password'||input.type==='hidden'||/(password|passcode|secret|token|card|cvv|cvc|expiry|authentication|login|credential)/.test(name)}
  const visible=(el:Element)=>{const r=(el as HTMLElement).getBoundingClientRect(),s=getComputedStyle(el);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'&&!el.hasAttribute('hidden')}
  const accessible=(el:Element)=>clean(el.getAttribute('aria-label'))||clean((el.getAttribute('aria-labelledby')||'').split(' ').map(id=>document.getElementById(id)?.textContent).join(' '))||clean((el as HTMLInputElement).labels?.[0]?.textContent)||clean(el.textContent)
  const role=(el:Element)=>el.getAttribute('role')||({BUTTON:'button',A:el.hasAttribute('href')?'link':'',TEXTAREA:'textbox',SELECT:'combobox',H1:'heading',H2:'heading',H3:'heading'} as Record<string,string>)[el.tagName]||(el.tagName==='INPUT'?(['checkbox','radio'].includes((el as HTMLInputElement).type)?(el as HTMLInputElement).type:['button','submit','reset'].includes((el as HTMLInputElement).type)?'button':'textbox'):'')
  return Array.from(document.querySelectorAll('button,a[href],input,textarea,select,h1,h2,h3,[role],[data-testid]')).filter(el=>visible(el)&&!sensitive(el)&&!el.closest('[data-routine-highlight],#__routine_inspection_status')).slice(0,100).map((el,index)=>{const label=accessible(el),r=role(el),id=clean(el.id),testid=clean(el.getAttribute('data-testid')),name=clean(el.getAttribute('name'));const locator=id?{strategy:'attribute',attribute:'id',value:id}:testid?{strategy:'attribute',attribute:'data-testid',value:testid}:name?{strategy:'attribute',attribute:'name',value:name}:r&&label?{strategy:'role',role:r,value:label}:label&&['INPUT','TEXTAREA','SELECT'].includes(el.tagName)?{strategy:'label',value:label}:null;return locator?{id:'candidate-'+index,label:label||el.tagName.toLowerCase(),tag:el.tagName.toLowerCase(),role:r,locator,context:clean(el.parentElement?.getAttribute('aria-label')||el.parentElement?.querySelector('legend,h1,h2,h3')?.textContent)}:null}).filter(Boolean)
 })
 return raw as Candidate[]
}
export async function inspectPage(page:Page|null,value:unknown):Promise<InspectionResult>{
 const request=InspectionRequest.parse(value)
 if(!page||page.isClosed())return {state:'open-page',count:null,message:'Open the inspection browser and manually open '+request.requiredUrl+'. No navigation was performed.'}
 let current:URL;try{current=new URL(page.url())}catch{return {state:'open-page',count:null,message:'Manually open '+request.requiredUrl+' in the original supported tab. No navigation was performed.'}}
 const required=new URL(request.requiredUrl)
 if(current.origin!==required.origin||current.pathname!==required.pathname||current.search!==required.search)return {state:'open-page',count:null,message:'The required page is not open. Manually open '+request.requiredUrl+' in the original supported tab. No navigation was performed.'}
 const list=await page.evaluateHandle(domTargets,request.locator)
 const count=await list.evaluate(matches=>{
 for(const el of matches.slice(0,20)){const r=el.getBoundingClientRect();const overlay=document.createElement('div');overlay.setAttribute('data-routine-highlight','true');Object.assign(overlay.style,{position:'fixed',left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',boxSizing:'border-box',border:'3px solid #8fe1ab',background:'transparent',zIndex:'2147483646',pointerEvents:'none'});document.documentElement.append(overlay);setTimeout(()=>overlay.remove(),1800)}
 return matches.length
 })
 await list.dispose()
 return {state:'matches',count,message:count+' top-level match'+(count===1?'':'es')+'. '+(count?'Highlighted up to 20 matches temporarily. ':'')+'A single match does not prove semantic correctness. No click, fill, submit or navigation was performed.'}
}
