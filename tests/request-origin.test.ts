import test from 'node:test'
import assert from 'node:assert/strict'
import { sameOrigin } from '../src/lib/server/redis'
test('same-origin validation accepts forwarded host but rejects foreign origins', () => {
  const req = (origin: string) =>
    new Request('http://0.0.0.0:3008/api/contact', { headers: { origin, host: 'localhost:3008' } })
  assert.equal(sameOrigin(req('http://localhost:3008')), true)
  assert.equal(sameOrigin(req('https://attacker.example')), false)
  assert.equal(sameOrigin(req('null')), false)
})
