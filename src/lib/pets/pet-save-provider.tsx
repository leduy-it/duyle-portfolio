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
import { createStarterSave, PET_SAVE_KEY, type PetWorldSave } from './save'
import { loadPetWorld, receivePetWorld, updatePetWorld, type Persistence } from './persistence'
interface WorldContext {
  save: PetWorldSave
  storage: Persistence
  update: (fn: (s: PetWorldSave) => PetWorldSave) => Promise<PetWorldSave>
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
    let mounted = true
    const frame = requestAnimationFrame(() => {
      const hydrate = () => {
        if (!mounted) return
        const next = loadPetWorld(() => localStorage)
        current.current = next.save
        setSave(next.save)
        persistence(next.status)
      }
      if (navigator.locks) void navigator.locks.request(PET_SAVE_KEY, hydrate)
      else hydrate()
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
      mounted = false
      cancelAnimationFrame(frame)
      window.removeEventListener('storage', onStorage)
    }
  }, [persistence])
  const update = useCallback(
    async (fn: (s: PetWorldSave) => PetWorldSave) => {
      const commit = () => {
      const next = updatePetWorld(
        () => localStorage,
        { save: current.current, status: status.current },
        fn
      )
      current.current = next.save
      setSave(next.save)
      persistence(next.status)
      return next.save
      }
      // A single read-modify-write owner across tabs on supported browsers.
      return navigator.locks ? navigator.locks.request(PET_SAVE_KEY, commit) : commit()
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
