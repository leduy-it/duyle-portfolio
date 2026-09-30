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
  assert.equal(receivePetWorld('{"version":3}', saved).status, 'newer')
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

test('v1 migration writes an exact backup before saving v2', () => {
  const starter = createStarterSave()
  const old = JSON.stringify({ ...starter, version: 1, pets: starter.pets.filter(p => p.species !== 'inko') })
  const data = new Map([['duy:pet-world:v1', old]])
  const writes: string[] = []
  const loaded = loadPetWorld(() => ({ getItem: key => data.get(key) || null, setItem: (key, value) => { writes.push(key); data.set(key, value) } }))
  assert.equal(loaded.save.version, 2)
  assert.deepEqual(writes, ['duy:pet-world:backup:v1', 'duy:pet-world:v1'])
  assert.equal(data.get('duy:pet-world:backup:v1'), old)
  assert.equal(JSON.parse(data.get('duy:pet-world:v1')!).pets.filter((p: { species: string }) => p.species === 'inko').length, 1)
})

test('failed migration backup does not overwrite the original world', () => {
  const old = JSON.stringify({ ...createStarterSave(), version: 1 })
  let written = ''
  const loaded = loadPetWorld(() => ({ getItem: key => key === 'duy:pet-world:v1' ? old : null, setItem: key => { written = key; throw Error('Full') } }))
  assert.equal(loaded.status, 'memory')
  assert.equal(written, 'duy:pet-world:backup:v1')
})
