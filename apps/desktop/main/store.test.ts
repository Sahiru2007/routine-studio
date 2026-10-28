import {describe,it,expect} from 'vitest'
import {mkdtempSync,rmSync} from 'node:fs'
import {join,resolve} from 'node:path'
import {WorkflowStore} from './store'
import {blankWorkflow} from '../../../packages/workflow-schema'
describe('SQLite persistence and migrations',()=>{
 it('migrates once, saves revisions, survives restart, and deletes atomically',()=>{
 const dir=mkdtempSync(resolve('.runtime/test-db-'));const path=join(dir,'test.sqlite')
 let store=new WorkflowStore(path)
 try{
 expect(store.db.prepare('PRAGMA user_version').get()?.user_version).toBe(1)
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
 it('rejects future databases and invalid persisted documents',()=>{
 const store=new WorkflowStore(':memory:')
 store.db.prepare('INSERT INTO workflows VALUES(?,?)').run('bad','{}')
 expect(()=>store.list()).toThrow()
 store.close()
 })
})

