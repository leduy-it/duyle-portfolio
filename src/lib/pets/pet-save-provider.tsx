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
import { createStarterSave, PET_SAVE_KEY, type PetWorldSaveV1 } from './save'
import { loadPetWorld, receivePetWorld, updatePetWorld, type Persistence } from './persistence'
interface WorldContext {
  save: PetWorldSaveV1
  storage: Persistence
  update: (fn: (s: PetWorldSaveV1) => PetWorldSaveV1) => PetWorldSaveV1
  reset: () => void
}
const Context = createContext<WorldContext | null>(null)
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
      const next = loadPetWorld(() => localStorage)
      current.current = next.save
      setSave(next.save)
      persistence(next.status)
    })
    function onStorage(e: StorageEvent) {
      if (e.key !== PET_SAVE_KEY) return
      const next = receivePetWorld(e.newValue, current.current)
      current.current = next.save
      setSave(next.save)
      persistence(next.status)
    }
    window.addEventListener('storage', onStorage)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('storage', onStorage)
    }
  }, [persistence])
  const update = useCallback(
    (fn: (s: PetWorldSaveV1) => PetWorldSaveV1) => {
      const next = updatePetWorld(
        () => localStorage,
        { save: current.current, status: status.current },
        fn
      )
      current.current = next.save
      setSave(next.save)
      persistence(next.status)
      return next.save
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
