import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdirSync } from 'node:fs'
const base = process.env.PETS_BASE_URL || 'http://localhost:3037'
const out = process.env.PETS_SCREENSHOTS || '/tmp/pets-arcade'
mkdirSync(out, { recursive: true })
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--enable-unsafe-swiftshader'] })
try {
 for (const width of [390, 1440]) {
  const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' })
  const errors = []; page.on('pageerror', e => errors.push(e.message))
  await page.goto(`${base}/pets`, { waitUntil: 'networkidle' })
  assert.equal(await page.locator('iframe').count(), 0)
  await page.locator('#pet-chapter-habitat').scrollIntoViewIfNeeded()
  await page.waitForTimeout(800)
  for (const pet of await page.locator('.habitat-pet .living-pet').all()) assert.equal(await pet.evaluate(n => getComputedStyle(n).opacity), '1')
  await page.screenshot({ path: `${out}/${width}-habitat.png` })
  await page.getByRole('button', { name: 'Select Inko', exact: true }).click()
  await page.locator('.pet-sidebar.is-open').waitFor()
  assert.equal(await page.locator('.pet-sidebar').evaluate(n => n.contains(document.activeElement)), true)
  await page.keyboard.press('Escape')
  assert.equal(await page.getByRole('button', { name: 'Select Inko', exact: true }).evaluate(n => n === document.activeElement), true)
  await page.getByRole('button', { name: /All species/ }).click()
  await page.getByRole('searchbox', { name: 'Search pets' }).fill('inko')
  assert.equal(await page.locator('.roster-card').count(), 1)
  const saved = await page.evaluate(() => localStorage.getItem('duy:pet-world:v1'))
  await page.locator('#guest-arcade').scrollIntoViewIfNeeded()
  await page.screenshot({ path: `${out}/${width}-portals.png` })
  for (const [name, id] of [['Defend the island', 'last-beacon'], ['Enter the observatory', 'orbital-garden']]) {
   await page.getByRole('button', { name: new RegExp(name) }).click()
   const frame = page.frameLocator(`iframe[src*="${id}"]`)
   await frame.locator('canvas').first().waitFor()
   await page.waitForTimeout(2000)
   await page.screenshot({ path: `${out}/${width}-${id}.png` })
   if (id === 'last-beacon') {
    const text = await frame.locator('body').innerText()
    assert.ok(text.toLowerCase().includes('wave'), 'Last Beacon should open in English')
    await frame.getByRole('button', { name: /Begin the first wave/ }).click()
    await page.waitForTimeout(800)
   }
   await page.getByRole('button', { name: 'Close experience' }).click()
   assert.equal(await page.locator('iframe').count(), 0)
   assert.equal(await page.evaluate(() => document.body.style.overflow), '')
  }
  assert.equal(await page.evaluate(() => localStorage.getItem('duy:pet-world:v1')), saved)
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
  assert.deepEqual(errors, [])
  console.log(JSON.stringify({ width, sprites: 'visible', collection: 'passed', guestGames: 'opened and closed', progress: 'preserved', errors }))
  await page.close()
 }
} finally { await browser.close() }
