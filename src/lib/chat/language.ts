/** The UI locale and assistant history must not override the latest visitor. */
export function replyLanguage(question: string): 'en' | 'vi' {
  const q = question.toLowerCase()
  if (/(?:answer|respond|reply|write|tra loi|trả lời).{0,30}(?:english|tieng anh|tiếng anh)/i.test(q)) return 'en'
  if (/(?:answer|respond|reply|write|tra loi|trả lời).{0,30}(?:vietnamese|tieng viet|tiếng việt)/i.test(q)) return 'vi'
  if (/[àáảãạăằắẳẵặâầấẩẫậđèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]/i.test(q)) return 'vi'
  if (/\b(what|how|who|why|where|when|tell|show|give|recommend|handsome|photo|photos|picture|pictures|please|does|can|could|is|are|your)\b/i.test(q)) return 'en'
  if (/\b(anh|toi|minh|ban|lam gi|la ai|dep trai|hinh|choi|phim|vay|khong|co gi|ke ve|tieng viet)\b/i.test(q)) return 'vi'
  return 'en'
}
