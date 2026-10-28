import {chromium,type BrowserContext,type Page} from 'playwright'
import {mkdirSync,readFileSync} from 'node:fs'
import {join} from 'node:path'
import {ParentMessage,WorkerMessage,type Plan,type Worker} from '../../../packages/execution-schema'
import {preferredTarget,matchesExpectedText} from '../../../packages/workflow-schema'
import {domTargets} from '../../../packages/workflow-schema/dom-targets'
import {sensitiveField} from '../../../packages/recorder-schema'

let plan:Plan|null=null,context:BrowserContext|null=null,page:Page|null=null,seq=0,parentSeq=0,busy=false,closing=false,paused=false,stop=false,next=0
const approved=new Set<string>(),blockedResources=new Set<string>()
let gate:{id:string;origin:string;resolve:(allow:boolean)=>void;done:Promise<boolean>}|null=null
function send(body:unknown){if(!body||typeof body!=='object')throw Error('Invalid internal event');if(!plan||!process.connected)return;const message=WorkerMessage.parse({...body,runId:plan.runId,seq:++seq});process.send?.(message)}
const heartbeat=setInterval(()=>{if(plan&&!closing)send({type:'heartbeat'})},1000)
class Fault extends Error{constructor(readonly outcome:'action_failed'|'assertion_failed'|'interrupted',message:string,readonly uncertain=false){super(message)}}
const delay=(ms:number)=>new Promise<void>(ok=>setTimeout(ok,ms))
async function waitGate(){const pending=gate;if(pending)await pending.done}
function banner(){const install=()=>{let el=document.getElementById('__routine_run_status');if(!el){el=document.createElement('div');el.id='__routine_run_status';document.documentElement.append(el)}el.textContent='Routine Studio · SUPERVISED RUN · Controls in the app';Object.assign(el.style,{position:'fixed',right:'12px',bottom:'12px',padding:'12px 18px',background:'#36533e',color:'white',font:'13px system-ui',borderRadius:'8px',zIndex:'2147483647',pointerEvents:'none'})};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install()}
async function setBanner(value:string){await page?.evaluate(text=>{const el=document.getElementById('__routine_run_status');if(el)el.textContent='Routine Studio · '+text},value).catch(()=>{})}
async function shutdown(){if(closing){process.disconnect?.();return}closing=true;clearInterval(heartbeat);gate?.resolve(false);await context?.close().catch(()=>{});process.disconnect?.();setTimeout(()=>process.exit(0),0)}
async function fatal(message:string){if(closing)return;send({type:'fatal',detail:message});await shutdown()}
async function askOrigin(origin:string){
 if(stop)return false
 const id=crypto.randomUUID();let resolve!:(value:boolean)=>void;const done=new Promise<boolean>(ok=>resolve=ok)
 gate={id,origin,resolve,done};send({type:'origin',requestId:id,origin});void setBanner('WAITING FOR ORIGIN APPROVAL · No request sent to '+origin)
 const timer=setTimeout(()=>resolve(false),60000)
 const allow=await done;clearTimeout(timer);if(allow)approved.add(origin);gate=null
 void setBanner(paused?'PAUSE REQUESTED · In-flight action may finish':'SUPERVISED RUN · Controls in the app');return allow&&!stop
}
async function init(message:Extract<ReturnType<typeof ParentMessage.parse>,{type:'init'}>){
 plan=message.plan
 if(plan.runId!==message.runId)throw Error('Run mismatch')
 process.env.PLAYWRIGHT_BROWSERS_PATH='E:/AI/Caches/ms-playwright'
 if(!/^E:[\\/]/i.test(chromium.executablePath()))throw Error('Browser must remain on E:')
 for(const origin of plan.reviewedOrigins)approved.add(origin)
 const profile=join(message.storageRoot,'execution-profile');mkdirSync(profile,{recursive:true})
 context=await chromium.launchPersistentContext(profile,{channel:'chromium',headless:false,acceptDownloads:false,serviceWorkers:'block',downloadsPath:join(message.storageRoot,'execution-downloads'),timeout:15000,args:['--enable-automation','--disk-cache-dir='+join(message.storageRoot,'execution-cache'),...(message.test?['--remote-debugging-port=0']:[])],env:{...process.env,TEMP:process.env.TEMP!,TMP:process.env.TMP!}})
 page=context.pages()[0]??await context.newPage()
 for(const tab of context.pages())if(tab!==page)await tab.close()
 await context.addInitScript(banner);await page.evaluate(banner)
 context.on('close',()=>{if(!closing)void fatal('Managed Chromium closed. Any unfinished dispatched action may have changed data; no retry.')})
 context.on('page',tab=>{void tab.close().catch(()=>{});void fatal('A new tab/popup is unsupported. Execution interrupted; no further steps will dispatch.')})
 page.on('download',()=>{void fatal('A download is unsupported. Execution interrupted; no retry.')})
 page.on('dialog',dialog=>{void dialog.dismiss();void fatal('A browser dialog requires manual review. Execution interrupted without retry.')})
 await context.routeWebSocket('**/*',socket=>socket.close({code:1008,reason:'WebSockets are unsupported in supervised runs'}))
 // Chromium Fetch pauses every request, including each HTTP redirect hop. Playwright
 // routing alone only handles the first URL in a redirect chain.
 const network=await context.newCDPSession(page)
 const frameId=(await network.send('Page.getFrameTree')).frameTree.frame.id
 network.on('Fetch.requestPaused',async event=>{
 try{
 const url=new URL(event.request.url),navigation=event.resourceType==='Document',abort=()=>network.send('Fetch.failRequest',{requestId:event.requestId,errorReason:'BlockedByClient'})
 if(stop||closing)return void await abort()
 if(!['http:','https:'].includes(url.protocol))return void await abort()
 if(navigation&&event.frameId!==frameId)return void await abort()
 if(navigation&&!busy){await abort();void fatal('Navigation outside a dispatched step is unsupported; run interrupted without further dispatch.');return}
 if(!approved.has(url.origin)){
 if(navigation){
 if(gate||!await askOrigin(url.origin))return void await abort()
 }else{if(!blockedResources.has(url.origin)){blockedResources.add(url.origin);if(blockedResources.size<=100)send({type:'warning',detail:'Blocked an unreviewed third-party resource origin: '+url.origin})}return void await abort()}
 }
 await network.send('Fetch.continueRequest',{requestId:event.requestId})
 }catch{await network.send('Fetch.failRequest',{requestId:event.requestId,errorReason:'BlockedByClient'}).catch(()=>{})}
 })
 await network.send('Fetch.enable',{patterns:[{urlPattern:'*',requestStage:'Request'}]})
 const port=message.test?Number(readFileSync(join(profile,'DevToolsActivePort'),'utf8').split('\n')[0]):undefined
 send({type:'ready',...(port?{port}:{})})
}
async function exactHandle(index:number){
 const step=plan!.snapshot.steps[index]
 if(step.type==='navigate'||step.type==='unsupported')throw new Fault('action_failed','Unsupported target step.')
 const list=await page!.evaluateHandle(domTargets,preferredTarget(step));const count=await list.evaluate(nodes=>nodes.length)
 if(count!==1){await list.dispose();throw new Fault(step.type==='assert-visible'?'assertion_failed':'action_failed','Exactly one matching target required; found '+count+'. No target action performed.')}
 const node=(await list.getProperty('0')).asElement();await list.dispose();if(!node)throw new Fault('action_failed','Target is no longer a supported DOM element.')
 return node
}
async function perform(index:number){
 if(!plan||!page||busy||paused||stop||index!==next||gate)throw Error('Invalid step dispatch')
 busy=true;let touched=false,timedOut=false,elapsed=0
 const step=plan.snapshot.steps[index],budget=plan.limits?.stepTimeoutMs??8000
 let timer:ReturnType<typeof setInterval>|undefined
 const task=async()=>{
 if(step.type==='navigate'){await page!.goto(step.url,{waitUntil:'domcontentloaded',timeout:0});return}
 if(step.type==='unsupported')throw new Fault('action_failed','Unsupported steps cannot execute.')
 if(step.type==='assert-visible'){
 const deadline=Date.now()+Math.min(6000,budget-100)
 while(Date.now()<deadline){
 let handle:Awaited<ReturnType<typeof exactHandle>>|null=null
 try{handle=await exactHandle(index);const result=await handle.evaluate(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return {visible:r.width>0&&r.height>0&&s.display!=='none'&&!['hidden','collapse'].includes(s.visibility),text:(el.textContent??'').slice(0,10000)}});if(result.visible&&(!step.expectedText||matchesExpectedText(result.text,step.expectedText)))return}
 catch(error){if(error instanceof Fault&&error.message.includes('found 0')){}else throw error}
 finally{await handle?.dispose()}
 await delay(100)
 }
 throw new Fault('assertion_failed','Configured visibility or expected-text condition was not met within its bounded check timeout. This remains a failed assertion.')
 }
 const handle=await exactHandle(index)
 try{
 const metadata=await handle.evaluate(el=>{const input=el as HTMLInputElement;return {tag:el.tagName.toLowerCase(),type:input.type??'',name:el.getAttribute('name')??'',id:el.id,autocomplete:el.getAttribute('autocomplete')??'',label:input.labels?.[0]?.textContent??el.getAttribute('aria-label')??'',hidden:!!el.closest('[hidden],[aria-hidden="true"]')||el.getClientRects().length===0}})
 if(sensitiveField(metadata))throw new Fault('action_failed','Sensitive/password/payment/authentication or hidden targets are unsupported. No field value read or filled.')
 const recheck=await page!.evaluateHandle(domTargets,preferredTarget(step));const same=await recheck.evaluate((nodes,el)=>nodes.length===1&&nodes[0]===el,handle);await recheck.dispose();if(!same)throw new Fault('action_failed','Target changed or became ambiguous before action. No alternative selected.')
 if(step.type==='fill'){
 if(!(metadata.tag==='textarea'||metadata.tag==='input'&&['text','email','tel','url','search','number'].includes(metadata.type)))throw new Fault('action_failed','Only ordinary text-like inputs and textareas support fill.')
 touched=true;await handle.fill(plan!.steps[index].fillValue!,{timeout:0})
 }else{
 const supported=await handle.evaluate(el=>el instanceof HTMLButtonElement||el instanceof HTMLAnchorElement&&!el.hasAttribute('download')&&/^https?:/.test(el.href)||el instanceof HTMLInputElement&&['button','submit','reset','checkbox','radio'].includes(el.type))
 if(!supported)throw new Fault('action_failed','Click target is unsupported; use a native button/link/form control. No click performed.')
 const navigation=page!.waitForEvent('framenavigated',{predicate:frame=>frame===page!.mainFrame(),timeout:400}).catch(()=>null)
 touched=true;await handle.click({timeout:0});await navigation;await waitGate();await page!.waitForLoadState('domcontentloaded',{timeout:0})
 }
 }finally{await handle.dispose()}
 }
 try{
 await Promise.race([(async()=>{await setBanner('RUNNING STEP '+(index+1)+' · '+step.type.toUpperCase());await task()})(),new Promise<never>((_ok,fail)=>{timer=setInterval(()=>{if(!gate)elapsed+=100;if(elapsed>=budget){timedOut=true;fail(new Fault(step.type==='assert-visible'?'assertion_failed':touched?'interrupted':'action_failed','Step exceeded its bounded active timeout. No automatic retry.',touched))}},100)})])
 await waitGate()
 send({type:'result',index,outcome:'completed',detail:step.type==='assert-visible'?'Configured UI assertion met; this does not establish database correctness.':'Configured step completed.',uncertain:false});next++
 }catch(error){
 const fault=error instanceof Fault?error:new Fault(touched?'interrupted':step.type==='assert-visible'?'assertion_failed':'action_failed',touched?'Action outcome uncertain after browser/navigation failure. It may have changed data; no retry.':'Action or browser navigation failed. No automatic retry.',touched)
 send({type:'result',index,outcome:fault.outcome,detail:fault.message.slice(0,500),uncertain:fault.uncertain})
 if(timedOut){closing=true;await context?.close().catch(()=>{});closing=false}
 }finally{if(timer)clearInterval(timer);busy=false;if(stop)await shutdown()}
}
process.on('message',raw=>{
 try{const message=ParentMessage.parse(raw);if(message.seq!==parentSeq+1||plan&&message.runId!==plan.runId)throw Error('Message mismatch');parentSeq=message.seq
 if(message.type==='init'){if(plan)throw Error('Duplicate init');void init(message).catch(()=>fatal('Execution browser could not start. No workflow steps were executed.'));return}
 if(!plan)throw Error('No run initialized')
 if(message.type==='step'){void perform(message.index).catch(()=>fatal('Worker rejected an invalid or competing step dispatch.'));return}
 if(message.type==='pause'){paused=message.paused;void setBanner(paused?'PAUSE REQUESTED · In-flight action may finish':'SUPERVISED RUN · Controls in the app');return}
 if(message.type==='origin'){if(!gate||gate.id!==message.requestId)throw Error('Origin request mismatch');gate.resolve(message.allow);return}
 if(message.type==='shutdown'){stop=true;gate?.resolve(false);if(!busy)void shutdown()}
 }catch{void fatal('Invalid main/worker message. Execution interrupted; no further actions.')}
})
process.on('disconnect',()=>{void shutdown()})
process.on('SIGTERM',()=>{void shutdown()})
