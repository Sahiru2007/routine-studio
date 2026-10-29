import {describe,expect,it} from 'vitest'
import {assistanceCompletionExitCode,freshCompletedEvidence} from './assistance-evidence.mjs'

const context={invocationId:'runner-id',startedAt:'2026-10-29T10:00:00.000Z',childCode:0,timedOut:false}
const completed={runId:'suite-id',startedAt:'2026-10-29T10:00:01.000Z',finishedAt:'2026-10-29T10:00:10.000Z',status:'completed',checks:['a','b','c','d'],rendererErrors:[]}
describe('assistance evidence completion contract',()=>{
 it('accepts only fresh complete evidence with all assertions and no renderer errors',()=>expect(freshCompletedEvidence(completed,context)).toBe(true))
 it.each([
  ['stale invocation',{...completed,runId:'runner-id'},context],
  ['older evidence',{...completed,startedAt:'2026-10-29T09:59:59.000Z'},context],
  ['running evidence',{...completed,status:'running',finishedAt:null},context],
  ['failed evidence',{...completed,status:'failed'},context],
  ['missing assertions',{...completed,checks:['a']},context],
  ['renderer errors',{...completed,rendererErrors:['boom']},context],
  ['nonzero child',completed,{...context,childCode:1}],
  ['timeout',completed,{...context,timedOut:true}]
 ])('rejects %s with a nonzero completion status',(_name,result,run)=>{expect(freshCompletedEvidence(result,run)).toBe(false);expect(assistanceCompletionExitCode(result,run)).toBe(1)})
})
