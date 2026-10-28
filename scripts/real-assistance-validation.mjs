import {mkdirSync,writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {Assistance} from '../apps/desktop/main/assistance.ts'
const root=resolve(import.meta.dirname,'..'),artifacts=resolve(root,'artifacts/milestone-5');mkdirSync(artifacts,{recursive:true})
const client=new Assistance(),results=[]
const status=await client.check(),started=new Date().toISOString()
async function sample(name,command){const start=performance.now();try{const value=await client.run(command);results.push({name,outcome:'structured response accepted',durationMs:Math.round(performance.now()-start),value})}catch(error){results.push({name,outcome:'failed honestly',durationMs:Math.round(performance.now()-start),error:error.message})}}
if(status.state==='ready'){
 await sample('mapping headers only',{kind:'mapping',request:{inputs:[{id:'input-name',name:'customer_name',description:'Synthetic customer display name',required:true},{id:'input-email',name:'customer_email',description:'Synthetic customer email',required:true},{id:'input-company',name:'company',description:'Synthetic company name',required:false}],columns:[{id:'column-name',name:'Customer Name'},{id:'column-email',name:'Email Address'},{id:'column-company',name:'Organization'}],includeSamples:false}})
 await sample('selected configuration issue',{kind:'explain',request:{issue:{severity:'error',message:'Fill step references a missing input.',stepId:'step-fill'},context:{workflowTitle:'Synthetic customer workflow',step:{id:'step-fill',label:'Fill customer email',type:'fill'}}}})
 await sample('rank supplied target descriptors',{kind:'target',request:{broken:{strategy:'css',value:'#missing'},requiredUrl:'http://127.0.0.1:4177/customers/new',candidates:[{id:'candidate-name',label:'Customer name',tag:'input',role:'textbox',locator:{strategy:'attribute',attribute:'id',value:'customer-name'},context:'Add synthetic customer'},{id:'candidate-email',label:'Email',tag:'input',role:'textbox',locator:{strategy:'attribute',attribute:'id',value:'customer-email'},context:'Add synthetic customer'}]}})
}
writeFileSync(resolve(artifacts,'real-local-results.json'),JSON.stringify({started,finished:new Date().toISOString(),endpoint:client.endpoint,model:status.model,status,inferenceRequests:results.length,limits:{maximumRequests:8,actualRequests:results.length,requestTimeoutMs:20000,contextTokens:4096,maxOutputTokens:700},results,note:'Small synthetic sample only; it does not establish reliable workflow understanding.'},null,2))
console.log(JSON.stringify({status:status.state,requests:results.length,results:results.map(r=>({name:r.name,outcome:r.outcome,durationMs:r.durationMs,error:r.error}))},null,2))
