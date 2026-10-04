# Email delivery setup

Production currently has durable Redis storage, but no sending-provider credentials. Contact submissions are saved in the private admin inbox even before email delivery is configured. The public confirmation explicitly distinguishes this from an email being sent.

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
