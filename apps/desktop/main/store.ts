import { DatabaseSync } from 'node:sqlite'
import { WorkflowSchema,exampleWorkflow,type Workflow } from '../../../packages/workflow-schema'
import {RecordingDocument,type RecordingDocumentType} from '../../../packages/recorder-schema'
export class WorkflowStore {
 db:DatabaseSync
 constructor(path:string){
 this.db=new DatabaseSync(path);this.db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;')
 const version=Number((this.db.prepare('PRAGMA user_version').get() as {user_version:number}).user_version)
 if(version>3){this.db.close();throw Error('This database was created by a newer Routine Studio version.')}
 if(version===0) {
 this.db.exec(`BEGIN;
 CREATE TABLE workflows(id TEXT PRIMARY KEY, document TEXT NOT NULL);
 CREATE TABLE revisions(workflow_id TEXT NOT NULL REFERENCES workflows(id) ON DELETE CASCADE, revision INTEGER NOT NULL, document TEXT NOT NULL, PRIMARY KEY(workflow_id,revision));
 PRAGMA user_version=1; COMMIT;`)
 }
 if(version<2)this.db.exec(`BEGIN;
 CREATE TABLE metadata(key TEXT PRIMARY KEY, value TEXT NOT NULL);
 INSERT INTO metadata SELECT 'example-seeded','1' WHERE EXISTS(SELECT 1 FROM workflows);
 PRAGMA user_version=2; COMMIT;`)
 if(version<3)this.db.exec(`BEGIN; CREATE TABLE recordings(id TEXT PRIMARY KEY,workflow_id TEXT REFERENCES workflows(id) ON DELETE CASCADE,document TEXT NOT NULL); PRAGMA user_version=3; COMMIT;`)
 }
 seed(){
 if(this.db.prepare("SELECT value FROM metadata WHERE key='example-seeded'").get())return
 this.save(exampleWorkflow())
 this.db.prepare("INSERT INTO metadata VALUES('example-seeded','1')").run()
 }
 list():Workflow[]{return this.db.prepare('SELECT document FROM workflows').all().map(row=>WorkflowSchema.parse(JSON.parse(row.document as string))).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))}
 save(value:unknown,recording?:RecordingDocumentType):Workflow {
 const w=WorkflowSchema.parse(value)
 const raw=recording?RecordingDocument.parse(recording):undefined
 this.db.exec('BEGIN IMMEDIATE')
 try {
 const row=this.db.prepare('SELECT document FROM workflows WHERE id=?').get(w.id)
 const old=row?WorkflowSchema.parse(JSON.parse(row.document as string)):undefined
 if((old?.revision??0)!==w.revision)throw Error('This workflow changed since it was opened. Reopen it before saving.')
 const saved=WorkflowSchema.parse({...w,revision:w.revision+1,updatedAt:new Date().toISOString()})
 const json=JSON.stringify(saved)
 this.db.prepare('INSERT INTO workflows VALUES(?,?) ON CONFLICT(id) DO UPDATE SET document=excluded.document').run(w.id,json)
 this.db.prepare('INSERT INTO revisions VALUES(?,?,?)').run(w.id,saved.revision,json)
 if(raw)this.db.prepare('INSERT INTO recordings VALUES(?,?,?)').run(raw.id,w.id,JSON.stringify(raw))
 this.db.exec('COMMIT');return saved
 }catch(e){this.db.exec('ROLLBACK');throw e}
 }
 remove(id:string){this.db.prepare('DELETE FROM workflows WHERE id=?').run(id)}
 close(){this.db.close()}
}

