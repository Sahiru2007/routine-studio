import {_electron as electron,chromium} from 'playwright'
import assert from 'node:assert/strict'
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs'
import {DatabaseSync} from 'node:sqlite'
import {spawn} from 'node:child_process'
import {once} from 'node:events'
import {resolve} from 'node:path'
const root=resolve(import.meta.dirname,'..'),data=resolve(root,'.runtime','recording-test-'+Date.now()),artifacts=resolve(root,'artifacts/milestone-1')
mkdirSync(artifacts,{recursive:true});mkdirSync(resolve(root,'.runtime/temp'),{recursive:true})
const env={...process.env,ROUTINE_STUDIO_DATA:data,ROUTINE_STUDIO_TEST:'1',PLAYWRIGHT_BROWSERS_PATH:'E:/AI/Caches/ms-playwright',TEMP:resolve(root,'.runtime/temp'),TMP:resolve(root,'.runtime/temp')}
delete env.ELECTRON_RUN_AS_NODE;delete env.NODE_COMPILE_CACHE
let app,page,browser
const checks=[],errors=[]
async function launch(){app=await electron.launch({executablePath:resolve(root,'node_modules/electron/dist/electron.exe'),args:[root],env});page=await app.firstWindow();page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));await page.getByRole('heading',{name:'Workflow library',exact:true}).waitFor()}
async function click(name){await page.getByRole('button',{name,exact:true}).click()}
async function info(){return app.evaluate(()=>globalThis.studioTestRecorder.testInfo())}
async function status(){return page.evaluate(()=>window.studio.recordingStatus())}
async function shot(name){await page.screenshot({path:resolve(artifacts,name),animations:'disabled'})}
async function waitState(state){await page.getByRole('status',{name:'Recording session status',exact:true}).getByText(state.toUpperCase(),{exact:true}).waitFor({timeout:30000});assert.equal((await status()).state,state)}
function pass(name){checks.push(name);console.log('PASS:',name)}
async function start(){await click('Start recording');await waitState('recording');await page.waitForFunction(()=>[...document.querySelectorAll('button')].some(b=>b.textContent==='Stop recording'&&!b.disabled));const details=await info();assert.ok(details.port,'Chromium test CDP endpoint');browser=await chromium.connectOverCDP('http://127.0.0.1:'+details.port);const tab=browser.contexts()[0].pages().find(p=>p.url().startsWith('http://127.0.0.1:'));assert.ok(tab);await tab.locator('#__routine_studio_status').waitFor();return tab}
try{
 await launch();await click('Record workflow');await click('Start local demo site');await shot('01-ready.png')
 let tab=await start();await shot('02-recording.png')
 const recordingRuntime=await info();for(const path of Object.values(recordingRuntime.paths))assert.match(path,/^E:[\\/]/i);assert.ok(recordingRuntime.browserVersion)
 pass('Existing E: Chromium runtime, persistent profile, cache, downloads and temp paths verified')
 const session=(await status()).sessionId
 const config=JSON.parse(readFileSync(resolve(data,'recorder-sessions',session,'extension/background.js'),'utf8').split('\n')[0].slice('const STUDIO_CONFIG='.length,-1))
 assert.equal((await fetch(config.endpoint+'/event',{method:'POST',body:'{}'})).status,403)
 assert.equal((await fetch(config.endpoint+'/event',{method:'POST',headers:{Authorization:'Bearer '+config.token,Origin:'http://untrusted.test'},body:'{}'})).status,403)
 const extensionOrigin=await app.evaluate(()=>globalThis.studioTestRecorder.extensionOrigin)
 const invalid={sessionId:crypto.randomUUID(),sequence:1,documentId:crypto.randomUUID(),localSequence:1,payload:{type:'navigate',url:'http://localhost/'}}
 const beforeInvalid=(await info()).raw
 assert.equal((await fetch(config.endpoint+'/event',{method:'POST',headers:{Authorization:'Bearer '+config.token,Origin:extensionOrigin},body:JSON.stringify(invalid)})).status,400)
 assert.deepEqual((await info()).raw,beforeInvalid)
 pass('Unauthenticated, wrong-origin and mismatched-session transport messages rejected without collecting events')
 await tab.getByRole('link',{name:'Create a customer',exact:true}).click();await tab.getByRole('heading',{name:'Add customer',exact:true}).waitFor();await tab.locator('#__routine_studio_status').waitFor()
 await tab.getByLabel('Customer name',{exact:true}).pressSequentially('Alex Example')
 await tab.getByLabel('Email',{exact:true}).fill('alex@example.test')
 await tab.getByLabel('Company',{exact:true}).fill('Example Studio')
 await tab.getByLabel('Password',{exact:true}).fill('SYNTHETIC-SECRET-NEVER-CAPTURE')
 await tab.getByLabel('Payment card number',{exact:true}).fill('SYNTHETIC-PAYMENT-NEVER-CAPTURE')
 await tab.getByRole('button',{name:'Save customer',exact:true}).click();await tab.getByRole('heading',{name:'Customer saved',exact:true}).waitFor();await tab.locator('#__routine_studio_status').waitFor()
 await tab.getByRole('link',{name:'Return to directory',exact:true}).click();await tab.getByText('Alex Example',{exact:true}).waitFor();await tab.locator('#__routine_studio_status').waitFor()
 await tab.screenshot({path:resolve(artifacts,'03-browser-demo.png')})
 await click('Stop recording');await waitState('review');await page.getByRole('region',{name:'Recording review'}).waitFor()
 assert.match(await tab.locator('#__routine_studio_status').textContent(),/Recording stopped/)
 await assert.rejects(fetch(config.endpoint+'/heartbeat',{method:'POST'}))
 const snapshot=await info(),review=await status(),json=JSON.stringify(snapshot.raw)
 const overwriteError=await page.evaluate(async()=>{const s=await window.studio.recordingStatus(),existing=(await window.studio.list())[0];try{await window.studio.recordingSave({sessionId:s.sessionId,workflow:{...s.workflow,id:existing.id}});return 'unexpected success'}catch(e){return e.message}})
 assert.match(overwriteError,/cannot be overwritten/)
 const mismatchError=await page.evaluate(async()=>{const s=await window.studio.recordingStatus();try{await window.studio.recordingSave({sessionId:crypto.randomUUID(),workflow:s.workflow});return 'unexpected success'}catch(e){return e.message}})
 assert.match(mismatchError,/session mismatch/)
 pass('Review save rejects an existing workflow ID and a mismatched session; no overwrite path')
 assert.ok(!json.includes('SYNTHETIC-SECRET')&&!json.includes('SYNTHETIC-PAYMENT')&&!json.includes('SYNTHETIC-HIDDEN'))
 assert.equal(review.workflow.steps.filter(s=>s.type==='fill').length,3)
 assert.equal(review.workflow.steps.filter(s=>s.type==='click'&&s.selector.includes('save-customer')).length,1)
 assert.equal(review.workflow.steps.filter(s=>s.type==='navigate').length,4)
 assert.equal(review.workflow.steps.some(s=>s.type==='assert-visible'),false)
 assert.deepEqual(review.workflow.steps.map(s=>s.type),['navigate','click','navigate','fill','fill','fill','click','navigate','click','navigate'])
 assert.ok(snapshot.raw.filter(e=>e.payload.type==='fill').every(e=>e.payload.target.candidates.some(c=>c.kind==='label')))
 pass('Actual Electron Start, MV3 extension, Chromium form actions, coalesced typing, navigation order, single submit and semantic candidates')
 pass('Password, payment and hidden values absent from raw events')
 await tab.getByRole('link',{name:'Add customer',exact:true}).click();await tab.getByLabel('Customer name',{exact:true}).fill('AFTER-STOP-MUST-NOT-APPEAR');await tab.getByLabel('Email',{exact:true}).focus()
 await new Promise(r=>setTimeout(r,600));assert.deepEqual((await info()).raw,snapshot.raw);pass('No collection after Stop, including new navigation and field changes')
 await page.getByLabel('Recorded workflow title').fill('Recorded customer verification')
 const fillIndex=review.workflow.steps.findIndex(s=>s.type==='fill'&&s.selector.includes('customer-name'))+1
 await page.getByLabel('Recorded step '+fillIndex+' value',{exact:true}).fill('Alex Reviewed')
 await click('Convert recorded step '+fillIndex+' to input')
 await page.getByLabel('Recorded input name',{exact:true}).fill('customer_name')
 // Remove a demonstrated return-to-directory click in the review; raw events remain immutable.
 await click('Remove recorded step 9')
 await shot('04-review-input.png');await page.getByRole('heading',{name:'Review captured steps',exact:true}).scrollIntoViewIfNeeded();await shot('04-review.png');await click('Save recording as new draft')
 await page.getByLabel('Workflow title',{exact:true}).waitFor()
 const saved=(await page.evaluate(()=>window.studio.list())).find(w=>w.title==='Recorded customer verification')
 assert.ok(saved);assert.equal(saved.inputs[0].sample,'Alex Reviewed');assert.equal(saved.steps.length,9)
 assert.ok(!JSON.stringify(saved).includes('SYNTHETIC-SECRET'));assert.ok(!JSON.stringify(saved).includes('SYNTHETIC-PAYMENT'))
 await app.close();app=null;await launch();await click('Recorded customer verification')
 assert.equal(await page.getByLabel('Workflow title',{exact:true}).inputValue(),saved.title)
 assert.deepEqual((await page.evaluate(()=>window.studio.list())).find(w=>w.id===saved.id),saved)
 await shot('05-reopened.png');pass('Review edits, removal, conversion to input, new draft save and exact workflow after full app restart')
 const db=new DatabaseSync(resolve(data,'workflows.sqlite'),{readOnly:true})
 const storedRaw=JSON.parse(db.prepare('SELECT document FROM recordings WHERE workflow_id=?').get(saved.id).document)
 assert.deepEqual(storedRaw.events,snapshot.raw)
 assert.ok(!JSON.stringify(storedRaw).includes('SYNTHETIC-SECRET')&&!JSON.stringify(storedRaw).includes('SYNTHETIC-PAYMENT'))
 db.close();pass('Separate validated raw recording persisted without secrets; review edits did not mutate raw events')
 await click('Record workflow');await click('Start local demo site');tab=await start()
 await click('Cancel recording');await waitState('cancelled')
 assert.equal((await page.evaluate(()=>window.studio.list())).length,2);pass('Cancel closes browser and saves no workflow')
 tab=await start();await tab.getByRole('link',{name:'Create a customer',exact:true}).click();await tab.locator('#__routine_studio_status').waitFor()
 await tab.getByLabel('Customer name',{exact:true}).pressSequentially('Final unblurred value')
 await click('Stop recording');await waitState('review')
 assert.deepEqual((await status()).workflow.steps.filter(s=>s.type==='fill').map(s=>s.value),[{kind:'literal',text:'Final unblurred value'}])
 await click('Cancel recording');await waitState('cancelled');pass('Stop flushes and coalesces the final focused field without a blur')
 tab=await start();await tab.getByRole('link',{name:'Create a customer',exact:true}).click();await tab.locator('#__routine_studio_status').waitFor()
 await tab.getByLabel('Customer name',{exact:true}).pressSequentially('SYNTHETIC-HIDDEN-ANCESTOR')
 await tab.locator('fieldset').evaluate(el=>{el.style.display='none'})
 await click('Stop recording');await waitState('review')
 assert.ok(!JSON.stringify((await info()).raw).includes('SYNTHETIC-HIDDEN-ANCESTOR'))
 await click('Cancel recording');await waitState('cancelled');pass('Field concealed by an ancestor before flush is excluded')
 tab=await start();const browserControl=await browser.newBrowserCDPSession();await browserControl.send('Browser.close');await waitState('interrupted');await shot('06-interrupted.png')
 await click('Cancel recording');await waitState('cancelled');pass('Unexpected full Chromium closure gives recoverable partial review; Cancel permits restart')
 tab=await start()
 const extensions=await browser.contexts()[0].newPage();await extensions.goto('chrome://extensions')
 const item=extensions.locator('extensions-item').filter({hasText:'Routine Studio Recorder'})
 await item.locator('#enableToggle').click()
 await waitState('interrupted');await shot('07-extension-disconnected.png')
 await click('Cancel recording');await waitState('cancelled');pass('Actual extension disable detected through heartbeat loss; partial review and cancellation remain available')
 tab=await start();const finalPort=(await info()).port
 const nativePid=await app.evaluate(()=>process.pid)
 const helper=spawn('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',resolve(root,'scripts/native-dialog.ps1'),'-NativeProcessId',String(nativePid),'-Choice','Cancel recording and close','-PromptText','Close Routine Studio and discard this unsaved recording?','-ScreenshotPath',resolve(artifacts,'08-shutdown-prompt.png')],{env,windowsHide:true,stdio:['ignore','pipe','pipe']})
 let helperOutput='';helper.stdout.on('data',c=>helperOutput+=c);helper.stderr.on('data',c=>helperOutput+=c)
 const helperExit=once(helper,'exit'),appClosed=app.waitForEvent('close')
 await app.evaluate(({BrowserWindow})=>{setTimeout(()=>BrowserWindow.getAllWindows()[0].close(),100)})
 assert.equal((await helperExit)[0],0,helperOutput);await appClosed;await app.close();app=null
 await assert.rejects(fetch('http://127.0.0.1:'+finalPort+'/json/version'))
 await launch();assert.equal((await status()).state,'idle');assert.equal((await page.evaluate(()=>window.studio.list())).length,2)
 pass('Real app shutdown confirmation closes managed Chromium and transport without saving; restart returns idle')
 assert.deepEqual(errors,[])
 writeFileSync(resolve(artifacts,'results.json'),JSON.stringify({checkedAt:new Date().toISOString(),dataPath:data,checks,rendererErrors:errors,savedWorkflowId:saved.id,recordingRuntime:{paths:recordingRuntime.paths,browserVersion:recordingRuntime.browserVersion},rawEvents:snapshot.raw},null,2))
 console.log('Recording verification complete:',artifacts)
}catch(e){if(page&&!page.isClosed()){await shot('failure.png').catch(()=>{});console.error('Recording status:',await status().catch(()=>null))}throw e}
finally{if(app){await page.evaluate(()=>window.studio.recordingCancel()).catch(()=>{});await app.close()}}
