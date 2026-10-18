import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from 'ai'
import { headers } from 'next/headers'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { chatMessages } from '@/lib/db/schema'
import {
  consumeMessage,
  DAILY_FREE_LIMIT,
  refundMessage,
  TELEGRAM_URL,
} from '@/lib/usage'

export const maxDuration = 60

const MAX_INPUT_CHARS = 4000
const CONTEXT_MESSAGES = 20

const INSTRUCTIONS = `You are Tulasi AI, a friendly assistant that answers questions, writes code, and creates clear study notes on any topic.
- Use Markdown. Put code in fenced code blocks with a language tag.
- For notes, use headings and bullet points and keep them well organised.
- This user is on the Free plan (${DAILY_FREE_LIMIT} messages per day). Premium (Rs 999 for 30 days, unlimited messages) can only be bought in the Telegram bot ${TELEGRAM_URL}. Mention this only if needed.`

function textOf(message: UIMessage) {
  return message.parts
    .map((part) => (part.type === 'text' ? part.text : ''))
    .join('')
    .trim()
}

export async function POST(req: Request) {
  // Basic auth/session checks
  const session = await getSession(await headers())
  if (!session?.user) {
    return new Response('Please sign in to chat.', { status: 401 })
  }
  const userId = session.user.id

  // Parse body
  let messages: UIMessage[]
  try {
    const body = await req.json()
    messages = Array.isArray(body?.messages) ? body.messages : []
  } catch (err) {
    console.error('Invalid request body:', err)
    return new Response('Invalid request.', { status: 400 })
  }

  const last = messages.at(-1)
  const userText = last && last.role === 'user' ? textOf(last) : ''
  if (!userText) return new Response('Message is empty.', { status: 400 })
  if (userText.length > MAX_INPUT_CHARS) {
    return new Response(
      `Message is too long (max ${MAX_INPUT_CHARS} characters).`,
      { status: 400 },
    )
  }

  const remaining = await consumeMessage(userId)
  if (remaining === null) {
    return new Response(
      `You have used your ${DAILY_FREE_LIMIT} free messages for today. Come back tomorrow, or get Premium (Rs 999 for 30 days, unlimited messages) in our Telegram bot: ${TELEGRAM_URL}`,
      { status: 429 },
    )
  }

  await db.insert(chatMessages).values({ userId, role: 'user', content: userText })

  const context = messages
    .slice(-CONTEXT_MESSAGES)
    .filter((m) => m.role === 'user' || m.role === 'assistant')

  let refunded = false
  const refundOnce = async () => {
    if (refunded) return
    refunded = true
    await refundMessage(userId)
  }

  // Ensure developer set the API key
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set in environment')
    return new Response('Server misconfiguration: GEMINI_API_KEY missing', { status: 500 })
  }

  // Model name can be overridden via env var, default to Gemini flash model
  const model = process.env.GEMINI_MODEL || 'google/gemini-2.0-flash'

  try {
    const result = streamText({
      model,
      instructions: INSTRUCTIONS,
      messages: await convertToModelMessages(context),
      onError: async ({ error }) => {
        console.error('Tulasi AI generation failed:', error)
        await refundOnce()
      },
      onFinish: async ({ text }) => {
        if (text?.trim()) {
          await db
            .insert(chatMessages)
            .values({ userId, role: 'assistant', content: text })
        }
      },
    })

    // Return the streaming response expected by @ai-sdk/react DefaultChatTransport
    return createUIMessageStreamResponse(toUIMessageStream(result))
  } catch (err) {
    console.error('Generation error:', err)
    await refundOnce()
    return new Response('Generation failed', { status: 500 })
  }
}
