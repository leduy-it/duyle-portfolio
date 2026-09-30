import type { PetDecor } from './save'
export interface DecorChange { before?: PetDecor; after?: PetDecor }
const same = (a?: PetDecor, b?: PetDecor) => JSON.stringify(a) === JSON.stringify(b)
export function decorChanges(before: PetDecor[], after: PetDecor[]): DecorChange[] {
  return [...new Set([...before, ...after].map(item => item.id))].flatMap(id => {
    const a = before.find(item => item.id === id), b = after.find(item => item.id === id)
    return same(a, b) ? [] : [{ before: a, after: b }]
  })
}
/** Apply only if the affected item still matches; unrelated tab edits survive. */
export function applyDecorChanges(current: PetDecor[], changes: DecorChange[]) {
  let next = current
  for (const change of changes) {
    const id = (change.before || change.after)!.id
    if (!same(next.find(item => item.id === id), change.before)) continue
    if (!change.before && next.length >= 12) continue
    next = change.after ? change.before ? next.map(item => item.id === id ? change.after! : item) : [...next, change.after] : next.filter(item => item.id !== id)
  }
  return next
}
