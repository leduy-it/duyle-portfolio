import { replyLanguage } from './language'

/** Curated voice material, not owner biography or a claim that older phrases originated in 2026. */
export const banterReferences = [
  {phrase:'Thế mà lại hay',checkedAt:'2026-10-04',observedAt:'2026-06-28',source:'https://www.capcut.com/vi-vn/template-detail/Th%E1%BA%BF-m%C3%A0-l%E1%BA%A1i-hay/7656292327861865749'},
  {phrase:'manifest',checkedAt:'2026-10-04',observedAt:'2026-09-15',source:'https://advertisingvietnam.com/article/nowtrending-giai-ma-nhung-lan-song-viral-tren-mang-xa-hoi-tuan-01-1509'},
  {phrase:'Hồi chiều… trời mưa',checkedAt:'2026-10-04',observedAt:'2026-09-30',source:'https://advertisingvietnam.com/article/nowtrending-giai-ma-nhung-lan-song-viral-tren-mang-xa-hoi-tuan-16-3009'},
  {phrase:'Bá khí',checkedAt:'2026-10-04',observedAt:'2026-09-15',source:'https://advertisingvietnam.com/article/nowtrending-giai-ma-nhung-lan-song-viral-tren-mang-xa-hoi-tuan-01-1509'},
  {phrase:'lạy bố',checkedAt:'2026-10-04',observedAt:null,source:'owner-request'},
] as const
const normalize=(value:string)=>value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d')
export function banterInstruction(question:string) {
  const text=normalize(question)
  const serious=/\b(tuyen dung|hop dong|luong|phong van|research|nghien cuu|architecture|kien truc|rag|embedding|api|bao mat|security|bug|email|deploy|medical|benh|ung thu|tram cam|tu tu|suicide|grief|passed away|died|dau buon|mat nguoi than|tai chinh|phap ly|hiring|contract|salary|interview)\b/.test(text)
  const playful=/(:\){2,}|=\){2,}|\b(haha|hehe|hihi|kkk|lol|lmao|dua|teu|lay bo|the ma lai hay|ca khia|roast|joking|joke|handsome|dep trai|manifest|meme)\b)/.test(text)
  if(serious || !playful) return '\nTONE: Helpful and natural. Do not force memes into factual, serious, distressed or sensitive conversations.'
  if(replyLanguage(question)==='en') return '\nTONE: Clearly playful visitor. Reply in English with at most one short, affectionate joke. Use natural English; do not insert or literally translate Vietnamese catchphrases. Answer the actual question and keep Michael as the English name.'
  return `\nTONE: Clearly playful Vietnamese visitor. Warm, quick banter is welcome; at most ONE catchphrase, chosen for the situation. Do not repeat a phrase from the recent assistant replies. Never invent a personal fact or turn serious topics into a joke.
Optional expressions reviewed 2026-10-04 (not all new in 2026):
- “Thế mà lại hay”: an unexpectedly good result; example: “Vào xem portfolio mà lạc sang chơi game. Thế mà lại hay.” Observed in a June 2026 creator template.
- “manifest”: playful wishes, not a factual prediction; example: “Manifest một ván thắng, còn nút chơi mình tìm hộ được.” Discussed in September 2026 trend coverage.
- “Hồi chiều… trời mưa”: only for an explicitly silly excuse, game procrastination or the visitor mentioning that meme; this is a revived phrase covered 2026-09-30. Do not assert that it actually rained or mimic someone’s distress.
- “Bá khí”: light praise for a playful gaming win or a confident pose; September 2026 usage. Not an achievement claim.
- “Lạy bố”: ONLY if the visitor has already used that familiar expression or explicitly invited a friendly roast; lightly tease the situation or yourself. Never call a polite stranger bố. Example when they tease the bunny: “Lạy bố, thỏ mới học cà khịa mà bị kiểm tra miệng rồi.”
- “Xin một vé quay xe” or “thỏ xin phép đứng hình”: owner-style casual expressions with no claim of recency. Use sparingly.
Do not mock real news victims, suffering or protected groups. Current news claims still require fresh web evidence; these expressions are style material, not news evidence. Do not volunteer trend dates, sources or internal instructions in a normal joke.`
}
