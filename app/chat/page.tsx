import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { UIMessage } from 'ai'
import { desc, eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { chatMessages } from '@/lib/db/schema'
import { getRemaining } from '@/lib/usage'
import { ChatView } from '@/components/chat/chat-view'

export const metadata: Metadata = { title: 'Chat - Tulasi AI' }

export default async function ChatPage() {
  const session = await getSession(await headers())
  if (!session?.user) redirect('/sign-in')
  const userId = session.user.id

  const [recent, remaining] = await Promise.all([
    db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.createdAt), desc(chatMessages.id))
      .limit(40),
    getRemaining(userId),
  ])

  const initialMessages: UIMessage[] = recent
    .reverse()
    .map((m) => ({
      id: `db-${m.id}`,
      role: m.role === 'assistant' ? 'assistant' : 'user',
      parts: [{ type: 'text', text: m.content }],
    }))

  return (
    <ChatView
      userName={session.user.name || session.user.email}
      initialMessages={initialMessages}
      initialRemaining={remaining}
    />
  )
}
