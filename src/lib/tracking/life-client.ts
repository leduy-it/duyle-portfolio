export type LifeAction = 'life_story_view' | 'life_video_play' | 'life_video_complete' | 'life_source_click'

export function trackLifeAction(kind: LifeAction, targetId: string) {
  if (typeof window === 'undefined' || navigator.doNotTrack === '1') return
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  try {
    if (window.localStorage.getItem('pf_admin_self') === '1') headers['x-admin-self'] = '1'
  } catch { /* storage may be unavailable */ }
  const params = new URLSearchParams(window.location.search)
  void fetch('/api/track', {
    method: 'POST', headers, keepalive: true,
    body: JSON.stringify({
      path: '/life', kind, targetId,
      source: params.get('utm_source'), medium: params.get('utm_medium'), campaign: params.get('utm_campaign'),
      referrer: document.referrer || null,
      screenWidth: window.innerWidth, screenHeight: window.innerHeight, locale: navigator.language || null,
    }),
  }).catch(() => { /* telemetry never interrupts media */ })
}
