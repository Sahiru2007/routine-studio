import type {DatabaseSync} from 'node:sqlite'
import {RunRecord,RunSummary,terminal,interrupt,type Run,type Summary} from '../../../packages/execution-schema'
export class RunStore{
 constructor(private db:DatabaseSync){}
 put(run:Run){const value=RunRecord.parse(run),previous=this.db.prepare('SELECT document FROM runs WHERE id=?').get(value.id);if(previous&&JSON.stringify(JSON.parse(previous.document as string).plan)!==JSON.stringify(value.plan))throw Error('A prepared run snapshot is immutable. Prepare a new run instead.');this.db.prepare('INSERT INTO runs(id,document) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET document=excluded.document').run(value.id,JSON.stringify(value))}
 get(id:string):Run{const row=this.db.prepare('SELECT document FROM runs WHERE id=?').get(id);if(!row)throw Error('Run not found');return RunRecord.parse(JSON.parse(row.document as string))}
 list():Summary[]{return this.db.prepare("SELECT document FROM runs WHERE id NOT IN (SELECT json_extract(j.value,'$.runId') FROM batches,json_each(json_extract(batches.document,'$.rows')) j WHERE json_extract(j.value,'$.runId') IS NOT NULL) ORDER BY rowid DESC LIMIT 200").all().map(row=>{const r=RunRecord.parse(JSON.parse(row.document as string));return RunSummary.parse({id:r.id,title:r.plan.snapshot.title,revision:r.plan.snapshot.revision,state:r.state,createdAt:r.createdAt,updatedAt:r.updatedAt,uncertain:r.uncertain})})}
 recover(){for(const row of this.db.prepare('SELECT document FROM runs').all()){const run=RunRecord.parse(JSON.parse(row.document as string));if(!terminal(run.state)){interrupt(run,'Previous app/worker session ended. Unfinished dispatches are uncertain; no automatic resume or retry.');this.put(run)}}}
}
