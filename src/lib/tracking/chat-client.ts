const KEY = 'leduy.chat.conversation-id.v1'
let fallbackId = ''
export function chatTrackingPayload() {
  if (typeof window === 'undefined') return {}
  let conversationId = fallbackId
  try { conversationId = sessionStorage.getItem(KEY) || '' } catch { /* private browser */ }
  if (!/^[a-f0-9-]{36}$/i.test(conversationId)) conversationId = crypto.randomUUID()
  fallbackId = conversationId
  try { sessionStorage.setItem(KEY,conversationId) } catch { /* use tab memory */ }
  return { conversationId, turnId: crypto.randomUUID() }
}
export function trackingHeaders(): Record<string,string> {
  const headers: Record<string,string> = {'Content-Type':'application/json'}
  if (typeof window === 'undefined') return headers
  headers['x-portfolio-path'] = location.pathname
  if (navigator.doNotTrack === '1') headers['x-portfolio-dnt'] = '1'
  try { if (localStorage.getItem('pf_admin_self') === '1') headers['x-admin-self']='1' } catch { /* no storage */ }
  return headers
}
