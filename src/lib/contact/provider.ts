export type EmailProvider = 'resend' | 'brevo' | 'formsubmit'
export function emailConfiguration() {
  const selected=process.env.CONTACT_PROVIDER
  const provider:EmailProvider=selected==='formsubmit' || selected==='resend' || selected==='brevo' ? selected : process.env.RESEND_API_KEY ? 'resend' : process.env.BREVO_API_KEY ? 'brevo' : 'formsubmit'
  const key=provider==='brevo' ? process.env.BREVO_API_KEY : process.env.RESEND_API_KEY
  const from=process.env.CONTACT_FROM_EMAIL || ''
  const parsed=from.match(/^(.*?)\s*<([^<>]+)>$/)
  const email=parsed ? parsed[2].trim() : from.trim()
  const name=parsed ? parsed[1].trim() : 'Michael Le Portfolio'
  const available=provider==='formsubmit' || !!key && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) && !/[\r\n]/.test(from)
  return {provider,key,from,email,name,available}
}
export async function deliverEmail(input:{email:string;subject:string;message:string;idempotencyKey:string}) {
  const config=emailConfiguration()
  if(!config.available) throw Error('delivery_unconfigured')
  if(config.provider==='formsubmit') {
    const response=await fetch('https://formsubmit.co/ajax/levduyit@gmail.com',{
      method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',Origin:'https://leduy.vercel.app',Referer:'https://leduy.vercel.app/'},
      body:JSON.stringify({name:'Michael Le Portfolio',email:input.email,_replyto:input.email,subject:input.subject,message:input.message,_subject:`Portfolio / ${input.subject}`,_url:'https://leduy.vercel.app/',_captcha:'false',_template:'table'}),signal:AbortSignal.timeout(12_000),
    })
    const receipt=await response.json().catch(()=>null)
    if(!response.ok || ![true,'true'].includes(receipt?.success))throw Error('delivery_unavailable')
    // FormSubmit acknowledges submission without a message ID or inbox-delivery evidence.
    return {id:input.idempotencyKey,provider:'formsubmit' as const,submission:true as const}
  }
  const resend=config.provider==='resend'
  const payload=resend ? {from:config.from,to:['levduyit@gmail.com'],reply_to:input.email,subject:`Portfolio / ${input.subject}`,text:input.message} : {
    sender:{email:config.email,name:config.name},to:[{email:'levduyit@gmail.com',name:'Michael Le'}],replyTo:{email:input.email},subject:`Portfolio / ${input.subject}`,textContent:input.message,headers:{'Idempotency-Key':input.idempotencyKey},
  }
  const response=await fetch(resend ? 'https://api.resend.com/emails' : 'https://api.brevo.com/v3/smtp/email',{
    method:'POST',headers:resend ? {'Content-Type':'application/json',Authorization:`Bearer ${config.key}`,'Idempotency-Key':input.idempotencyKey} : {'Content-Type':'application/json','api-key':config.key!},
    body:JSON.stringify(payload),signal:AbortSignal.timeout(12_000),
  })
  const receipt=await response.json().catch(()=>null)
  const id=resend ? receipt?.id : receipt?.messageId
  if(!response.ok || typeof id!=='string' || !id) throw Error('delivery_unavailable')
  return {id,provider:config.provider}
}
