// Catalog checked 2026-09-29. Live persona comparison is recorded separately.
export const CHAT_MODEL_CANDIDATES = [
  'google/gemma-4-31b-it:free',
  'qwen/qwen3.8-27b:free',
  'nvidia/nemotron-3.5-lightning:free',
  'google/gemma-4-26b-a4b-it:free',
] as const

export function getModelChain(editMode = false): string[] {
  const override = process.env.OPENROUTER_MODEL?.trim()
  const defaults = editMode
    ? [CHAT_MODEL_CANDIDATES[1], CHAT_MODEL_CANDIDATES[0], CHAT_MODEL_CANDIDATES[2]]
    : CHAT_MODEL_CANDIDATES.slice(0, 3)
  // Keep an accidental paid model override from changing this free-only service.
  return [...new Set([...(override?.endsWith(':free') ? [override] : []), ...defaults])].slice(0, 3)
}
