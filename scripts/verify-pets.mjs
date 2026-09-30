import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
const url = process.env.PETS_BASE_URL || 'http://localhost:3032'
const out = process.env.PETS_SCREENSHOTS || '/tmp/pets-v2-review'
mkdirSync(out, { recursive: true })
const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/google-chrome' })
const results = []
try {
  for (const [label, width, height] of [['mobile',390,844],['tablet',768,1024],['desktop',1440,1000]]) {
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' })
      await context.addInitScript(theme => localStorage.setItem('theme', theme), theme)
      const page = await context.newPage()
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      await page.goto(`${url}/pets`, { waitUntil: 'networkidle' })
      await page.waitForFunction(() => JSON.parse(localStorage.getItem('duy:pet-world:v1') || '{}').version === 2)
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
      await page.screenshot({ path: `${out}/${label}-${theme}-hero.png` })
      for (const [area, name] of [['hatchery','Eggs & friends'],['factory','Little factory'],['arena','Glitch garden']]) {
        await page.getByRole('button', { name, exact: false }).first().click()
        await page.locator(`#pet-chapter-${area}`).waitFor({ state: 'visible' })
        await page.screenshot({ path: `${out}/${label}-${theme}-${area}.png` })
      }
      await page.getByRole('button', { name: 'Eggs & friends', exact: false }).first().click()
      await page.getByRole('button', { name: /^Say hello!/ }).click()
      await page.waitForFunction(() => JSON.parse(localStorage.getItem('duy:pet-world:v1')).pets.length === 5)
      await page.getByRole('button', { name: 'The habitat', exact: false }).first().click()
      await page.getByRole('button', { name: 'Select Gracie', exact: true }).click()
      const evolve = page.getByRole('button', { name: 'Grow to next rank', exact: false })
      await evolve.click()
      await page.waitForFunction(() => JSON.parse(localStorage.getItem('duy:pet-world:v1')).pets.find(p => p.species === 'gracie').stage === 1)
      assert.deepEqual(errors, [])
      results.push({ label, theme, overflow: false, pageErrors: errors, hatch: 'passed', growth: 'passed' })
      await context.close()
    }
  }
} finally { await browser.close() }
writeFileSync(`${out}/results.json`, JSON.stringify(results,null,2)+'\n')
console.log(JSON.stringify(results))
