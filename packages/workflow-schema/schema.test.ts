import {describe,it,expect} from 'vitest'
import {WorkflowSchema,WorkflowDraftSchema,blankWorkflow,exampleWorkflow,moveStep,removeInput} from './index'
describe('versioned workflow documents and edits',()=>{
 it('stores incomplete empty drafts and validates the synthetic example separately',()=>{expect(WorkflowDraftSchema.parse(blankWorkflow()).formatVersion).toBe(2);expect(WorkflowSchema.safeParse(blankWorkflow()).success).toBe(false);expect(WorkflowSchema.parse(exampleWorkflow()).example).toBe(true)})
 it('rejects unknown versions, unsafe navigation as configuration-ready, and duplicate IDs',()=>{const w=exampleWorkflow();expect(WorkflowSchema.safeParse({...w,formatVersion:99}).success).toBe(false);expect(WorkflowSchema.safeParse({...w,steps:[{...w.steps[0],type:'navigate',url:'javascript:alert(1)'}]}).success).toBe(false);expect(WorkflowDraftSchema.safeParse({...w,steps:[w.steps[0],w.steps[0]]}).success).toBe(false)})
 it('reports missing input references clearly',()=>{const w=exampleWorkflow();const result=WorkflowSchema.safeParse({...w,inputs:[]});expect(result.success).toBe(false);if(!result.success)expect(result.error.issues[0].message).toContain('missing input')})
 it('preserves IDs and references when reordering and removing steps',()=>{const w=exampleWorkflow();const moved=moveStep(w,w.steps[1].id,1);expect(moved.steps[2].id).toBe(w.steps[1].id);expect(WorkflowSchema.safeParse(moved).success).toBe(true);expect(WorkflowSchema.safeParse({...moved,steps:moved.steps.slice(1)}).success).toBe(true);expect(moveStep(w,w.steps[0].id,-1)).toBe(w)})
 it('prevents removing a referenced input and allows unused removal',()=>{const w=exampleWorkflow();expect(()=>removeInput(w,w.inputs[0].id)).toThrow('used by a fill step');expect(removeInput({...w,steps:[]},w.inputs[0].id).inputs).toEqual([])})
})

