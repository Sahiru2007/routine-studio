import {_electron as electron} from 'playwright'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {mkdirSync,readFileSync,writeFileSync,existsSync} from 'node:fs'
import {resolve} from 'node:path'
import {execFileSync} from 'node:child_process'

const expectedHash='39971908DCD261CBB801E9046433CC6777B7F1E0932E8D064B0DE4ED40200047'
const root=resolve(import.meta.dirname,'..'),fixturePath=resolve(root,'fixtures','assistance','milestone-8a-ollama-evaluation.json'),resultPath=resolve(root,'artifacts','milestone-8a','ollama-evaluation-results.json'),dataPath=resolve(root,'.runtime','ollama-prepare-evaluation-'+Date.now())
const fixtureBytes=readFileSync(fixturePath),fixtureHash=createHash('sha256').update(fixtureBytes).digest('hex').toUpperCase()
assert.equal(fixtureHash,expectedHash,'Frozen evaluation fixture hash mismatch; no requests sent.')
const fixture=JSON.parse(fixtureBytes.toString('utf8'))
assert.equal(fixture.status,'prepared-not-executed');assert.equal(fixture.model,'qwen3:8b-q4_K_M');assert.equal(fixture.requestCount,6);assert.equal(fixture.rules.automaticReruns,false)
if(existsSync(resultPath))throw Error('Evaluation result already exists. Refusing to restart or overwrite a prior/partial evaluation.')
mkdirSync(resolve(root,'artifacts','milestone-8a'),{recursive:true});mkdirSync(dataPath,{recursive:true});mkdirSync(resolve(root,'.runtime','temp'),{recursive:true})
const commit=execFileSync('git',['-c','safe.directory=E:/projects/routine-studio','-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),startedAt=new Date().toISOString()
const version=await (await fetch('http://127.0.0.1:11434/api/version')).json(),tags=await (await fetch('http://127.0.0.1:11434/api/tags')).json(),show=await (await fetch('http://127.0.0.1:11434/api/show',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({model:fixture.model})})).json(),installed=tags.models?.find(model=>model.name===fixture.model||model.model===fixture.model)
assert.ok(installed,'Required frozen model is not installed; no requests sent.')
const results={schemaVersion:1,status:'running',startedAt,finishedAt:null,fixturePath:'fixtures/assistance/milestone-8a-ollama-evaluation.json',fixtureSha256:fixtureHash,applicationCommit:commit,provider:'ollama',endpoint:'http://127.0.0.1:11434',ollamaVersion:version.version,model:fixture.model,modelDigest:installed.digest??null,modelMetadataConfirmed:!!show.details,protocol:{requestCount:6,temperature:0,automaticRetries:false,literalValuesIncluded:false,order:fixture.workflows.flatMap(workflow=>workflow.goals.map(goal=>goal.requestId))},requests:[],interruption:null}
const persist=()=>writeFileSync(resultPath,JSON.stringify(results,null,2))
persist()
const env={...process.env,ROUTINE_STUDIO_DATA:dataPath,ROUTINE_STUDIO_OLLAMA_ENDPOINT:'http://127.0.0.1:11434',ROUTINE_STUDIO_BROWSER_PATH:'E:/AI/Caches/ms-playwright',PLAYWRIGHT_BROWSERS_PATH:'E:/AI/Caches/ms-playwright',TEMP:resolve(root,'.runtime/temp'),TMP:resolve(root,'.runtime/temp')};delete env.ELECTRON_RUN_AS_NODE;delete env.NODE_COMPILE_CACHE
let app
try{
 app=await electron.launch({executablePath:resolve(root,'node_modules/electron/dist/electron.exe'),args:[root],env})
 const page=await app.firstWindow();page.setDefaultTimeout(30_000);await page.getByRole('heading',{name:'Workflow library',exact:true}).waitFor()
 const status=await page.evaluate(()=>window.studio.assistanceStatus());assert.equal(status.provider,'ollama');assert.equal(status.model,'qwen3:8b-q4_K_M');assert.equal(status.endpoint,'http://127.0.0.1:11434')
 for(const workflow of fixture.workflows){for(const goal of workflow.goals){
  const request={goal:goal.goal,title:workflow.title,existingInputNames:workflow.existingInputNames,steps:workflow.steps},record={ordinal:results.requests.length+1,requestId:goal.requestId,caseId:workflow.caseId,goal:goal.goal,startedAt:new Date().toISOString(),finishedAt:null,terminalState:'running',request,response:null,error:null,accounting:null,acceptance:{expectedTitleConcepts:goal.expectedTitleConcepts,requiredConversions:goal.requiredConversions}}
  results.requests.push(record);persist();console.log(`REQUEST ${record.ordinal}/6 ${record.requestId} started`)
  try{const response=await page.evaluate(command=>window.studio.assistanceRun({kind:'prepare',request:command}),request);assert.equal(response.kind,'prepare');record.response=response.value;record.accounting=response.accounting??null;record.terminalState='completed'}catch(error){record.error=error instanceof Error?error.message:String(error);record.terminalState='failed'}
  record.finishedAt=new Date().toISOString();persist();console.log(`REQUEST ${record.ordinal}/6 ${record.requestId} ${record.terminalState}`)
 }}
 results.status='completed';results.finishedAt=new Date().toISOString();persist()
}catch(error){results.status='interrupted';results.finishedAt=new Date().toISOString();results.interruption=error instanceof Error?error.stack||error.message:String(error);persist();process.exitCode=1;console.error(results.interruption)}finally{if(app)await app.close().catch(()=>{})}
console.log('Evaluation evidence:',resultPath)
