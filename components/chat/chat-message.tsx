import type { UIMessage } from 'ai'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'

export function ChatMessage({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user'
  const text = message.parts
    .map((part) => (part.type === 'text' ? part.text : ''))
    .join('')

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed shadow-[0_1px_4px_rgba(68,28,23,0.05)]',
          isUser
            ? 'whitespace-pre-wrap bg-primary text-primary-foreground'
            : 'border border-border bg-card text-card-foreground',
        )}
      >
        <span className="sr-only">{isUser ? 'You said:' : 'Tulasi AI said:'}</span>
        {isUser ? (
          text
        ) : (
          <div className="prose-chat">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
