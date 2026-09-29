// Live probes on 2026-09-29: Ling Flash 0.99s; Gemma 31B 1.5s (short Vietnamese prompt).
export const CHAT_MODEL_CANDIDATES = [
  'inclusionai/ling-3.0-flash-sante:free',
  'google/gemma-4-31b-it:free',
  'openrouter/free',
] as const
export function getModelChain(): string[] {
  const override = process.env.OPENROUTER_MODEL?.trim()
  const freeOverride = override === 'openrouter/free' || override?.endsWith(':free')
  return [...new Set([...(freeOverride && override ? [override] : []), ...CHAT_MODEL_CANDIDATES])].slice(0, 3)
}
