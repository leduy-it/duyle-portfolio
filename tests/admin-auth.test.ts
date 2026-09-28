import test from 'node:test'
import assert from 'node:assert/strict'
import {
  passphraseMatches,
  buildAdminCookie,
  verifyAdminCookieValue,
} from '../src/lib/tracking/admin-auth'

test('owner authentication fails closed without configured secrets', () => {
  const original = { ...process.env }
  try {
    Object.assign(process.env, { NODE_ENV: 'production' })
    delete process.env.ADMIN_PASSPHRASE
    delete process.env.ADMIN_SECRET
    assert.equal(passphraseMatches(''), false)
    assert.throws(() => buildAdminCookie())
  } finally {
    process.env = original
  }
})
test('configured passphrase normalization, cookie tampering and secret rotation', () => {
  const original = { ...process.env }
  try {
    Object.assign(process.env, {
      NODE_ENV: 'production',
      ADMIN_PASSPHRASE: 'Owner Test Phrase',
      ADMIN_SECRET: 'a'.repeat(40),
    })
    assert.equal(passphraseMatches('  OWNER TEST PHRASE  '), true)
    assert.equal(passphraseMatches('wrong phrase'), false)
    const cookie = buildAdminCookie().value
    assert.equal(verifyAdminCookieValue(cookie), true)
    assert.equal(verifyAdminCookieValue(cookie.replace('admin|', 'visitor|')), false)
    const parts = cookie.split('|')
    parts[2] = 'é'.repeat(parts[2].length)
    assert.equal(verifyAdminCookieValue(parts.join('|')), false)
    process.env.ADMIN_SECRET = 'b'.repeat(40)
    assert.equal(verifyAdminCookieValue(cookie), false)
  } finally {
    process.env = original
  }
})
