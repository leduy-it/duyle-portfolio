import {test,expect} from 'playwright/test'
import films from '../src/data/films.json'
import {createHash} from 'node:crypto'
import {readFile} from 'node:fs/promises'

test.use({deviceScaleFactor:3})

test('cinema keeps notes navigation and offers verified IMDb links with sharp mobile posters and pixel icons',async({page},info)=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message))
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.goto('/movie')
  expect(films.length).toBe(11)
  await expect(page.locator('a[data-track^="cinema:imdb:"]')).toHaveCount(11)
  await expect(page.locator('a[data-track^="cinema:watch:"]')).toHaveCount(11)
  for(const film of films){
    expect(film.imdbUrl).toMatch(/^https:\/\/www\.imdb\.com\/title\/tt\d+\/$/)
    await expect(page.locator(`[data-track="cinema:imdb:${film.slug}"]`)).toHaveAttribute('href',film.imdbUrl)
  }
  expect(await page.locator('a a').count()).toBe(0)
  for(const path of ['/icon.png','/apple-icon.png','/favicon.ico']){
    const response=await page.request.get(path);expect(response.status()).toBe(200)
    const bytes=await response.body(),local=await readFile(`src/app${path}`)
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(createHash('sha256').update(local).digest('hex'))
  }
  await expect(page.locator('link[rel="icon"][href*="icon.png"]')).toHaveCount(1)
  await page.setViewportSize({width:390,height:844})
  for(const slug of ['project-hail-mary','house-of-the-dragon','spider-man-into-the-spider-verse','schindlers-list']){
    const card=page.locator(`a[data-track="cinema:imdb:${slug}"]`).locator('xpath=ancestor::article')
    await card.getByRole('link',{name:/view notes/i}).click()
    await expect(page).toHaveURL(new RegExp(`/movie/${slug}$`))
    const poster=page.locator('main img').first()
    await expect(poster).toBeVisible()
    await expect.poll(()=>poster.evaluate((image:HTMLImageElement)=>image.complete && image.naturalWidth>0)).toBe(true)
    expect(await poster.getAttribute('src')).toContain('q=90')
    const imageUrl=await poster.evaluate((image:HTMLImageElement)=>image.currentSrc)
    expect(Number(new URL(imageUrl).searchParams.get('w'))).toBeGreaterThanOrEqual(1000)
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
    await expect(page.locator(`[data-track="cinema:imdb:${slug}"]`)).toBeVisible()
    if(slug==='project-hail-mary')await page.screenshot({path:info.outputPath('hail-mary-mobile.png')})
    await page.goto('/movie')
  }
  expect(errors).toEqual([])
})
