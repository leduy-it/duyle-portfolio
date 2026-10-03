import { getSalt, hashIdentity, type TrackEvent } from './store'
import { isAdminRequest } from './admin-auth'
import { requestIdentity } from '@/lib/server/redis'
import { isBotUA } from './bot-filter'

/** The same pseudonymous identity as page analytics; no raw IP is persisted. */
export async function trackingContext(request: Request): Promise<TrackEvent | null> {
  if ((request.headers.get('dnt') === '1' || request.headers.get('x-portfolio-dnt') === '1') || isBotUA(request.headers.get('user-agent'))) return null
  if (request.headers.get('x-admin-self') === '1' && await isAdminRequest()) return null
  const salt = await getSalt()
  const ua = request.headers.get('user-agent')?.slice(0, 512) || null
  const sid = request.headers.get('cookie')?.split(';').map(value => value.trim()).find(value => value.startsWith('pf_sid='))?.slice(7)
  const ipHash = hashIdentity(['ip', requestIdentity(request) === 'local' ? '0.0.0.0' : requestIdentity(request)], salt)
  const visitorId = hashIdentity(['v', ipHash, ua || ''], salt)
  // Browser callers share this cookie with page events. Fallback is stable for this visitor.
  const sessionId = sid && /^[a-zA-Z0-9-]{8,64}$/.test(sid) ? sid : hashIdentity(['session', visitorId], salt)
  const geo = (name: string) => { try { return decodeURIComponent(request.headers.get(name) || '').slice(0, 100) || null } catch { return null } }
  const rawPath = request.headers.get('x-portfolio-path') || '/'
  return {
    ts: new Date().toISOString(), path: /^\/(?!\/)[^\\\x00-\x1f]{0,511}$/.test(rawPath) ? rawPath.split(/[?#]/)[0] : '/',
    referrer: null, userAgent: ua, country: geo('x-vercel-ip-country'), locale: request.headers.get('accept-language')?.slice(0,32) || null,
    visitorId, sessionId, screenWidth: null, screenHeight: null, city: geo('x-vercel-ip-city'), region: geo('x-vercel-ip-country-region'),
  }
}
