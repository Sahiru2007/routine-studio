import {domTargets} from '../../../packages/workflow-schema/dom-targets'
import type {Page} from 'playwright'
import {InspectionRequest,type InspectionResult} from '../../../packages/workflow-schema'
export function inspectionBanner(){
 const install=()=>{const old=document.getElementById('__routine_studio_status');old?.remove();let banner=document.getElementById('__routine_inspection_status');if(!banner){banner=document.createElement('div');banner.id='__routine_inspection_status';document.documentElement.append(banner)}banner.textContent='Routine Studio · INSPECTION ONLY · Open the required page yourself';Object.assign(banner.style,{position:'fixed',bottom:'12px',right:'12px',zIndex:'2147483647',padding:'12px 18px',background:'#294967',color:'white',borderRadius:'8px',font:'13px system-ui',pointerEvents:'none'})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install()
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
