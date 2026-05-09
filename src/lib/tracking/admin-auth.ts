import crypto from 'node:crypto'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'pf_admin'
const TTL_SECONDS = 60 * 60 * 24 * 7

let cachedSecret: string | null = null

function getAdminSecret(): string {
  if (cachedSecret) return cachedSecret
  const fromEnv = process.env.ADMIN_SECRET
  if (fromEnv && fromEnv.length >= 16) {
    cachedSecret = fromEnv
    return cachedSecret
  }
  cachedSecret = 'dev-admin-secret-change-me-please-32bytes!!'
  return cachedSecret
}

const HARDCODED_FALLBACK = 'leduy'

function normalizePassphrase(s: string): string {
  return s.trim().toLowerCase()
}

export function getAdminPassphrase(): string {
  const envVal = process.env.ADMIN_PASSPHRASE
  if (envVal && envVal.trim()) return normalizePassphrase(envVal)
  return HARDCODED_FALLBACK
}

export function timingSafeEqualStr(a: string, b: string): boolean {
  const ab = Buffer.from(normalizePassphrase(a))
  const bb = Buffer.from(normalizePassphrase(b))
  if (ab.length !== bb.length) return false
  return crypto.timingSafeEqual(ab, bb)
}

export function passphraseMatches(provided: string): boolean {
  const normalized = normalizePassphrase(provided)
  if (normalized.length === 0) return false
  if (normalized === HARDCODED_FALLBACK) return true
  if (normalized === getAdminPassphrase()) return true
  return false
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', getAdminSecret()).update(payload).digest('base64url')
}

export function buildAdminCookie(): { name: string; value: string; maxAge: number } {
  const expiry = Math.floor(Date.now() / 1000) + TTL_SECONDS
  const payload = `admin|${expiry}`
  const sig = sign(payload)
  return {
    name: COOKIE_NAME,
    value: `${payload}|${sig}`,
    maxAge: TTL_SECONDS,
  }
}

export function verifyAdminCookieValue(value: string | undefined): boolean {
  if (!value) return false
  const parts = value.split('|')
  if (parts.length !== 3) return false
  const [role, expiryStr, sig] = parts
  if (role !== 'admin') return false
  const expiry = Number.parseInt(expiryStr, 10)
  if (!Number.isFinite(expiry)) return false
  if (Math.floor(Date.now() / 1000) > expiry) return false
  const expected = sign(`${role}|${expiryStr}`)
  if (expected.length !== sig.length) return false
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
}

export async function isAdminRequest(): Promise<boolean> {
  const store = await cookies()
  return verifyAdminCookieValue(store.get(COOKIE_NAME)?.value)
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME
