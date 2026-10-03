import { trackingHeaders } from './chat-client'
export type ClientAction = 'ui_click' | 'chat_open' | 'contact_open' | 'mailapp_open'
export function actionTarget(element: Element) {
  const href = element instanceof HTMLAnchorElement ? element.getAttribute('href') || '' : ''
  let destination = ''
  try { const url = new URL(href,location.origin); destination = url.protocol === 'mailto:' ? 'mailto' : url.origin === location.origin ? url.pathname : url.hostname + url.pathname } catch { /* no destination */ }
  const label = (element.getAttribute('aria-label') || element.getAttribute('title') || element.textContent || '').replace(/\s+/g,' ').trim().slice(0,100)
  const explicit = element.getAttribute('data-track')
  const targetId = (explicit || `${location.pathname}:${element.tagName.toLowerCase()}:${destination || label}`).slice(0,180)
  return {targetId,details:{label,href:destination,element:element.tagName.toLowerCase()}}
}
export function trackAction(kind: ClientAction, targetId: string, details?: {label?:string;href?:string;element?:string}) {
  if (typeof window === 'undefined' || navigator.doNotTrack === '1' || location.pathname.startsWith('/admin')) return
  void fetch('/api/track',{method:'POST',headers:trackingHeaders(),keepalive:true,body:JSON.stringify({
    kind,targetId,details,eventId:crypto.randomUUID(),path:location.pathname,
    referrer:document.referrer || null,screenWidth:innerWidth,screenHeight:innerHeight,locale:navigator.language,
  })}).catch(() => { /* interaction is never blocked by telemetry */ })
}
