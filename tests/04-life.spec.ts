import { expect, test } from 'playwright/test'

test.use({ channel: 'chrome' })

test('life timeline is separate from research and links to original posts', async ({ page }) => {
  await page.goto('/life')

  await expect(page.getByRole('heading', { name: /life, in frames/i })).toBeVisible()
  await expect(page.locator('header nav a[href="/life"]')).toBeVisible()
  await expect(page.locator('header nav a[href="/blog"]')).toBeVisible()

  const entries = page.locator('[data-life-entry]')
  await expect(entries).toHaveCount(4)
  await expect(page.getByText('03 OCT 2026')).toBeVisible()
  await expect(page.getByText('03 JUL 2022')).toBeVisible()
  await expect(page.getByText('22 MAR 2021')).toBeVisible()
  await expect(page.getByText('03 FEB 2021')).toBeVisible()
  await expect(page.locator('a[href*="facebook.com/stories/"]').first()).toBeVisible()
  await expect(page.locator('a[href*="instagram.com/leduy.py/p/"]')).toHaveCount(3)
  await expect(page.locator('img[alt*="Duy"]')).toHaveCount(5)

  await page.locator('#desk-evening').scrollIntoViewIfNeeded()
  await expect.poll(() => page.locator('#desk-evening img[alt*="Duy"]').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0)
})

test('life timeline remains readable on a narrow screen with reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/life')

  await expect(page.getByRole('heading', { name: /life, in frames/i })).toBeVisible()
  await expect(page.locator('[data-life-entry]')).toHaveCount(4)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375)
  await expect(page.locator('img[alt="Black-and-white portrait of Duy holding a leaf"]')).toBeVisible()
})
