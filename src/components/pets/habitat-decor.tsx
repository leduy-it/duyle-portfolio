'use client'
import { useRef, useState } from 'react'
import { usePetSave } from '@/lib/pets/pet-save-provider'
import { decorChanges, applyDecorChanges, type DecorChange } from '@/lib/pets/decor'
import type { PetDecor } from '@/lib/pets/save'

function Furniture({ kind }: { kind: PetDecor['kind'] }) {
  return <svg viewBox="0 0 64 64" aria-hidden="true" shapeRendering="crispEdges">
    <ellipse cx="32" cy="58" rx="25" ry="4" fill="#203d3038" />
    {kind === 'bench' ? <><path fill="#694b32" d="M9 24h46v8H9zM9 35h46v8H9zM13 43h6v14h-6zM46 43h6v14h-6z" /><path fill="#b18a53" d="M7 22h50v6H7zM7 33h50v6H7zM5 43h54v6H5z" /><path fill="#e0bd7b" d="M7 22h50v2H7zM7 33h50v2H7zM5 43h54v2H5z" /></> : kind === 'lantern' ? <><path fill="#465241" d="M29 17h6v39h-6zM22 55h20v4H22zM24 8h16v4H24zM20 12h24v4H20zM22 16h20v20H22z" /><path fill="#ffda7b" d="M25 18h14v14H25z" /><path fill="#fff3be" d="M28 18h5v14h-5z" /><path fill="#48513c" d="M30 14h3v22h-3zM20 34h24v3H20z" /></> : <><path fill="#ae7152" d="M17 37h30v8H17zM20 45h24v12H20z" /><path fill="#deaa79" d="M17 37h30v3H17z" /><path fill="#3d6e48" d="M29 17h6v22h-6zM16 22h14v9H16zM35 15h15v10H35zM25 7h12v14H25z" /><path fill="#81a954" d="M17 21h12v5H17zM36 14h13v5H36zM25 6h12v7H25z" /><path fill="#f0d98b" d="M26 5h4v4h-4zM40 14h4v4h-4z" /></>}
  </svg>
}
export function HabitatDecor({ editing, vi }: { editing: boolean; vi: boolean }) {
  const { save, update } = usePetSave()
  const [undo, setUndo] = useState<DecorChange[] | null>(null)
  const drag = useRef<{ id: string; x: number; y: number } | null>(null)
  async function commit(next: PetDecor[]) {
    const changes = decorChanges(save.decor, next)
    await update(s => {
      const decor = applyDecorChanges(s.decor, changes)
      const applied = decorChanges(s.decor, decor)
      setUndo(applied.map(change => ({ before: change.after, after: change.before })))
      return { ...s, decor }
    })
  }
  return <>
    {save.decor.map(item => <button key={item.id} type="button" className="habitat-decor" data-editing={editing} style={{ left: `${item.x}%`, top: `${item.y}%` }} disabled={!editing} aria-label={`${item.kind} · ${vi ? 'kéo để di chuyển, phím mũi tên để tinh chỉnh' : 'drag to move, arrow keys to adjust'}`}
      onPointerDown={event => { if (!editing) return; event.currentTarget.setPointerCapture(event.pointerId); drag.current = { id: item.id, x: item.x, y: item.y } }}
      onPointerMove={event => { if (!drag.current || drag.current.id !== item.id) return; const rect = event.currentTarget.parentElement!.getBoundingClientRect(); drag.current.x = Math.max(12, Math.min(88, (event.clientX - rect.left) / rect.width * 100)); drag.current.y = Math.max(45, Math.min(90, (event.clientY - rect.top) / rect.height * 100)); event.currentTarget.style.left = `${drag.current.x}%`; event.currentTarget.style.top = `${drag.current.y}%` }}
      onPointerUp={() => { const next = drag.current; if (!next) return; drag.current = null; commit(save.decor.map(d => d.id === item.id ? { ...d, x: next.x, y: next.y } : d)) }}
      onPointerCancel={event => { drag.current = null; event.currentTarget.style.left = `${item.x}%`; event.currentTarget.style.top = `${item.y}%` }}
      onKeyDown={event => { const delta: Record<string, [number, number]> = { ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -2], ArrowDown: [0, 2] }; const move = delta[event.key]; if (!move) return; event.preventDefault(); commit(save.decor.map(d => d.id === item.id ? { ...d, x: Math.max(12, Math.min(88, d.x + move[0])), y: Math.max(45, Math.min(90, d.y + move[1])) } : d)) }}><Furniture kind={item.kind} /></button>)}
    {editing && <div className="decor-tools">{(['bench', 'lantern', 'planter'] as const).map(kind => <button key={kind} disabled={save.decor.length >= 12} onClick={() => commit([...save.decor, { id: crypto.randomUUID(), kind, x: 45 + Math.random() * 15, y: 65 + Math.random() * 15 }])}>＋ {vi ? { bench: 'Ghế', lantern: 'Đèn', planter: 'Cây' }[kind] : kind}</button>)}<button disabled={!save.decor.length} onClick={() => commit(save.decor.slice(0, -1))}>{vi ? 'Bớt đồ' : 'Remove last'} −</button><button disabled={!undo} onClick={() => { if (undo) update(s => ({ ...s, decor: applyDecorChanges(s.decor, undo) })); setUndo(null) }}>{vi ? 'Hoàn tác' : 'Undo'} ↶</button></div>}
  </>
}
