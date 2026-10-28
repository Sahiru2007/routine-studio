import {_electron as electron,chromium} from 'playwright'
import assert from 'node:assert/strict'
import {existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs'
import {spawn} from 'node:child_process'
import {resolve,join} from 'node:path'

const root=resolve(import.meta.dirname,'..')
const copy=process.env.ROUTINE_STUDIO_PACKAGED_COPY||'E:\\AI\\Downloads\\Temp\\Routine Studio 6A Verification Copy'
const executable=join(copy,'Routine Studio.exe')
const resources=join(copy,'resources','app')
const data=resolve(root,'.runtime','packaged-test-'+Date.now())
const artifacts=resolve(root,'artifacts','milestone-6a')
mkdirSync(data,{recursive:true});mkdirSync(artifacts,{recursive:true})
assert.ok(existsSync(executable),'Packaged executable missing: '+executable)
for(const excluded of ['apps','packages','scripts','docs','.runtime','artifacts'])assert.equal(existsSync(join(resources,excluded)),false,'Development/source directory leaked: '+excluded)
const env={...process.env,ROUTINE_STUDIO_DATA:data,ROUTINE_STUDIO_BROWSER_PATH:'E:/AI/Caches/ms-playwright',ROUTINE_STUDIO_TEST:'1',TEMP:join(data,'temp'),TMP:join(data,'temp')}
delete env.ELECTRON_RUN_AS_NODE;delete env.NODE_COMPILE_CACHE;delete env.ELECTRON_RENDERER_URL
let app,page,browser
const checks=[],errors=[],pass=name=>{checks.push(name);console.log('PASS:',name)}
async function launch(launchEnv=env){app=await electron.launch({executablePath:executable,cwd:copy,env:launchEnv});page=await app.firstWindow();page.setDefaultTimeout(30000);page.on('pageerror',e=>errors.push(e.message));await page.getByRole('heading',{name:'Workflow library',exact:true}).waitFor()}
async function click(name){await page.getByRole('button',{name,exact:true}).click()}
async function nativeFile(file,{cancel=false,title}={}){const pid=await app.evaluate(()=>process.pid);await new Promise((ok,fail)=>{const args=['-NoProfile','-ExecutionPolicy','Bypass','-File',resolve(root,'scripts/file-dialog.ps1'),'-NativeProcessId',String(pid),'-DialogTitle',title,...(cancel?['-Cancel']:['-FilePath',file])],helper=spawn('powershell.exe',args,{env,windowsHide:true,stdio:['ignore','pipe','pipe']});let output='';helper.stdout.on('data',s=>output+=s);helper.stderr.on('data',s=>output+=s);helper.on('exit',code=>code===0?ok():fail(Error(output)))})}
async function batchState(state){await page.getByRole('status',{name:'Batch state',exact:true}).getByText(state.toUpperCase(),{exact:true}).waitFor({timeout:180000})}
try{
 await launch()
 const readiness=await page.evaluate(()=>window.studio.status())
 assert.equal(readiness.packaged,true);assert.equal(readiness.dataPath,data);assert.ok(readiness.browserReady);assert.ok(readiness.resourcePath.startsWith(resources));assert.ok(existsSync(readiness.sampleCsvPath));assert.match(readiness.sampleCsvPath,/packaged-customers\.csv$/)
 assert.equal((await page.evaluate(()=>window.studio.assistanceStatus())).state,'offline')
 await click('Settings & status');await page.getByRole('status',{name:'Browser readiness'}).filter({hasText:'Ready'}).waitFor();await page.screenshot({path:join(artifacts,'01-packaged-readiness.png'),animations:'disabled'})
 pass('Direct packaged executable reports isolated E: storage, packaged resources, external Chromium readiness and graceful offline Ollama status')

 await click('Record workflow');await click('Start local demo site');await click('Start recording');await page.getByRole('status',{name:'Recording session status'}).getByText('RECORDING',{exact:true}).waitFor()
 const info=await app.evaluate(()=>globalThis.studioTestRecorder.testInfo()),managed=await chromium.connectOverCDP('http://127.0.0.1:'+info.port);browser=managed
 const tab=managed.contexts()[0].pages().find(p=>p.url().startsWith('http://127.0.0.1:'));assert.ok(tab)
 await tab.getByRole('link',{name:'Create a customer',exact:true}).click();await tab.getByRole('heading',{name:'Add customer',exact:true}).waitFor();await tab.getByLabel('Customer name',{exact:true}).fill('Recorded Package Seed');await tab.getByLabel('Email',{exact:true}).fill('seed@example.test');await tab.getByLabel('Company',{exact:true}).fill('Seed Company');await tab.getByRole('button',{name:'Save customer',exact:true}).click();await tab.getByRole('heading',{name:'Customer saved',exact:true}).waitFor()
 await click('Stop recording');await page.getByRole('status',{name:'Recording session status'}).getByText('REVIEW',{exact:true}).waitFor()
 const saved=await page.evaluate(async()=>{const state=await window.studio.recordingStatus(),w=structuredClone(state.workflow),names=['customer_name','customer_email','company'],inputs=names.map((name,i)=>({id:crypto.randomUUID(),name,sample:i===1?'sample@example.test':'Sample',required:true,validation:{format:i===1?'email':'text',minLength:0,maxLength:10000}}));let n=0;w.title='Packaged customer workflow';w.description='Recorded and configured in the unpacked candidate';w.inputs=inputs;w.steps=w.steps.map(step=>step.type==='fill'?{...step,value:{kind:'input',inputId:inputs[n++].id}}:step);w.steps.push({id:crypto.randomUUID(),label:'Explicit saved confirmation',type:'assert-visible',selector:'[role="status"]',expectedText:{mode:'exact',value:'The synthetic customer was added to disposable demo data.'}});return window.studio.recordingSave({sessionId:state.sessionId,workflow:w})})
 assert.equal(saved.inputs.length,3);assert.equal(saved.steps.filter(s=>s.type==='assert-visible').length,1);await page.reload();await click('Packaged customer workflow');await page.getByLabel('Workflow title',{exact:true}).waitFor();await page.screenshot({path:join(artifacts,'02-packaged-configured-workflow.png'),animations:'disabled'})
 await app.close();app=null;await launch();assert.deepEqual((await page.evaluate(()=>window.studio.list())).find(w=>w.id===saved.id),saved)
 pass('Packaged MV3 extension recorded a real demo form; configured inputs/check and saved workflow reopened after full packaged-app restart')

 await page.evaluate(async()=>{await window.studio.demoStart();await window.studio.demoReset()});await click('CSV batches');await click('Import CSV…');await nativeFile(readiness.sampleCsvPath,{title:'Import UTF-8 CSV from E:'});await page.getByLabel('Dataset title',{exact:true}).waitFor();await click('Save dataset');await page.getByLabel('CSV workflow revision').selectOption(saved.id);for(const [name,column]of [['customer_name','0'],['customer_email','1'],['company','2']])await page.getByLabel('Map '+name,{exact:true}).selectOption(column);await page.getByLabel('Mapping title').fill('Packaged sample mapping');await click('Save mapping');await click('Validate & preview');await page.getByRole('status',{name:'CSV validation counts'}).filter({hasText:'3 valid · 0 invalid'}).waitFor();await click('Review batch');await batchState('review');await page.screenshot({path:join(artifacts,'03-packaged-batch-review.png'),animations:'disabled'});await page.getByLabel('Approve batch rows values origins and limits').check();await click('Start approved batch');await batchState('completed')
 const customers=JSON.parse(readFileSync(join(data,'demo','customers.json'),'utf8'));assert.deepEqual(customers,[{name:'Packaged Customer 01',email:'packaged01@example.test',company:'Packaged Example 01'},{name:'Packaged Customer 02',email:'packaged02@example.test',company:'Packaged Example 02'},{name:'Packaged Customer 03',email:'packaged03@example.test',company:'Packaged Example 03'}]);await page.screenshot({path:join(artifacts,'04-packaged-batch-complete.png'),animations:'disabled'})
 const exported=join(data,'exports','packaged-batch-results.json');await click('Export batch JSON…');await nativeFile(exported,{title:'Export concise JSON results on E:'});await page.getByRole('status',{name:'Export result'}).filter({hasText:'Saved result summary'}).waitFor();assert.ok(existsSync(exported));const summary=JSON.parse(readFileSync(exported,'utf8'));assert.equal(summary.rows.length,3);assert.ok(summary.rows.every(r=>r.state==='completed'))
 pass('Packaged sample CSV imported through the native dialog; actual worker/Chromium batch created exactly three expected records and exported durable results')

 const sourceText=readFileSync(join(resources,'out','main','index.js'),'utf8');assert.equal(sourceText.includes('E:\\projects\\routine-studio'),false)
 pass('Packaged resources contain no source tree or hard-coded source checkout path; no development server was used')
 await app.close();app=null;const missingEnv={...env,ROUTINE_STUDIO_BROWSER_PATH:'E:/AI/Caches/missing-routine-studio-browser'};await launch(missingEnv);const missing=await page.evaluate(()=>window.studio.status());assert.equal(missing.browserReady,false);const manual=await page.evaluate(()=>window.studio.save({formatVersion:2,id:crypto.randomUUID(),title:'Manual offline workflow',description:'Saved without Chromium or Ollama',example:false,revision:0,updatedAt:new Date().toISOString(),inputs:[],steps:[{id:crypto.randomUUID(),label:'Open example',type:'navigate',url:'https://example.com'}]}));assert.equal(manual.revision,1);await click('Settings & status');await page.getByRole('status',{name:'Browser readiness'}).filter({hasText:'Not ready'}).waitFor();await page.screenshot({path:join(artifacts,'05-packaged-missing-dependencies.png'),animations:'disabled'});pass('Missing configured Chromium is actionable and missing Ollama/Chromium do not prevent normal manual workflow persistence')
 assert.equal(errors.length,0);writeFileSync(join(artifacts,'packaged-results.json'),JSON.stringify({checkedAt:new Date().toISOString(),copy,executable,resources,data,checks,rendererErrors:errors},null,2))
}finally{if(browser)await browser.close().catch(()=>{});if(app){await page?.evaluate(async()=>{for(const b of await window.studio.batchList())if(!['completed','stopped','interrupted','review'].includes(b.state))await window.studio.batchStop({id:b.id});window.studio.dirty(false)}).catch(()=>{});await app.close().catch(()=>{})}}
