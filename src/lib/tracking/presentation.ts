/** Owner timestamps use a fixed timezone/locale so server and browser hydration agree. */
export function formatEventTime(timestamp:string) {
  const date=new Date(timestamp)
  if(Number.isNaN(date.getTime())) return timestamp
  return new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(date)
}
