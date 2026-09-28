import {
  createStarterSave,
  readPetSave,
  serializePetSave,
  PET_SAVE_KEY,
  type PetWorldSaveV1,
} from './save'

export type Persistence = 'loading' | 'saved' | 'memory' | 'newer'
export interface PetSnapshot {
  save: PetWorldSaveV1
  status: Persistence
}
type StorageAccess = () => Pick<Storage, 'getItem' | 'setItem'>

/** Never replace an unreadable or unrecognized save with a starter world. */
export function receivePetWorld(raw: string | null, fallback: PetWorldSaveV1): PetSnapshot {
  if (!raw) return { save: fallback, status: 'saved' }
  try {
    if (JSON.parse(raw)?.version > 1) return { save: fallback, status: 'newer' }
  } catch {
    /* Invalid data remains untouched on disk. */
  }
  const saved = readPetSave(raw)
  return saved ? { save: saved, status: 'saved' } : { save: fallback, status: 'memory' }
}

export function loadPetWorld(access: StorageAccess): PetSnapshot {
  const fallback = createStarterSave()
  try {
    const storage = access()
    const raw = storage.getItem(PET_SAVE_KEY)
    const next = receivePetWorld(raw, fallback)
    if (!raw) {
      try {
        storage.setItem(PET_SAVE_KEY, serializePetSave(next.save))
      } catch {
        return { ...next, status: 'memory' }
      }
    }
    return next
  } catch {
    return { save: fallback, status: 'memory' }
  }
}

export function updatePetWorld(
  access: StorageAccess,
  state: PetSnapshot,
  update: (s: PetWorldSaveV1) => PetWorldSaveV1
): PetSnapshot {
  if (state.status === 'loading' || state.status === 'newer') return state
  // Memory mode is sticky until reload or a valid external storage event.
  // Retrying a blind write here could destroy a save we never managed to read.
  if (state.status === 'memory') return { save: update(state.save), status: 'memory' }
  let next: PetSnapshot
  try {
    next = receivePetWorld(access().getItem(PET_SAVE_KEY), state.save)
  } catch {
    next = { ...state, status: 'memory' }
  }
  if (next.status === 'newer') return next
  next = { ...next, save: update(next.save) }
  if (next.status === 'saved') {
    try {
      access().setItem(PET_SAVE_KEY, serializePetSave(next.save))
    } catch {
      next.status = 'memory'
    }
  }
  return next
}
