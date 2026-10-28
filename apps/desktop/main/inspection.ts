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
 const count=await page.evaluate(locator=>{
 const clean=(s:string|null)=>s?.replace(/\s+/g,' ').trim()??''
 const name=(el:Element)=>clean(el.getAttribute('aria-label'))||clean((el.getAttribute('aria-labelledby')??'').split(' ').map(id=>document.getElementById(id)?.textContent??'').join(' '))||clean((el as HTMLInputElement).labels?.[0]?.textContent??'')||clean(el.textContent)
 let matches:Element[]=[]
 if(locator.strategy==='css')matches=Array.from(document.querySelectorAll(locator.value))
 else if(locator.strategy==='attribute')matches=Array.from(document.querySelectorAll('['+locator.attribute+']')).filter(el=>el.getAttribute(locator.attribute)===locator.value)
 else if(locator.strategy==='label')matches=Array.from(document.querySelectorAll('input,textarea,select')).filter(el=>name(el)===clean(locator.value))
 else matches=Array.from(document.querySelectorAll('button,a,input,textarea,select,h1,h2,h3,h4,h5,h6,[role]')).filter(el=>{
 const role=el.getAttribute('role')||({BUTTON:'button',A:el.hasAttribute('href')?'link':'',TEXTAREA:'textbox',SELECT:'combobox',H1:'heading',H2:'heading',H3:'heading',H4:'heading',H5:'heading',H6:'heading'} as Record<string,string>)[el.tagName]||(el.tagName==='INPUT'?(['checkbox','radio'].includes((el as HTMLInputElement).type)?(el as HTMLInputElement).type:['button','submit','reset'].includes((el as HTMLInputElement).type)?'button':'textbox'):'')
 return role===locator.role&&name(el)===clean(locator.value)
 })
 matches=matches.filter(el=>!el.closest('[data-routine-highlight],#__routine_inspection_status,#__routine_studio_status'))
 if(matches.length>2000)throw Error('Target is too broad (over 2000 matches); choose a narrower target.')
 for(const el of matches.slice(0,20)){const r=el.getBoundingClientRect();const overlay=document.createElement('div');overlay.setAttribute('data-routine-highlight','true');Object.assign(overlay.style,{position:'fixed',left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',boxSizing:'border-box',border:'3px solid #8fe1ab',background:'transparent',zIndex:'2147483646',pointerEvents:'none'});document.documentElement.append(overlay);setTimeout(()=>overlay.remove(),1800)}
 return matches.length
 },request.locator)
 return {state:'matches',count,message:count+' top-level match'+(count===1?'':'es')+'. '+(count?'Highlighted up to 20 matches temporarily. ':'')+'A single match does not prove semantic correctness. No click, fill, submit or navigation was performed.'}
}
