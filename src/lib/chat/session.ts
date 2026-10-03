import type { ChatHandoff, ChatTurn } from './handoff'

const KEY = 'leduy.chat.session.v1'
let memory: ChatHandoff | null = null

export function readChatSession(): ChatHandoff | null {
  let value: unknown = memory
  try { value = JSON.parse(sessionStorage.getItem(KEY) || 'null') || memory } catch { /* use memory */ }
  if (!value || typeof value !== 'object') return null
  const candidate = value as Partial<ChatHandoff>
  if (!Array.isArray(candidate.messages)) return null
  return {
    messages: candidate.messages.filter((turn): turn is ChatTurn => !!turn && (turn.role === 'user' || turn.role === 'assistant') && typeof turn.content === 'string' && turn.content.length <= (turn.role === 'assistant' ? 6000 : 2000)).slice(-30),
    draft: typeof candidate.draft === 'string' ? candidate.draft.slice(0, 2000) : '',
  }
}

export function saveChatSession(value: ChatHandoff) {
  memory = { messages: value.messages.filter(turn => turn.content.trim()).slice(-30), draft: value.draft.slice(0, 2000) }
  try { sessionStorage.setItem(KEY, JSON.stringify(memory)) } catch { /* memory preserves client navigation */ }
}
