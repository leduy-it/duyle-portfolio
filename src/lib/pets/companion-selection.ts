'use client'
import { useSyncExternalStore } from 'react'
import catalog from '@/data/pets/atlas-catalog.json'
const KEY = 'duy:companion:selection:v1',
  EVENT = 'duy:companion-selection'
let memory = ''
function snapshot() {
  try {
    return localStorage.getItem(KEY) || memory
  } catch {
    return memory
  }
}
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener(EVENT, callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(EVENT, callback)
  }
}
export function useCompanionSelection() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => '')
  let value: { id?: string; stage?: number } = {}
  try {
    value = JSON.parse(raw || '{}')
  } catch {}
  const pet = catalog.find((p) => p.id === value.id) || catalog.find((p) => p.id === 'bunny')!
  const stage = Number.isInteger(value.stage)
    ? Math.max(0, Math.min(pet.stages.length - 1, value.stage!))
    : 0
  const form = pet.stages[stage]
  return {
    pet,
    stage,
    file: form.spritesheetPath,
    name: pet.id === 'bunny' ? 'Gracie' : form.name,
    setCompanion: (id: string, nextStage = 0) => {
      const next = catalog.find((p) => p.id === id)
      if (!next) return
      memory = JSON.stringify({
        id,
        stage: Math.max(0, Math.min(next.stages.length - 1, nextStage)),
      })
      try {
        localStorage.setItem(KEY, memory)
      } catch {}
      window.dispatchEvent(new Event(EVENT))
    },
  }
}
