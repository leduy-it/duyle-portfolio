import test from 'node:test'
import assert from 'node:assert/strict'
import { createStarterSave, serializePetSave } from '../src/lib/pets/save'
import { loadPetWorld, updatePetWorld, receivePetWorld } from '../src/lib/pets/persistence'

test('a transient read failure never overwrites an unread existing world', () => {
  const existing = { ...createStarterSave(), coins: 12345 }
  let disk = serializePetSave(existing),
    fail = true,
    writes = 0
  const storage = () => ({
    getItem() {
      if (fail) throw new Error('SecurityError')
      return disk
    },
    setItem(_key: string, value: string) {
      writes++
      disk = value
    },
  })
  const loaded = loadPetWorld(storage)
  assert.equal(loaded.status, 'memory')
  fail = false
  const played = updatePetWorld(storage, loaded, (s) => ({ ...s, coins: s.coins + 2 }))
  assert.equal(played.status, 'memory')
  assert.equal(writes, 0)
  assert.equal(JSON.parse(disk).coins, 12345)
  assert.equal(loadPetWorld(storage).save.coins, 12345)
})

test('invalid external saves retain current progress and cannot be overwritten', () => {
  const saved = { ...createStarterSave(), coins: 999 }
  for (const raw of ['{broken', '{"version":1,"pets":[]}']) {
    const received = receivePetWorld(raw, saved)
    assert.equal(received.status, 'memory')
    assert.equal(received.save.coins, 999)
  }
  assert.equal(receivePetWorld('{"version":2}', saved).status, 'newer')
})

test('updates use the latest readable save and preserve it if writes fail', () => {
  const existing = { ...createStarterSave(), coins: 1000 }
  const state = updatePetWorld(
    () => ({
      getItem: () => serializePetSave(existing),
      setItem: () => {
        throw new Error('QuotaExceeded')
      },
    }),
    { save: createStarterSave(), status: 'saved' },
    (s) => ({ ...s, coins: s.coins + 2 })
  )
  assert.equal(state.save.coins, 1002)
  assert.equal(state.status, 'memory')
})
