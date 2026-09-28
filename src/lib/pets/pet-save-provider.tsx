'use client'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  createStarterSave,
  parsePetSave,
  serializePetSave,
  PET_SAVE_KEY,
  type PetWorldSaveV1,
} from './save'
type Persistence = 'loading' | 'saved' | 'memory' | 'newer'
interface WorldContext {
  save: PetWorldSaveV1
  storage: Persistence
  update: (fn: (s: PetWorldSaveV1) => PetWorldSaveV1) => PetWorldSaveV1
  reset: () => void
}
const Context = createContext<WorldContext | null>(null)
const future = (raw: string | null) => {
  try {
    return raw ? JSON.parse(raw).version > 1 : false
  } catch {
    return false
  }
}
export function PetSaveProvider({ children }: { children: ReactNode }) {
  const [save, setSave] = useState(() => createStarterSave(0))
  const [storage, setStorage] = useState<Persistence>('loading')
  const current = useRef(save),
    status = useRef<Persistence>('loading')
  const persistence = useCallback((value: Persistence) => {
    status.current = value
    setStorage(value)
  }, [])
  useEffect(() => {
    // Hydrate after the first paint; never read browser storage during SSR.
    const frame = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(PET_SAVE_KEY)
        const next = parsePetSave(raw)
        current.current = next
        setSave(next)
        if (future(raw)) {
          persistence('newer')
          return
        }
        if (raw) {
          try {
            JSON.parse(raw)
          } catch {
            localStorage.setItem(`${PET_SAVE_KEY}:recovery`, raw)
          }
        }
        if (!raw) localStorage.setItem(PET_SAVE_KEY, serializePetSave(next))
        persistence('saved')
      } catch {
        const next = createStarterSave()
        current.current = next
        setSave(next)
        persistence('memory')
      }
    })
    function onStorage(e: StorageEvent) {
      if (e.key !== PET_SAVE_KEY) return
      if (future(e.newValue)) {
        persistence('newer')
        return
      }
      const next = parsePetSave(e.newValue)
      current.current = next
      setSave(next)
      persistence('saved')
    }
    window.addEventListener('storage', onStorage)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('storage', onStorage)
    }
  }, [persistence])
  const update = useCallback(
    (fn: (s: PetWorldSaveV1) => PetWorldSaveV1) => {
      if (status.current === 'loading' || status.current === 'newer') return current.current
      let base = current.current
      if (status.current === 'saved')
        try {
          const raw = localStorage.getItem(PET_SAVE_KEY)
          if (future(raw)) {
            persistence('newer')
            return base
          }
          if (raw) base = parsePetSave(raw)
        } catch {
          persistence('memory')
        }
      const next = fn(base)
      current.current = next
      setSave(next)
      try {
        localStorage.setItem(PET_SAVE_KEY, serializePetSave(next))
        persistence('saved')
      } catch {
        persistence('memory')
      }
      return next
    },
    [persistence]
  )
  const reset = useCallback(() => {
    update(() => createStarterSave())
  }, [update])
  return <Context.Provider value={{ save, storage, update, reset }}>{children}</Context.Provider>
}
export function usePetSave() {
  const value = useContext(Context)
  if (!value) throw Error('PetSaveProvider required')
  return value
}
