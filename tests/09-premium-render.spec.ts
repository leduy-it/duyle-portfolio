import {test,expect} from 'playwright/test'
test.use({viewport:{width:390,height:844},deviceScaleFactor:3})
test.beforeEach(async({page})=>{await page.route('**/api/track',route=>route.fulfill({json:{ok:true}}))})
test('all phone cover variants render at full DPR without overflow or errors',async({page},testInfo)=>{
  const errors:string[]=[]
  page.on('pageerror',error=>errors.push(error.message))
  for(const route of ['/blog','/movie']) {
    await page.goto(route)
    const carousel=page.locator('[data-featured-carousel]')
    const patterns=new Set<string>()
    for(let index=0;index<3;index++) {
      const canvas=carousel.locator('[data-cover-model][data-model-ready="true"]').last()
      await expect(canvas).toBeVisible({timeout:15000})
      const info=await canvas.evaluate(element=>({width:(element as HTMLCanvasElement).width,css:element.getBoundingClientRect().width,height:(element as HTMLCanvasElement).height,variant:(element as HTMLElement).dataset.coverVariant}))
      expect(info.width/info.css).toBeGreaterThan(2.8)
      expect(info.width*info.height).toBeLessThanOrEqual(2_500_001)
      patterns.add(await carousel.getAttribute('data-transition-pattern') || '')
      await carousel.screenshot({path:testInfo.outputPath(`${route.slice(1)}-${index}-phone.png`)})
      if(index<2) {await carousel.getByRole('button',{name:'Next slide',exact:true}).click();await expect(carousel.locator('[data-featured-slide]')).toHaveAttribute('data-featured-slide',`${route==='/blog' ? 'research' : 'cinema'}-${index+1}`);await page.waitForTimeout(1000)}
    }
    expect(patterns.size).toBeGreaterThanOrEqual(2)
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  }
  expect(errors).toEqual([])
})
test('Jupiter is fully visible on a phone, sharp on retina, and game launch still works',async({page},testInfo)=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message))
  await page.goto('/arcade')
  const canvas=page.locator('[data-cover-model="jupiter"]')
  await expect(canvas).toHaveAttribute('data-model-ready','true',{timeout:15000})
  const box=await canvas.boundingBox();expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(390);expect(box!.y+box!.height).toBeLessThan(600)
  expect(await canvas.evaluate(element=>(element as HTMLCanvasElement).width/element.getBoundingClientRect().width)).toBeGreaterThan(2.8)
  await page.screenshot({path:testInfo.outputPath('arcade-jupiter-phone.png')})
  await expect(page.locator('.arcade-card')).toHaveCount(27)
  await page.getByRole('button',{name:'Play Last Beacon',exact:true}).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button',{name:'Close game',exact:true}).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.emulateMedia({reducedMotion:'reduce'})
  await expect(canvas).toHaveAttribute('data-model-ready','true',{timeout:15000})
  await expect(canvas).toHaveAttribute('data-model-motion','static')
  expect(errors).toEqual([])
})
test('desktop Jupiter composition and changing route entrances retain readable content',async({page},testInfo)=>{
  await page.setViewportSize({width:1440,height:950})
  await page.goto('/arcade')
  await expect(page.locator('[data-cover-model="jupiter"]')).toHaveAttribute('data-model-ready','true',{timeout:15000})
  await page.screenshot({path:testInfo.outputPath('arcade-jupiter-desktop.png')})
  await page.getByRole('link',{name:/leduy/}).first().click()
  await expect(page.locator('[data-motion-pattern]')).toBeVisible()
  const patterns=new Set<string>()
  for(const route of ['/blog','/movie','/experience','/life']) {
    await page.locator(`header nav a[href="${route}"]`).first().click()
    await expect(page.locator('[data-motion-path]')).toHaveAttribute('data-motion-path',route)
    await expect(page.locator('main h1').first()).toBeVisible()
    await page.waitForTimeout(100)
    patterns.add(await page.locator('[data-motion-pattern]').getAttribute('data-motion-pattern') || '')
  }
  expect(patterns.size).toBeGreaterThanOrEqual(2)
})
