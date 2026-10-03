import test from 'node:test'
import assert from 'node:assert/strict'
import {coverPixelRatio,fitCameraDistance} from '../src/components/showcase/scene-resources'
test('phone camera fits the entire model in both dimensions',()=>{
  for(const aspect of [.65,.95,1.5,2]) {
    const radius=1.9, distance=fitCameraDistance(radius,aspect)
    const vertical=42*Math.PI/360,horizontal=Math.atan(Math.tan(vertical)*aspect)
    assert.ok(Math.asin(radius/distance)<Math.min(vertical,horizontal))
  }
})
test('mobile canvas uses full DPR three while larger canvases respect the GPU pixel budget',()=>{
  assert.equal(coverPixelRatio(3,350,350),3)
  const ratio=coverPixelRatio(3,1440,900)
  assert.ok(1440*900*ratio*ratio<=2_500_001)
  assert.equal(coverPixelRatio(1,350,350),1)
})
