export interface ChatSource { title: string; url: string }

/** Public web citations only; never accept credentials, local hosts or private IPs. */
export function publicSourceUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 2000) return null
  try {
    const url = new URL(value)
    const host = url.hostname.toLowerCase()
    if (url.protocol !== 'https:' || url.username || url.password || url.port || !host.includes('.') || host.startsWith('[') || /^(?:\d+\.){3}\d+$/.test(host) || /(?:^|\.)(?:localhost|local|internal|test|invalid)$/.test(host)) return null
    return url.href
  } catch { return null }
}
export function validChatSources(value: unknown): ChatSource[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  return value.flatMap(item => {
    if (!item || typeof item !== 'object' || typeof item.title !== 'string') return []
    const url = publicSourceUrl(item.url)
    if (!url || seen.has(url)) return []
    seen.add(url)
    return [{ title: item.title.replace(/[\u0000-\u001f]/g, '').slice(0, 160), url }]
  }).slice(0, 3)
}
