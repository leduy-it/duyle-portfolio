interface ContactSubmission {email:string;subject:string;message:string;requestId:string;conversationId?:string}
/** Persisted inbox first; one browser dispatch; never automatically repeat an uncertain send. */
export async function submitBrowserRelay(nonce:string,input:ContactSubmission,headers:Record<string,string>):Promise<'submitted'|'stored'> {
  try {
    const response=await fetch('https://formsubmit.co/ajax/levduyit@gmail.com',{
      method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},
      body:JSON.stringify({name:'Michael Le Portfolio',email:input.email,_replyto:input.email,subject:input.subject,message:input.message,_subject:`Portfolio / ${input.subject}`,_url:'https://leduy.vercel.app/',_captcha:'false',_template:'table'}),signal:AbortSignal.timeout(12_000),
    })
    const result=await response.json().catch(()=>null)
    if(!response.ok || ![true,'true'].includes(result?.success))return 'stored'
    const recorded=await fetch('/api/contact',{method:'POST',headers,body:JSON.stringify({...input,action:'relay-ack',relayNonce:nonce}),signal:AbortSignal.timeout(12_000)})
    const receipt=await recorded.json().catch(()=>null)
    return recorded.ok && receipt?.status==='submitted' ? 'submitted' : 'stored'
  }catch{return 'stored'}
}
