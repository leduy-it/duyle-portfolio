import {test,expect} from 'playwright/test'
const first={id:'a'.repeat(32),visitorId:'visitor-one',sessionId:'session-one',createdAt:'2026-10-03T12:00:00Z',updatedAt:'2026-10-03T12:05:00Z',preview:'Show Michael’s portrait'}
const second={...first,id:'b'.repeat(32),visitorId:'visitor-two',sessionId:'session-two',preview:'Second visitor thread'}
const makeTurn=(id:string,text:string,reply:string)=>({id,conversationId:first.id,visitorId:first.visitorId,sessionId:first.sessionId,ts:'2026-10-03T12:05:00Z',mode:'chat',path:'/',status:'complete',user:text,assistant:reply,sources:[{title:'Reference',url:'https://example.com/guide'}]})
test('owner can open full terminal threads, switch quickly, preview media and load older messages',async({page},info)=>{
  const base=process.env.OBSERVABILITY_TEST_URL || 'http://localhost:3007'
  const login=await page.request.post(`${base}/api/admin/login`,{data:{passphrase:'local-verification-only'}})
  expect(login.status()).toBe(200)
  await page.route('**/api/admin/conversations?*',async route=>{
    const url=new URL(route.request().url()),id=url.searchParams.get('id'),pageNumber=Number(url.searchParams.get('page') || 1)
    let records:unknown[]=[first,second],hasNext=false,total=2
    if(id===first.id){records=pageNumber===1 ? [makeTurn('new','Show Michael’s portrait','The most handsome. [[telegram-portrait]]'),makeTurn('earlier','First visible question','First visible reply')] : [makeTurn('old','Older question','Older reply')];hasNext=pageNumber===1;total=51}
    if(id===second.id){records=[{...makeTurn('second','Second thread question','Second thread answer'),conversationId:second.id}];total=1;await new Promise(resolve=>setTimeout(resolve,120))}
    await route.fulfill({json:{records,page:pageNumber,total,anchor:total,hasNext}})
  })
  await page.goto(`${base}/admin`)
  const section=page.locator('[data-admin-conversations]')
  await section.getByRole('button',{name:/Show Michael/}).click()
  await expect(section.getByText('Show Michael’s portrait',{exact:true}).last()).toBeVisible()
  await section.getByRole('button',{name:'Open full view'}).click()
  const full=page.getByRole('dialog',{name:'Conversation workspace'})
  await expect(full).toBeVisible()
  await expect(full.locator('[data-thread-sidebar]')).toBeVisible()
  await expect(full.locator('[data-transcript]')).toContainText('First visible reply')
  await full.getByRole('button',{name:'Load earlier messages'}).click()
  const transcript=await full.locator('[data-transcript]').innerText()
  expect(transcript.indexOf('Older question')).toBeLessThan(transcript.indexOf('First visible question'))
  await full.locator('[data-thread-sidebar]').getByRole('button',{name:/Second visitor/}).click()
  await full.locator('[data-thread-sidebar]').getByRole('button',{name:/Show Michael/}).click()
  await expect(full.locator('[data-transcript]')).toContainText('The most handsome')
  await expect(full.locator('[data-transcript]')).not.toContainText('Second thread answer')
  const links=full.locator('[data-web-sources] a');await expect(links.first()).toHaveAttribute('href','https://example.com/guide')
  await expect(full.locator('[data-chat-card]').first()).toBeVisible()
  const bounds=await full.boundingBox();expect(bounds!.width).toBeGreaterThan(1100);expect(bounds!.height).toBeGreaterThan(800)
  await page.screenshot({path:info.outputPath('owner-thread-workspace.png')})
  await page.keyboard.press('Escape');await expect(full).not.toBeVisible()
  await expect(section.getByText('The most handsome',{exact:false})).toBeVisible()
  await page.setViewportSize({width:390,height:844})
  await section.getByRole('button',{name:'Open full view'}).click()
  await full.getByRole('button',{name:'Threads',exact:true}).click()
  await full.locator('[data-thread-sidebar]').getByRole('button',{name:/Second visitor/}).click()
  await expect(full.locator('[data-transcript]')).toContainText('Second thread answer')
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  await full.getByRole('button',{name:'Restore view'}).click()
  await expect(full).not.toBeVisible()
})
