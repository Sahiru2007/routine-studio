import {_electron as electron} from 'playwright'
import assert from 'node:assert/strict'
import {createServer} from 'node:http'
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs'
import {join,resolve} from 'node:path'

const root=resolve(import.meta.dirname,'..')
const data=resolve(root,'.runtime','openai-assistance-test-'+Date.now())
const artifacts=resolve(root,'artifacts','milestone-7')
mkdirSync(data,{recursive:true});mkdirSync(artifacts,{recursive:true})
const key='mock-openai-key-never-real-credential'
let requests=[]
function response(value){return {id:'resp_mock',object:'response',created_at:1,status:'completed',error:null,incomplete_details:null,instructions:null,max_output_tokens:700,model:'gpt-5.4-mini',output:[{id:'msg',type:'message',status:'completed',role:'assistant',content:[{type:'output_text',text:JSON.stringify(value),annotations:[],logprobs:[]}]}],parallel_tool_calls:true,previous_response_id:null,reasoning:{effort:null,summary:null},store:false,temperature:1,text:{format:{type:'json_schema'},verbosity:'medium'},tool_choice:'auto',tools:[],top_p:1,truncation:'disabled',usage:{input_tokens:10,input_tokens_details:{cached_tokens:0},output_tokens:5,output_tokens_details:{reasoning_tokens:0},total_tokens:15},metadata:{}}}
const server=createServer((req,res)=>{let raw='';req.on('data',c=>raw+=c);req.on('end',()=>{requests.push({method:req.method,url:req.url,authorization:req.headers.authorization,body:raw?JSON.parse(raw):null});res.setHeader('content-type','application/json');if(req.url==='/v1/models'){res.end(JSON.stringify({object:'list',data:[]}));return}res.end(JSON.stringify(response({guidance:'Review this bounded synthetic issue; validation remains authoritative.'})))})})
await new Promise(ok=>server.listen(0,'127.0.0.1',ok))
const base='http://127.0.0.1:'+server.address().port+'/v1/'
const env={...process.env,ROUTINE_STUDIO_DATA:data,ROUTINE_STUDIO_TEST:'1',ROUTINE_STUDIO_OPENAI_TEST_BASE_URL:base,TEMP:resolve(root,'.runtime/temp'),TMP:resolve(root,'.runtime/temp'),PLAYWRIGHT_BROWSERS_PATH:'E:/AI/Caches/ms-playwright'}
delete env.ELECTRON_RUN_AS_NODE;delete env.NODE_COMPILE_CACHE
let app,page
const checks=[],errors=[],pass=s=>{checks.push(s);console.log('PASS:',s)}
async function launch(){const packaged=process.env.ROUTINE_STUDIO_TEST_EXECUTABLE;app=await electron.launch({executablePath:packaged||resolve(root,'node_modules/electron/dist/electron.exe'),args:packaged?[]:[root],env});page=await app.firstWindow();page.setDefaultTimeout(30000);page.on('pageerror',e=>errors.push(e.message));await page.getByRole('heading',{name:'Workflow library',exact:true}).waitFor()}
async function close(){if(app){await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].destroy()).catch(()=>{});await app.close().catch(()=>{});app=null}}
try{
 await launch();await page.getByRole('button',{name:'Settings & status',exact:true}).click()
 await page.getByLabel('Assistance provider',{exact:true}).selectOption('openai')
 await page.getByLabel('OpenAI model ID').fill('gpt-5.4-mini')
 await page.getByText('I understand the disclosure').getByRole('checkbox').check()
 await page.getByRole('button',{name:'Save provider settings',exact:true}).click()
 await page.getByLabel('New OpenAI API key').fill(key)
 await page.getByRole('button',{name:'Save or replace key',exact:true}).click()
 await page.getByText(/Storage: os/).waitFor()
 const credential=readFileSync(join(data,'credentials','openai-api-key.bin'))
 assert.ok(credential.length>20);assert.ok(!credential.toString('utf8').includes(key))
 assert.ok(!(await page.locator('body').innerText()).includes(key))
 pass('OpenAI opt-in and Windows DPAPI persistence are explicit; the encrypted file and rendered status do not contain the plaintext key')
 await page.getByRole('button',{name:'Preview bounded example payload',exact:true}).click()
 await page.getByLabel('Assistance payload preview').filter({hasText:'use your OpenAI API account'}).waitFor()
 assert.equal(requests.length,0)
 pass('Payload preview shows bounded cloud disclosure without making a provider request')
 await page.getByRole('button',{name:'Test credentials',exact:true}).click();await page.getByLabel('Assistance status').filter({hasText:'credentials responded'}).waitFor()
 await page.getByRole('button',{name:/^Test assistance compatibility/}).click();await page.getByLabel('Assistance status').filter({hasText:'response received'}).waitFor()
 assert.deepEqual(requests.map(r=>r.url),['/v1/models','/v1/responses'])
 assert.equal(requests[1].body.store,false);assert.equal(requests[1].body.max_output_tokens,700);assert.equal(requests[1].body.text.format.strict,true);assert.equal(requests[1].body.tools,undefined)
 assert.ok(requests.every(r=>r.authorization==='Bearer '+key))
 pass('Distinct credential and compatibility controls use the mocked official endpoints with stateless strict bounded output and no tools')
 await page.screenshot({path:join(artifacts,'01-openai-settings-mocked.png'),animations:'disabled'})
 await page.getByRole('button',{name:'Remove key',exact:true}).click();await page.getByText(/Not configured/).waitFor()
 await assert.rejects(page.evaluate(()=>window.studio.assistanceRun({kind:'explain',request:{issue:{severity:'warning',message:'Synthetic'},context:{workflowTitle:'Synthetic'}}})),/Configure an OpenAI API key/)
 assert.equal(requests.length,2)
 pass('Removing the key immediately blocks cloud dispatch and does not fall back to Ollama')
 await page.getByLabel('Assistance provider',{exact:true}).selectOption('none');await page.getByRole('button',{name:'Save provider settings',exact:true}).click()
 const saved=await page.evaluate(async()=>window.studio.save({formatVersion:2,id:crypto.randomUUID(),title:'Manual offline fixture',description:'No AI required',example:false,revision:0,updatedAt:new Date().toISOString(),inputs:[],steps:[]}))
 assert.equal(saved.title,'Manual offline fixture');await close();await launch()
 assert.ok((await page.evaluate(()=>window.studio.list())).some(w=>w.title==='Manual offline fixture'))
 assert.equal((await page.evaluate(()=>window.studio.assistanceStatus())).provider,'none')
 pass('No-AI mode and ordinary manual persistence survive a full application restart')
 assert.deepEqual(errors,[])
 writeFileSync(join(artifacts,'openai-results.json'),JSON.stringify({checkedAt:new Date().toISOString(),executable:process.env.ROUTINE_STUDIO_TEST_EXECUTABLE||'development Electron',dataPath:data,mockBase:base,requestPaths:requests.map(r=>r.url),checks,rendererErrors:errors},null,2))
}finally{await close();server.closeAllConnections();server.close()}
