import {_electron as electron} from 'playwright'
import assert from 'node:assert/strict'
import {mkdirSync} from 'node:fs'
import {resolve} from 'node:path'
const root=resolve(import.meta.dirname,'..')
const data=resolve(root,'.runtime','desktop-test-'+Date.now())
const artifacts=resolve(root,'artifacts');mkdirSync(artifacts,{recursive:true})
const env={...process.env,ROUTINE_STUDIO_DATA:data,TEMP:resolve(root,'.runtime/temp'),TMP:resolve(root,'.runtime/temp')}
delete env.ELECTRON_RUN_AS_NODE;delete env.NODE_COMPILE_CACHE
let application, page
const failures=[]
async function launch(){
 application=await electron.launch({args:[root],env})
 application.process().stderr.on('data',chunk=>process.stderr.write(chunk))
 page=await application.firstWindow();page.on('pageerror',e=>failures.push(e.message))
 await page.getByRole('heading',{name:'Workflow library',exact:true}).waitFor()
}
async function click(name){await page.getByRole('button',{name,exact:true}).click()}
try{
 await launch()
 assert.equal(await application.evaluate(({BrowserWindow})=>{const p=BrowserWindow.getAllWindows()[0].webContents.getLastWebPreferences();return p.sandbox&&p.contextIsolation&&!p.nodeIntegration}),true)
 assert.equal(await page.evaluate(()=>typeof window.require),'undefined')
 await page.getByRole('button',{name:'Customer entry',exact:true}).waitFor()
 await page.screenshot({path:resolve(artifacts,'01-library.png')})
 await click('Customer entry')
 await page.getByText('EXAMPLE · Synthetic data. Never recorded or executed.',{exact:true}).waitFor()
 await page.screenshot({path:resolve(artifacts,'02-example-editor.png')})
 await page.locator('.nav-item').first().click()
 await click('New workflow')
 await page.getByLabel('Workflow title',{exact:true}).fill('Restart verification')
 await page.getByLabel('Workflow description').fill('Created and saved through Electron IPC.')
 await click('＋ navigate')
 await page.getByLabel('Destination URL').fill('https://example.com/customer')
 await click('＋ Input')
 await page.getByLabel('Input name',{exact:true}).fill('customer')
 await click('＋ fill')
 await page.getByLabel('Value source').selectOption('input')
 await click('Save workflow')
 await page.getByText('✓ All changes saved',{exact:true}).waitFor()
 await page.getByLabel('Remove input customer').click()
 await page.getByRole('alert').filter({hasText:'used by a fill step'}).waitFor()
 await page.getByLabel('Dismiss error').click()
 await page.getByLabel('Move step 2 up',{exact:true}).click()
 await page.getByLabel('Remove step 2',{exact:true}).click()
 await click('Save workflow')
 await page.getByText('✓ All changes saved',{exact:true}).waitFor()
 assert.equal(await page.evaluate(async()=>{const w=(await window.studio.list()).find(w=>w.title==='Restart verification');return w.steps[0].value.inputId===w.inputs[0].id}),true)
 await page.getByLabel('Workflow title',{exact:true}).fill('Unsaved title')
 await page.locator('.nav-item').first().click()
 await page.getByRole('dialog',{name:'Discard unsaved changes?'}).waitFor()
 await click('Cancel')
 assert.equal(await page.getByLabel('Workflow title',{exact:true}).inputValue(),'Unsaved title')
 await page.locator('.nav-item').first().click();await click('Confirm')
 await page.getByRole('button',{name:'Restart verification',exact:true}).waitFor()
 assert.equal(await page.getByRole('button',{name:'Unsaved title',exact:true}).count(),0)
 const card=page.locator('article').filter({has:page.getByRole('button',{name:'Restart verification',exact:true})})
 await card.getByRole('button',{name:'Delete',exact:true}).click()
 await click('Cancel')
 await page.getByRole('button',{name:'Restart verification',exact:true}).waitFor()
 await application.close()
 await launch()
 await click('Restart verification')
 assert.equal(await page.getByLabel('Workflow description').inputValue(),'Created and saved through Electron IPC.')
 const result=await page.evaluate(async()=>{const w=(await window.studio.list()).find(w=>w.title==='Restart verification');try{await window.studio.save({...w,inputs:[]});return 'unexpected success'}catch(e){return e.message}})
 assert.match(result,/missing input/)
 await page.screenshot({path:resolve(artifacts,'03-reopened-after-restart.png')})
 await page.locator('.nav-item').nth(1).click()
 await page.getByText(data,{exact:true}).waitFor()
 await page.screenshot({path:resolve(artifacts,'04-settings.png')})
 assert.deepEqual(failures,[])
 console.log('PASS: Electron launch, sandbox, real IPC, CRUD editing, save/restart, references, reorder/remove, deletion cancel, discard cancel/confirm, example label and actual E: storage.')
 console.log('Screenshots:',artifacts)
}finally{if(application)await application.close()}


