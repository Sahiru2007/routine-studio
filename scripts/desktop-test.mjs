import {_electron as electron} from 'playwright'
import assert from 'node:assert/strict'
import {existsSync,mkdirSync,writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {spawn} from 'node:child_process'
import {once} from 'node:events'
const root=resolve(import.meta.dirname,'..')
const data=resolve(root,'.runtime','desktop-test-'+Date.now()),artifacts=resolve(root,'artifacts')
const executablePath=resolve(root,'node_modules/electron/dist/electron.exe')
for(const p of [data,artifacts,resolve(root,'.runtime/temp')])mkdirSync(p,{recursive:true})
assert.ok(existsSync(executablePath),'Install Electron first; this test never downloads a runtime or browser.')
const env={...process.env,ROUTINE_STUDIO_DATA:data,TEMP:resolve(root,'.runtime/temp'),TMP:resolve(root,'.runtime/temp'),electron_config_cache:'E:/AI/Cache/electron',PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD:'1'}
delete env.ELECTRON_RUN_AS_NODE;delete env.NODE_COMPILE_CACHE
let application,page
const failures=[],checks=[]
function passed(name){checks.push(name);console.log('PASS:',name)}
async function launch(){
 application=await electron.launch({executablePath,args:[root],env,timeout:30000})
 application.process().stderr.on('data',chunk=>process.stderr.write(chunk))
 page=await application.firstWindow();page.on('pageerror',e=>failures.push(e.message));page.setDefaultTimeout(10000)
 await page.getByRole('heading',{name:'Workflow library',exact:true}).waitFor()
}
async function click(name){await page.getByRole('button',{name,exact:true}).click()}
async function screenshot(name){await page.screenshot({path:resolve(artifacts,name),animations:'disabled'})}
async function saved(){await page.getByRole('status').filter({hasText:'All changes saved'}).waitFor()}
async function documents(){return page.evaluate(()=>window.studio.list())}
async function nativeClose(choice,screenshotName){
 // Exercise the real OS dialog with Windows UI Automation; no dialog stubs.
 const nativePid=await application.evaluate(()=>process.pid)
 const helper=spawn('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',resolve(root,'scripts/native-dialog.ps1'),'-NativeProcessId',String(nativePid),'-Choice',choice,...(screenshotName?['-ScreenshotPath',resolve(artifacts,screenshotName)]:[])],{env,windowsHide:true,stdio:['ignore','pipe','pipe']})
 let output='';helper.stdout.on('data',c=>output+=c);helper.stderr.on('data',c=>output+=c)
 const exited=once(helper,'exit')
 const closed=choice==='Discard changes'?application.waitForEvent('close'):null
 await application.evaluate(({BrowserWindow})=>{setTimeout(()=>BrowserWindow.getAllWindows()[0].close(),100)})
 const [code]=await exited
 assert.equal(code,0,output)
 if(choice==='Keep editing'){assert.equal(page.isClosed(),false)}
 else {await closed;await application.close();application=null}
 console.log(output.trim())
}
try{
 await launch()
 const runtime=await application.evaluate(({app,BrowserWindow})=>{
 const p=BrowserWindow.getAllWindows()[0].webContents.getLastWebPreferences()
 return {execPath:process.execPath,version:process.versions.electron,sandbox:p.sandbox,contextIsolation:p.contextIsolation,nodeIntegration:p.nodeIntegration,
 paths:Object.fromEntries(['userData','sessionData','logs','crashDumps','temp'].map(name=>[name,app.getPath(name)])),
 diskCache:app.commandLine.getSwitchValue('disk-cache-dir'),electronCache:process.env.electron_config_cache}
 })
 assert.equal(runtime.sandbox,true);assert.equal(runtime.contextIsolation,true);assert.equal(runtime.nodeIntegration,false)
 for(const p of [runtime.execPath,runtime.diskCache,runtime.electronCache,...Object.values(runtime.paths)])assert.match(p,/^E:[\\/]/i)
 assert.equal(await page.evaluate(()=>typeof window.require),'undefined')
 passed('Actual Electron sandbox, isolated preload, E: executable/cache/temp/app paths')
 await screenshot('01-library.png')
 await click('Customer entry')
 await page.getByText('EXAMPLE · Synthetic data. Never recorded or executed.',{exact:true}).waitFor()
 await screenshot('02-example-editor.png')
 await click('Workflows');await click('New workflow')
 await page.getByLabel('Workflow title',{exact:true}).fill('Restart verification')
 await page.getByLabel('Workflow description').fill('Synthetic workflow saved through real Electron IPC.')
 await click('Add navigate step')
 await page.getByLabel('Destination URL').fill('https://example.com/customer')
 await click('Add fill step')
 await page.getByLabel('Step label',{exact:true}).fill('Enter customer name')
 await page.getByLabel('Element selector').fill('[name="customer"]')
 await page.getByLabel('Value source').selectOption('input')
 await page.getByRole('button',{name:/Fill step references a missing input/}).waitFor()
 assert.equal((await documents()).some(w=>w.title==='Restart verification'),false)
 await screenshot('03-invalid-reference.png')
 await click('Add workflow input')
 await page.getByLabel('Input name',{exact:true}).fill('customer')
 await page.getByLabel('Synthetic sample value').fill('Alex Example')
 const inputId=await page.getByLabel('Input reference').locator('option').nth(1).getAttribute('value')
 await page.getByLabel('Input reference').selectOption(inputId)
 await click('Add click step');await page.getByLabel('Step label',{exact:true}).fill('Submit customer')
 await click('Add assert-visible step');await click('Save workflow');await saved()
 const original=(await documents()).find(w=>w.title==='Restart verification')
 assert.equal(original.steps.length,4);assert.equal(original.revision,1)
 await click('Remove input customer')
 await page.getByRole('alert').filter({hasText:'used by a fill step'}).waitFor()
 assert.equal(await page.getByLabel('Input name',{exact:true}).inputValue(),'customer')
 await click('Dismiss error')
 await click('Move step 2 down')
 await page.getByRole('button',{name:'Select step 3: Enter customer name',exact:true}).waitFor()
 await page.getByRole('button',{name:'Select step 2: Submit customer',exact:true}).waitFor()
 await click('Move step 3 up')
 await page.getByRole('button',{name:'Select step 2: Enter customer name',exact:true}).waitFor()
 await click('Remove step 3')
 await page.getByLabel('Input name',{exact:true}).fill('customer_full_name')
 await page.getByLabel('Workflow title',{exact:true}).fill('Verified customer draft')
 await click('Save workflow');await saved()
 const edited=(await documents()).find(w=>w.id===original.id)
 assert.deepEqual(edited.steps,[original.steps[0],original.steps[1],original.steps[3]])
 assert.equal(edited.inputs[0].id,inputId);assert.equal(edited.inputs[0].name,'customer_full_name');assert.equal(edited.revision,2)
 passed('Create, edit, rename, reorder both directions, remove step, stable IDs/references and explicit save')
 const invalidResult=await page.evaluate(async id=>{const w=(await window.studio.list()).find(w=>w.id===id);try{await window.studio.save({...w,title:42});return 'unexpected success'}catch(e){return e.message}},original.id)
 assert.match(invalidResult,/expected string/)
 assert.deepEqual((await documents()).find(w=>w.id===original.id),edited)
 passed('Missing reference shown as actionable configuration issue; structurally invalid IPC save rejected without revision change')
 await click('Workflows');await click('Verified customer draft')
 assert.equal(await page.getByLabel('Workflow description').inputValue(),edited.description)
 await page.getByLabel('Workflow title',{exact:true}).fill('Discard me')
 await click('Workflows')
 let discard=page.getByRole('dialog',{name:'Discard unsaved changes?',exact:true})
 await discard.waitFor();await screenshot('04-discard-prompt.png')
 await discard.getByRole('button',{name:'Cancel',exact:true}).click()
 assert.equal(await page.getByLabel('Workflow title',{exact:true}).inputValue(),'Discard me')
 await click('Workflows');await page.keyboard.press('Escape');assert.equal(await discard.count(),0)
 await click('Workflows');await discard.getByRole('button',{name:'Confirm',exact:true}).click()
 await click('Verified customer draft')
 assert.equal(await page.getByLabel('Workflow title',{exact:true}).inputValue(),edited.title)
 passed('Close/reopen editor; navigation discard prompt, Cancel, Escape and confirmed discard')
 await page.getByLabel('Workflow title',{exact:true}).fill('Native unsaved edit')
 await page.getByRole('status').filter({hasText:'Unsaved changes'}).waitFor()
 await nativeClose('Keep editing','05-native-close-prompt.png')
 assert.equal(await page.getByLabel('Workflow title',{exact:true}).inputValue(),'Native unsaved edit')
 await nativeClose('Discard changes')
 await launch()
 assert.deepEqual((await documents()).find(w=>w.id===original.id),edited)
 await click('Verified customer draft')
 assert.equal(await page.getByLabel('Workflow title',{exact:true}).inputValue(),edited.title)
 await screenshot('06-reopened-after-restart.png')
 passed('Real native window-close Cancel/Discard; full restart preserves exact saved document')
 await click('Workflows');await click('Delete Verified customer draft')
 await page.getByRole('dialog',{name:'Delete workflow?',exact:true}).waitFor()
 await screenshot('07-delete-prompt.png');await click('Cancel')
 assert.deepEqual((await documents()).find(w=>w.id===original.id),edited)
 await application.close();application=null;await launch()
 await page.getByRole('button',{name:'Verified customer draft',exact:true}).waitFor()
 passed('Deletion cancellation preserves workflow across full restart')
 await click('Delete Verified customer draft');await click('Confirm')
 await page.getByRole('button',{name:'Verified customer draft',exact:true}).waitFor({state:'detached'})
 await click('Delete Customer entry');await click('Confirm')
 await page.getByRole('button',{name:'Customer entry',exact:true}).waitFor({state:'detached'})
 await application.close();application=null;await launch()
 assert.deepEqual(await documents(),[])
 await screenshot('08-empty-after-deletion-restart.png')
 passed('Confirmed deletion across restart, including last workflow/example')
 await click('Settings & status');await page.getByText(data,{exact:true}).waitFor()
 await screenshot('09-settings.png');assert.deepEqual(failures,[])
 writeFileSync(resolve(artifacts,'desktop-results.json'),JSON.stringify({checkedAt:new Date().toISOString(),dataPath:data,runtime,checks,rendererErrors:failures},null,2))
 console.log('All desktop checks passed. Screenshots:',artifacts)
}catch(error){if(page&&!page.isClosed())await screenshot('failure.png').catch(()=>{});throw error}
finally{if(application){if(failures.length||!checks.some(c=>c.startsWith('Confirmed deletion')))application.process().kill();else await application.close()}}
