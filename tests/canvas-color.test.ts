import test from 'node:test'
import assert from 'node:assert/strict'
import { withAlpha } from '../src/lib/motion/color'
test('canvas accepts modern space-separated theme RGB without invalid mixed syntax', () => {
  assert.equal(withAlpha('rgb(15 118 110)', 0.1), 'rgba(15, 118, 110, 0.1)')
  assert.equal(withAlpha('rgb(15, 118, 110)', 0), 'rgba(15, 118, 110, 0)')
  assert.equal(withAlpha('#fff', 0.5), 'rgba(255, 255, 255, 0.5)')
})
