import { replyLanguage } from './language'
/** Owner-authored playful catchphrase; richer or serious questions still use grounded chat. */
export function appearanceReply(question:string):string|null {
  const normalized=question.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d')
  if(question.length>180 || !/\b(handsome|dep trai)\b/.test(normalized) || /\b(ocr|architecture|kien truc|career|engineer|cong viec|rag|code|work|project)\b/.test(normalized))return null
  const vi=replyLanguage(question)==='vi'
  const greeting=vi ? '[trợ lí của Duy]\n\nĐẹp trai nhất — bảng xếp hạng do thỏ nhà tự chấm, nên hơi thiên vị một xíu. Ảnh đây, bạn làm giám khảo vòng hai nhé.' : "[Duy's agent]\n\nThe most handsome — according to this completely biased bunny. Here are the photos; you can judge round two."
  return greeting+'\n\n[[card:profile-portrait]] [[card:life-leaf-portrait]] [[card:life-outside]]'
}
