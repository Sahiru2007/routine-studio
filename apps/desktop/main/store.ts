import { DatabaseSync } from 'node:sqlite'
import { WorkflowSchema,exampleWorkflow,type Workflow } from '../../../packages/workflow-schema'
export class WorkflowStore {
 db:DatabaseSync
 constructor(path:string){
 this.db=new DatabaseSync(path);this.db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;')
 const version=Number((this.db.prepare('PRAGMA user_version').get() as {user_version:number}).user_version)
 if(version>1)throw Error('This database was created by a newer Routine Studio version.')
 if(version===0) {
 this.db.exec(`BEGIN;
 CREATE TABLE workflows(id TEXT PRIMARY KEY, document TEXT NOT NULL);
 CREATE TABLE revisions(workflow_id TEXT NOT NULL REFERENCES workflows(id) ON DELETE CASCADE, revision INTEGER NOT NULL, document TEXT NOT NULL, PRIMARY KEY(workflow_id,revision));
 PRAGMA user_version=1; COMMIT;`)
 }
 }
 seed(){if(!this.db.prepare('SELECT id FROM workflows LIMIT 1').get())this.save(exampleWorkflow())}
 list():Workflow[]{return this.db.prepare('SELECT document FROM workflows').all().map(row=>WorkflowSchema.parse(JSON.parse(row.document as string))).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))}
 save(value:unknown):Workflow {
 const w=WorkflowSchema.parse(value)
 this.db.exec('BEGIN IMMEDIATE')
 try {
 const row=this.db.prepare('SELECT document FROM workflows WHERE id=?').get(w.id)
 const old=row?WorkflowSchema.parse(JSON.parse(row.document as string)):undefined
 if((old?.revision??0)!==w.revision)throw Error('This workflow changed since it was opened. Reopen it before saving.')
 const saved=WorkflowSchema.parse({...w,revision:w.revision+1,updatedAt:new Date().toISOString()})
 const json=JSON.stringify(saved)
 this.db.prepare('INSERT INTO workflows VALUES(?,?) ON CONFLICT(id) DO UPDATE SET document=excluded.document').run(w.id,json)
 this.db.prepare('INSERT INTO revisions VALUES(?,?,?)').run(w.id,saved.revision,json)
 this.db.exec('COMMIT');return saved
 }catch(e){this.db.exec('ROLLBACK');throw e}
 }
 remove(id:string){this.db.prepare('DELETE FROM workflows WHERE id=?').run(id)}
 close(){this.db.close()}
}

