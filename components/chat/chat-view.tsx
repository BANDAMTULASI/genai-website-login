'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUp, LogOut } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import { ChatMessage } from './chat-message'

const DAILY_LIMIT = 5
const SUGGESTIONS = [
  'Explain recursion with a simple example',
  'Write a Python function to reverse a string',
  'Make short notes on photosynthesis',
]

type Props = {
  userName: string
  initialMessages: UIMessage[]
  initialRemaining: number
}

export function ChatView({ userName, initialMessages, initialRemaining }: Props) {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [remaining, setRemaining] = useState(initialRemaining)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status, error, clearError } = useChat({
    messages: initialMessages,
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    onFinish: () => setRemaining((r) => Math.max(0, r - 1)),
  })

  const busy = status === 'submitted' || status === 'streaming'
  const limitReached = remaining <= 0

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, status])

  function submit(text: string) {
    const value = text.trim()
    if (!value || busy || limitReached) return
    clearError()
    sendMessage({ text: value })
    setInput('')
  }

  async function signOut() {
    await authClient.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  return (
    <div className="flex h-dvh flex-col bg-background">
      <header className="flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-3">
        <Logo href="/chat" />
        <div className="flex items-center gap-2">
          <span
            className="hidden rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground sm:inline"
            aria-live="polite"
          >
            {remaining}/{DAILY_LIMIT} free messages left today
          </span>
          <Button variant="ghost" size="sm" onClick={signOut} aria-label="Sign out">
            <LogOut className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center gap-6 py-10 text-center">
              <div>
                <h1 className="text-balance text-2xl font-semibold text-foreground">
                  Hi {userName.split(' ')[0]}, I am Tulasi AI.
                </h1>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                  Ask me any question, ask for code, or ask for notes on any topic.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => submit(s)}
                    disabled={limitReached}
                    className="rounded-lg border border-border bg-card px-4 py-3 text-left text-sm text-foreground transition-colors hover:border-primary disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => <ChatMessage key={m.id} message={m} />)
          )}

          {status === 'submitted' && (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Tulasi is thinking...
            </p>
          )}

          {error && (
            <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm leading-relaxed text-destructive">
              {error.message || 'Something went wrong. Please try again.'}
            </p>
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      <footer className="border-t border-border bg-card px-4 py-3">
        <div className="mx-auto max-w-3xl">
          {limitReached ? (
            <p className="text-pretty text-center text-sm leading-relaxed text-muted-foreground">
              {"You've used your 5 free messages for today. Come back tomorrow, or get Premium (Rs 999 / 30 days, unlimited) in our "}
              <a
                href="https://t.me/Tulasiaibot"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                Telegram bot
              </a>
              .
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                submit(input)
              }}
              className="flex items-end gap-2"
            >
              <label htmlFor="chat-input" className="sr-only">
                Type your question
              </label>
              <textarea
                id="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.nativeEvent.isComposing || e.keyCode === 229) return
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    submit(input)
                  }
                }}
                rows={1}
                maxLength={4000}
                placeholder="Type your question..."
                className="max-h-40 min-h-11 flex-1 resize-none rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button
                type="submit"
                size="icon"
                disabled={busy || !input.trim()}
                className="size-11 shrink-0"
                aria-label="Send message"
              >
                <ArrowUp className="size-5" aria-hidden="true" />
              </Button>
            </form>
          )}
          <p className="mt-2 text-center text-xs text-muted-foreground sm:hidden">
            {remaining}/{DAILY_LIMIT} free messages left today
          </p>
        </div>
      </footer>
    </div>
  )
}
