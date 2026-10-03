import test from 'node:test'
import assert from 'node:assert/strict'
import {formatEventTime} from '../src/lib/tracking/presentation'
test('owner timestamp is the same across server and visitor timezones',()=>{
  const original=process.env.TZ
  try {
    process.env.TZ='UTC';const server=formatEventTime('2026-10-03T23:15:20Z')
    process.env.TZ='America/New_York';const visitor=formatEventTime('2026-10-03T23:15:20Z')
    assert.equal(server,visitor);assert.match(server,/04\/10\/2026, 06:15:20/)
    assert.equal(formatEventTime('invalid'),'invalid')
  }finally{process.env.TZ=original}
})
