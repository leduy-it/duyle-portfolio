import test from 'node:test'
import assert from 'node:assert/strict'
import { applyDecorChanges, decorChanges } from '../src/lib/pets/decor'
import { STARTER_DECOR, createStarterSave, readPetSave } from '../src/lib/pets/save'
test('decor edits and undo preserve unrelated and conflicting tab changes', () => {
 const before=STARTER_DECOR
 const moved=before.map((p,i)=>i===0?{...p,x:35}:p)
 const change=decorChanges(before,moved)
 const other=before.map((p,i)=>i===1?{...p,x:60}:p)
 const merged=applyDecorChanges(other,change)
 assert.equal(merged[0].x,35);assert.equal(merged[1].x,60)
 const undo=change.map(c=>({before:c.after,after:c.before}))
 assert.equal(applyDecorChanges(merged,undo)[1].x,60)
 const conflicting=merged.map((p,i)=>i===0?{...p,x:50}:p)
 assert.equal(applyDecorChanges(conflicting,undo)[0].x,50)
})
test('v1 migration reserves capacity for already purchased eggs',()=>{
 const starter=createStarterSave(1000000)
 const pets=Array.from({length:35},(_,i)=>({...starter.pets[0],id:`old-${i}`}))
 const migrated=readPetSave(JSON.stringify({...starter,version:1,pets}),1000000)!
 assert.equal(migrated.pets.length,35);assert.equal(migrated.eggs.length,1)
})
