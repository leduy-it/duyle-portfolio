import {test,expect} from 'playwright/test'
test('relay submission confirmation replaces configuration error without claiming inbox delivery',async({page})=>{
  let calls=0
  await page.route('**/api/contact',async route=>{
    if(route.request().method()==='GET')await route.fulfill({json:{available:true,deliveryAvailable:true,inboxAvailable:true}})
    else{calls++;await route.fulfill({json:{ok:true,status:'submitted'}})}
  })
  await page.route('**/api/chat',async route=>route.fulfill({json:{reply:'Contact relay browser verification only.'}}))
  await page.goto('/')
  await page.getByRole('button',{name:/Send to (Michael|Duy)/}).first().click()
  await page.locator('input[type="email"]').fill('verification@example.com')
  const send=page.locator('[data-track="contact:send"]')
  await expect(send).toBeEnabled();await send.click()
  await expect(page.getByText('Your message has been received. Michael can reply using the email you provided.',{exact:true})).toBeVisible()
  expect(calls).toBe(1)
  await expect(page.getByText('Email delivery is not configured yet',{exact:false})).toHaveCount(0)
})
