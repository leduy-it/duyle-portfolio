export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}
export interface ChatHandoff {
  messages: ChatTurn[]
  draft: string
}
export const CHAT_HANDOFF_EVENT = 'leduy:chat-handoff'
const STORAGE_KEY = 'leduy.gracie.handoff.v1'
let memoryHandoff: ChatHandoff | null = null

export function stageChatHandoff(value: ChatHandoff) {
  memoryHandoff = {
    messages: value.messages.slice(-30),
    draft: value.draft.slice(0, 2000),
  }
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(memoryHandoff))
  } catch {
    /* memory supports client navigation */
  }
  window.dispatchEvent(new CustomEvent(CHAT_HANDOFF_EVENT))
}

export function consumeChatHandoff(): ChatHandoff | null {
  let value: unknown = memoryHandoff
  memoryHandoff = null
  try {
    if (!value) value = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null')
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* use the memory copy if storage is unavailable */
  }
  if (!value || typeof value !== 'object') return null
  const candidate = value as Partial<ChatHandoff>
  if (!Array.isArray(candidate.messages)) return null
  return {
    messages: candidate.messages
      .filter(
        (turn): turn is ChatTurn =>
          !!turn &&
          (turn.role === 'user' || turn.role === 'assistant') &&
          typeof turn.content === 'string' &&
          turn.content.length <= (turn.role === 'assistant' ? 6000 : 2000)
      )
      .slice(-30),
    draft: typeof candidate.draft === 'string' ? candidate.draft.slice(0, 2000) : '',
  }
}

/** Keep full display history locally; bound only the provider request payload. */
export function chatRequestTurns(turns:ChatTurn[]):ChatTurn[] {
  const selected:ChatTurn[]=[]
  let total=0
  for(const turn of [...turns].slice(-14).reverse()) {
    const content=turn.content.slice(0,turn.role==='assistant'?6000:2000)
    if(total+content.length>10000)break
    selected.unshift({...turn,content});total+=content.length
  }
  return selected
}
