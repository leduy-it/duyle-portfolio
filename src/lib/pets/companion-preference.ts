'use client'

import { useSyncExternalStore } from 'react'

const key = 'duy:gracie:visible'
const listeners = new Set<() => void>()
let memory: boolean | undefined

function read() {
  if (memory !== undefined) return memory
  try {
    return localStorage.getItem(key) !== 'off'
  } catch {
    return true
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  function changed(event: StorageEvent) {
    if (event.key === key || event.key === null) {
      memory = undefined
      listener()
    }
  }
  window.addEventListener('storage', changed)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', changed)
  }
}

export function useCompanionPreference() {
  const visible = useSyncExternalStore(subscribe, read, () => true)
  function setVisible(value: boolean) {
    memory = value
    try {
      localStorage.setItem(key, value ? 'on' : 'off')
    } catch {
      /* Remain usable for this visit. */
    }
    listeners.forEach((listener) => listener())
  }
  return { visible, setVisible }
}
