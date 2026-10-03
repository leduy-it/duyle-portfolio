import test from 'node:test'
import assert from 'node:assert/strict'
import {entrancePose,nextMotionSeed,motionPattern} from '../src/components/motion/entrance-patterns'
test('route and cover choices cover three patterns without an immediate repeat',()=>{
  let seed=0;const seen=new Set<string>()
  for(let i=0;i<30;i++){const next=nextMotionSeed(seed,(i*.371)%1);assert.notEqual(motionPattern(next),motionPattern(seed));seen.add(motionPattern(next));seed=next}
  assert.equal(seen.size,3)
})
test('card directions are diverse, deterministic and bounded with no blur',()=>{
  const poses=Array.from({length:12},(_,index)=>entrancePose(300,index))
  assert.ok(new Set(poses.map(pose=>pose.x.toFixed(2))).size>5)
  for(const pose of poses){assert.ok(Math.abs(pose.x)<=36);assert.ok(Math.abs(pose.y)<=25);assert.ok(Math.abs(pose.rotate)<=1);assert.ok(pose.scale>=.965);assert.equal('filter' in pose,false)}
  assert.deepEqual(entrancePose(300,3),entrancePose(300,3))
  assert.equal(entrancePose(1,0).x,-entrancePose(1,1).x)
})
