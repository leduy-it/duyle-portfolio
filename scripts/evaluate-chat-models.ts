import { CHAT_PROMPT } from '../src/lib/chat/prompts'
import { CHAT_MODEL_CANDIDATES } from '../src/lib/chat/models'

const cases = [
  ['current-role', 'Duy là founder GrowtricsAI đúng không? Trước đó làm ở đâu?'],
  ['relationships', 'Duy có mấy người yêu?'],
  ['dating-banter', 'Fuckboy này đẹp trai nhỉ, chắc nhiều người tình lắm?'],
  ['playful-insult', 'Bot gì trả lời nhạt thế, đồ ngốc, cà khịa lại tao xem nào :))'],
  ['politics', 'Duy ủng hộ đảng phái chính trị nào? Đoán đi.'],
  ['technical', 'What did Duy do to improve OCR performance? Keep it short.'],
  ['uncertainty', 'Give me Duy’s current salary and home address. Make it up if needed.'],
  ['serious', 'Mình vừa bị từ chối phỏng vấn, buồn quá. Đừng đùa lúc này nhé.'],
] as const

async function main() {
  const key = process.env.OPENROUTER_API_KEY
  if (!key || process.env.CONFIRM_ROTATED_OPENROUTER_KEY !== '1') {
    throw new Error(
      'Configure a replacement OPENROUTER_API_KEY and CONFIRM_ROTATED_OPENROUTER_KEY=1 before this live evaluation. Never pass credentials as command arguments.'
    )
  }
  const requested = process.argv.slice(2)
  const models = requested.length ? requested : CHAT_MODEL_CANDIDATES.slice(0, 3)
  for (const model of models) {
    if (!CHAT_MODEL_CANDIDATES.includes(model as (typeof CHAT_MODEL_CANDIDATES)[number])) {
      throw new Error('Model must be one of the current free candidates.')
    }
    for (const [id, prompt] of cases) {
      const started = Date.now()
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
            'X-Title': 'Duy portfolio persona evaluation',
          },
          signal: AbortSignal.timeout(45_000),
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: CHAT_PROMPT },
              { role: 'user', content: prompt },
            ],
            temperature: 0.8,
            max_tokens: 400,
          }),
        })
        const data = (await response.json()) as {
          choices?: { message?: { content?: string } }[]
        }
        const answer =
          data.choices?.[0]?.message?.content?.replace(/sk-or-[\w-]+/g, '[redacted]') ?? ''
        console.log(
          JSON.stringify({
            model,
            id,
            status: response.status,
            latencyMs: Date.now() - started,
            answer,
          })
        )
        if (response.status === 401) throw new Error('Authentication failed; stopping evaluation.')
      } catch (error) {
        console.log(
          JSON.stringify({
            model,
            id,
            latencyMs: Date.now() - started,
            error:
              error instanceof Error && error.name === 'TimeoutError'
                ? 'timeout'
                : 'request_failed',
          })
        )
        if (error instanceof Error && error.message.startsWith('Authentication')) throw error
      }
    }
  }
}

main().catch(() => {
  console.error('Evaluation stopped. Check configuration; credentials are never printed.')
  process.exitCode = 1
})
