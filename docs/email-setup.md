# Email delivery setup

Production has durable Redis storage and uses the key-free FormSubmit browser relay by default. Optional Resend/Brevo credentials are absent. Contact submissions are saved in the private admin inbox even before email delivery is configured. The public confirmation explicitly distinguishes this from an email being sent.

## Free provider choices

- Brevo: 300 emails per day on the free plan. Create a sender and verify the email address; transactional sending may require activation. Set `CONTACT_PROVIDER=brevo`, `BREVO_API_KEY`, and `CONTACT_FROM_EMAIL` in Vercel production.
- Resend: free transactional tier; verify a sender domain before general production sending. Set `CONTACT_PROVIDER=resend`, `RESEND_API_KEY`, and `CONTACT_FROM_EMAIL`.

Recipient is fixed to `levduyit@gmail.com`; visitors supply only Reply-To. Never put API keys in source, public environment variables, logs, or chat. Redeploy after setting production variables. Test with the owner's inbox and confirm actual arrival. A provider receipt means accepted, not proof of inbox arrival.

Submissions are saved before provider sending; repeated request IDs cannot change the content, and accepted requests return the stored receipt without another send. A temporary distributed lock prevents concurrent attempts. Retries also use the provider idempotency key. Failed requests retain text/email/subject in admin. Messages saved while email was unconfigured are not silently sent later; they remain reviewable in the owner's inbox.

Sources checked 2026-10-04:
- https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan
- https://help.brevo.com/hc/en-us/articles/208836149-Create-a-new-sender-From-name-and-From-email
- https://developers.brevo.com/reference/send-transac-email
- https://resend.com/pricing
- https://resend.com/docs/api-reference/emails/send-email

## Key-free contact relay — 2026-10-04

The default without Resend/Brevo credentials is FormSubmit's free AJAX relay, fixed to levduyit@gmail.com and the canonical https://leduy.vercel.app/ form URL. First setup requires the owner to click the activation email. The relay returns an acknowledgement, not a provider message ID or proof of inbox delivery. UI says received/submitted; admin stores a separate local submission reference. No older messages are sent automatically.

The relay does not expose a provider idempotency mechanism. Before a relay attempt, persist its start marker; uncertain attempts are not automatically repeated under the same request ID. Redis still stores the contact body even on provider failure. Brevo/Resend remain available by setting CONTACT_PROVIDER explicitly.

Owner setup requests were acknowledged by the relay on 2026-10-04. Owner activation/inbox confirmation is still pending; no actual email arrival is claimed.

Primary sources: https://formsubmit.co/ and https://formsubmit.co/ajax-documentation and https://formsubmit.co/documentation.

## Production correction: browser AJAX dispatch

A production Vercel server request returned 502 while a real browser request from https://leduy.vercel.app received HTTP 200 with success=true. The FormSubmit docs describe browser AJAX and cross-origin support. Dispatch now follows that supported browser flow:

1. POST the contact to the portfolio server; persist text, email, subject, start marker and a one-use nonce before responding with relay_required.
2. Browser POSTs once to the fixed FormSubmit recipient with the canonical form URL.
3. On explicit success, browser records relay-ack with the same request/body and nonce. Server binds it to the existing visitor/contact, marks submissionReportedBy=browser and clears the nonce.
4. Missing acknowledgement remains an uncertain attempt in the durable inbox. Reopening/retrying the same request never automatically sends another relay request.

This browser report is not a provider message ID or proof of inbox delivery. Admin labels it accordingly. Brevo/Resend still use the verified server-provider receipt path. No keys are exposed and no older saved messages are resent.

## Owner-confirmed Gmail arrival

On 2026-10-04 the owner supplied the actual email from submissions@formsubmit.co received at 14:56. Its body exactly matches the synthetic production-browser verification. That test is now confirmed as received in Gmail, rather than only relay-acknowledged. The synthetic activation wording was test content, not a default appended to visitors' messages. No further activation is needed for this working form.
