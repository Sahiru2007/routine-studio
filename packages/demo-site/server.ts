import {createServer} from 'node:http'
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs'
import {resolve,join} from 'node:path'
import {fileURLToPath} from 'node:url'
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))
type Customer={name:string;email:string;company:string}
export async function startDemo(dataPath:string,port=4177){
 if(!/^E:[\\/]/i.test(resolve(dataPath)))throw Error('Demo data must be on E:')
 mkdirSync(dataPath,{recursive:true});const path=join(dataPath,'customers.json')
 let customers:Customer[]=[];try{customers=JSON.parse(readFileSync(path,'utf8'))}catch{}
 const reset=()=>{customers=[];writeFileSync(path,'[]')}
 const html=(title:string,body:string)=>`<!doctype html><html lang="en"><meta charset="utf-8"><title>${title} · Routine Studio Demo</title><style>body{font:16px system-ui;background:#11191e;color:#e7eee9;max-width:850px;margin:55px auto;padding:20px}a{color:#b8e1bc}nav{display:flex;gap:24px;margin:25px 0}form,section{padding:25px;border:1px solid #3c5147;border-radius:12px;margin:25px 0}label{display:block;margin:18px 0}input{display:block;box-sizing:border-box;width:100%;padding:12px;margin-top:8px;background:#202d31;border:1px solid #668372;color:white;border-radius:5px}button{background:#c0e3b7;color:#163322;padding:12px 20px;border:0;border-radius:5px;cursor:pointer}.notice{color:#dfc68e}li{margin:18px 0}small{color:#98b0a5}</style><header><small>ROUTINE STUDIO / DISPOSABLE DEMO</small><h1>${title}</h1><p class="notice">Synthetic data only. Actions in this demo change disposable local data.</p><nav><a id="directory-link" href="/">Customer directory</a><a id="add-link" href="/customers/new">Add customer</a><a id="guide-link" href="/guide">Recording guide</a></nav></header>${body}</html>`
 const server=createServer(async(req,res)=>{
 res.setHeader('Content-Security-Policy',"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'")
 res.setHeader('Content-Type','text/html; charset=utf-8')
 const url=new URL(req.url??'/','http://127.0.0.1')
 if(req.method==='POST'&&url.pathname==='/customers'){
 if(req.headers.origin!==`http://127.0.0.1:${(server.address() as {port:number}).port}`){res.writeHead(403);res.end('Origin rejected');return}
 let body='';for await(const chunk of req){body+=chunk.toString();if(body.length>16000){res.writeHead(413);res.end();return}}
 const values=new URLSearchParams(body)
 customers.push({name:(values.get('customer_name')??'').slice(0,160),email:(values.get('customer_email')??'').slice(0,160),company:(values.get('company')??'').slice(0,160)})
 writeFileSync(path,JSON.stringify(customers,null,2));res.writeHead(303,{Location:'/customers/saved'});res.end();return
 }
 if(req.method!=='GET'){res.writeHead(405);res.end();return}
 if(url.pathname==='/')res.end(html('Customer directory',`<p><a id="create-customer" href="/customers/new">Create a customer</a></p><ul>${customers.length?customers.map(c=>`<li><strong>${esc(c.name)}</strong> · ${esc(c.email)} · ${esc(c.company)}</li>`).join(''):'<li>No demo customers yet.</li>'}</ul>`))
 else if(url.pathname==='/customers/new')res.end(html('Add customer',`<form action="/customers" method="post"><fieldset><legend>Customer details</legend><label for="customer-name">Customer name</label><input id="customer-name" name="customer_name" autocomplete="off" required><label for="customer-email">Email</label><input id="customer-email" name="customer_email" type="email" autocomplete="off" required><label for="company">Company</label><input id="company" name="company" autocomplete="off"><button id="save-customer" type="submit">Save customer</button></fieldset></form><section><h2>Privacy test fields — never submitted</h2><p>Use synthetic values only. The recorder excludes these fields.</p><label for="demo-password">Password</label><input id="demo-password" type="password" autocomplete="new-password"><label for="payment-card">Payment card number</label><input id="payment-card" name="card_number" autocomplete="cc-number"><input type="hidden" name="hidden_token" value="SYNTHETIC-HIDDEN-DO-NOT-CAPTURE"></section>`))
 else if(url.pathname==='/customers/saved')res.end(html('Customer saved','<p role="status">The synthetic customer was added to disposable demo data.</p><a id="back-to-directory" href="/">Return to directory</a>'))
 else if(url.pathname==='/guide')res.end(html('Recording guide','<section><h2>Try a short recording</h2><p>Visit Add customer, fill synthetic details, save the customer, return to the directory, then stop in Routine Studio.</p></section>'))
 else{res.writeHead(404);res.end(html('Not found','<a href="/">Return to directory</a>'))}
 })
 await new Promise<void>((ok,fail)=>{server.once('error',fail);server.listen(port,'127.0.0.1',ok)})
 return {server,url:`http://127.0.0.1:${(server.address() as {port:number}).port}`,reset,close:()=>new Promise<void>(ok=>{server.closeAllConnections();server.close(()=>ok())})}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const dir=resolve('.runtime/demo');mkdirSync(dir,{recursive:true})
 if(process.argv.includes('--reset')){writeFileSync(join(dir,'customers.json'),'[]');console.log('Disposable demo data reset. Restart a running demo to load it.')}else{const demo=await startDemo(dir);console.log('Disposable demo:',demo.url);process.on('SIGINT',()=>{void demo.close().then(()=>process.exit(0))})}
}
