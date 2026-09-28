import crypto from 'node:crypto'
import { cookies } from 'next/headers'
const COOKIE_NAME = 'pf_admin',
  TTL_SECONDS = 60 * 60 * 24 * 7
const localSecret = crypto.randomBytes(32).toString('hex')
function getAdminSecret() {
  const secret = process.env.ADMIN_SECRET
  if (secret && secret.length >= 32) return secret
  if (process.env.NODE_ENV !== 'production') return localSecret
  throw Error('admin_unconfigured')
}
function normalizePassphrase(value: string) {
  return value.normalize('NFKC').trim().toLowerCase()
}
export function getAdminPassphrase() {
  return normalizePassphrase(process.env.ADMIN_PASSPHRASE || '')
}
export function adminConfigured() {
  return Boolean(
    getAdminPassphrase() &&
    (process.env.NODE_ENV !== 'production' || (process.env.ADMIN_SECRET?.length || 0) >= 32)
  )
}
function constantEqual(a: string, b: string) {
  return crypto.timingSafeEqual(
    crypto.createHash('sha256').update(a).digest(),
    crypto.createHash('sha256').update(b).digest()
  )
}
export function timingSafeEqualStr(a: string, b: string) {
  return constantEqual(normalizePassphrase(a), normalizePassphrase(b))
}
export function passphraseMatches(provided: string) {
  return (
    adminConfigured() &&
    provided.length <= 256 &&
    Boolean(provided.trim()) &&
    timingSafeEqualStr(provided, getAdminPassphrase())
  )
}
function sign(payload: string) {
  return crypto.createHmac('sha256', getAdminSecret()).update(payload).digest('base64url')
}
export function buildAdminCookie() {
  if (!adminConfigured()) throw Error('admin_unconfigured')
  const expiry = Math.floor(Date.now() / 1000) + TTL_SECONDS,
    payload = `admin|${expiry}`
  return {
    name: COOKIE_NAME,
    value: `${payload}|${sign(payload)}`,
    maxAge: TTL_SECONDS,
  }
}
export function verifyAdminCookieValue(value: string | undefined) {
  if (!value || value.length > 200 || !adminConfigured()) return false
  const [role, expiryStr, sig, ...extra] = value.split('|')
  if (
    extra.length ||
    role !== 'admin' ||
    !/^\d{10,11}$/.test(expiryStr || '') ||
    !/^[A-Za-z0-9_-]{43}$/.test(sig || '')
  )
    return false
  const expiry = Number(expiryStr),
    now = Math.floor(Date.now() / 1000)
  if (expiry <= now || expiry > now + TTL_SECONDS + 60) return false
  try {
    return constantEqual(sign(`${role}|${expiryStr}`), sig)
  } catch {
    return false
  }
}
export async function isAdminRequest() {
  const store = await cookies()
  return verifyAdminCookieValue(store.get(COOKIE_NAME)?.value)
}
export const ADMIN_COOKIE_NAME = COOKIE_NAME
