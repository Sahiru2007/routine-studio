import {describe,it,expect} from 'vitest'
import {mkdtempSync,rmSync} from 'node:fs'
import {join,resolve} from 'node:path'
import {WorkflowStore} from './store'
import {DatabaseSync} from 'node:sqlite'
import {blankWorkflow} from '../../../packages/workflow-schema'
describe('SQLite persistence and migrations',()=>{
 it('upgrades a v1 database without changing saved documents',()=>{
 const dir=mkdtempSync(resolve('.runtime/migrate-db-')),path=join(dir,'test.sqlite')
 const db=new DatabaseSync(path),w={...blankWorkflow(),revision:1}
 db.exec('CREATE TABLE workflows(id TEXT PRIMARY KEY,document TEXT NOT NULL); CREATE TABLE revisions(workflow_id TEXT NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,revision INTEGER NOT NULL,document TEXT NOT NULL,PRIMARY KEY(workflow_id,revision)); PRAGMA user_version=1;')
 db.prepare('INSERT INTO workflows VALUES(?,?)').run(w.id,JSON.stringify(w));db.close()
 const store=new WorkflowStore(path)
 try{store.seed();expect(store.list()).toEqual([w]);expect(store.db.prepare('PRAGMA user_version').get()?.user_version).toBe(2)}finally{store.close();rmSync(dir,{recursive:true,force:true})}
 })
 it('rejects a database from a newer application',()=>{
 const dir=mkdtempSync(resolve('.runtime/future-db-')),path=join(dir,'test.sqlite')
 const db=new DatabaseSync(path);db.exec('PRAGMA user_version=99');db.close()
 try{expect(()=>new WorkflowStore(path)).toThrow('newer Routine Studio')}finally{rmSync(dir,{recursive:true,force:true})}
 })
 it('migrates once, saves revisions, survives restart, and deletes atomically',()=>{
 const dir=mkdtempSync(resolve('.runtime/test-db-'));const path=join(dir,'test.sqlite')
 let store=new WorkflowStore(path)
 try{
 expect(store.db.prepare('PRAGMA user_version').get()?.user_version).toBe(2)
 const saved=store.save(blankWorkflow());expect(saved.revision).toBe(1)
 expect(()=>store.save({...saved,title:''})).toThrow()
 const next=store.save({...saved,title:'Reopened draft'});expect(next.revision).toBe(2)
 expect(()=>store.save(saved)).toThrow('changed')
 expect(store.db.prepare('SELECT count(*) AS n FROM revisions').get()?.n).toBe(2)
 store.close();store=new WorkflowStore(path)
 expect(store.list()[0]).toEqual(next)
 store.remove(saved.id);expect(store.list()).toEqual([])
 expect(store.db.prepare('SELECT count(*) AS n FROM revisions').get()?.n).toBe(0)
 }finally{store.close();rmSync(dir,{recursive:true,force:true})}
 })
 it('rejects invalid persisted documents',()=>{
 const store=new WorkflowStore(':memory:')
 store.db.prepare('INSERT INTO workflows VALUES(?,?)').run('bad','{}')
 expect(()=>store.list()).toThrow()
 store.close()
 })
 it('does not recreate a deleted example after restart',()=>{
 const dir=mkdtempSync(resolve('.runtime/seed-db-')),path=join(dir,'test.sqlite')
 let store=new WorkflowStore(path)
 try{store.seed();const example=store.list()[0];store.remove(example.id);store.close();store=new WorkflowStore(path);store.seed();expect(store.list()).toEqual([])}
 finally{store.close();rmSync(dir,{recursive:true,force:true})}
 })
})

