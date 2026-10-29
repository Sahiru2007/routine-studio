import {spawn} from 'node:child_process'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {resolve} from 'node:path'
import {assistanceCompletionExitCode,freshCompletedEvidence} from './assistance-evidence.mjs'

const root=resolve(import.meta.dirname,'..'),artifacts=resolve(root,'artifacts','milestone-5'),evidencePath=resolve(artifacts,'electron-results.json'),invocationId=crypto.randomUUID(),startedAt=new Date().toISOString()
mkdirSync(artifacts,{recursive:true})
writeFileSync(evidencePath,JSON.stringify({schemaVersion:2,runId:invocationId,startedAt,finishedAt:null,status:'runner-starting',phase:'spawning-suite'},null,2))
const child=spawn(process.execPath,[resolve(import.meta.dirname,'assistance-test.mjs')],{cwd:root,env:process.env,stdio:'inherit',windowsHide:true})
let timedOut=false
const timer=setTimeout(()=>{timedOut=true;child.kill()},120_000)
const code=await new Promise(resolveCode=>{child.once('exit',value=>resolveCode(value??1));child.once('error',()=>resolveCode(1))})
clearTimeout(timer)
let result
try{result=JSON.parse(readFileSync(evidencePath,'utf8'))}catch{result=null}
const fresh=freshCompletedEvidence(result,{invocationId,startedAt,childCode:code,timedOut})
if(!fresh){const detail=timedOut?'Assistance suite exceeded the 120 second limit.':result?.status==='failed'?result.error:'Assistance suite did not produce fresh completed evidence.';if(!result||result.status!=='failed')writeFileSync(evidencePath,JSON.stringify({schemaVersion:2,runId:result?.runId??invocationId,startedAt:result?.startedAt??startedAt,finishedAt:new Date().toISOString(),status:'failed',phase:result?.phase??'runner-verification',exitCode:code||1,error:detail},null,2));console.error(detail);process.exitCode=assistanceCompletionExitCode(result,{invocationId,startedAt,childCode:code,timedOut})}else console.log('Verified fresh completed assistance evidence:',evidencePath)
