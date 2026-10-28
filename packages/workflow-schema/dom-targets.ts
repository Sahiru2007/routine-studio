import type {Locator} from './document'
// Serializable, fixed top-level DOM matcher shared by inspection and execution.
export function domTargets(locator:Locator):Element[]{
 const clean=(s:string|null)=>s?.replace(/\s+/g,' ').trim()??''
 const name=(el:Element)=>clean(el.getAttribute('aria-label'))||clean((el.getAttribute('aria-labelledby')??'').split(' ').map(id=>document.getElementById(id)?.textContent??'').join(' '))||clean((el as HTMLInputElement).labels?.[0]?.textContent??'')||clean(el.textContent)
 let matches:Element[]=[]
 if(locator.strategy==='css')matches=Array.from(document.querySelectorAll(locator.value))
 else if(locator.strategy==='attribute')matches=Array.from(document.querySelectorAll('['+locator.attribute+']')).filter(el=>el.getAttribute(locator.attribute)===locator.value)
 else if(locator.strategy==='label')matches=Array.from(document.querySelectorAll('input,textarea,select')).filter(el=>name(el)===clean(locator.value))
 else matches=Array.from(document.querySelectorAll('button,a,input,textarea,select,h1,h2,h3,h4,h5,h6,[role]')).filter(el=>{const role=el.getAttribute('role')||({BUTTON:'button',A:el.hasAttribute('href')?'link':'',TEXTAREA:'textbox',SELECT:'combobox',H1:'heading',H2:'heading',H3:'heading',H4:'heading',H5:'heading',H6:'heading'} as Record<string,string>)[el.tagName]||(el.tagName==='INPUT'?(['checkbox','radio'].includes((el as HTMLInputElement).type)?(el as HTMLInputElement).type:['button','submit','reset'].includes((el as HTMLInputElement).type)?'button':'textbox'):'');return role===locator.role&&name(el)===clean(locator.value)})
 matches=matches.filter(el=>!el.closest('[data-routine-highlight],#__routine_inspection_status,#__routine_studio_status,#__routine_run_status'))
 if(matches.length>2000)throw Error('Target is too broad (over 2000 matches); choose a narrower target.')
 return matches
}
