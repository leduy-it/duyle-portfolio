export async function chatResponseError(response: Response) {
  const body = await response.json().catch(() => ({}))
  return new Error(typeof body.error === 'string' ? body.error : `http_${response.status}`)
}
export function chatErrorMessage(error: unknown, vi: boolean) {
  const code = error instanceof Error ? error.message : ''
  if (['unconfigured', 'temporarily_unavailable', 'service_unconfigured'].includes(code))
    return vi
      ? 'Chat đang chưa sẵn sàng vì máy chủ thiếu cấu hình. Tin nhắn của bạn vẫn được giữ lại.'
      : 'Chat is not ready because server setup is incomplete. Your message is still saved.'
  if (code === 'rate_limited')
    return vi
      ? 'Bạn gửi hơi nhanh rồi. Đợi một chút rồi thử lại nhé; tin nhắn vẫn còn.'
      : 'Too many messages. Wait a little and try again; your draft is saved.'
  return vi
    ? 'Gracie chưa nhận được phản hồi hoàn chỉnh. Tin nhắn vẫn được giữ lại để bạn thử lại.'
    : 'Gracie could not get a complete reply. Your draft is saved so you can retry.'
}
