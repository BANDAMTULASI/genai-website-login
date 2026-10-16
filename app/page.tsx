import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Code2, MessageCircleQuestion, NotebookPen } from 'lucide-react'
import { getSession } from '@/lib/auth'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/logo'

const FEATURES = [
  { icon: MessageCircleQuestion, title: 'Answers', text: 'Clear explanations for any question, in simple words.' },
  { icon: Code2, title: 'Code', text: 'Working code with explanations in any language.' },
  { icon: NotebookPen, title: 'Notes', text: 'Well-organised study notes on any topic.' },
]

export default async function HomePage() {
  const session = await getSession(await headers())
  if (session?.user) redirect('/chat')

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between px-4 py-4 md:px-8">
        <Logo />
        <Link href="/sign-in" className={buttonVariants({ variant: 'ghost' })}>
          Sign in
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 pb-16 pt-10 md:pt-20">
        <div className="flex max-w-2xl flex-col items-center text-center">
          <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            Free plan: 5 messages every day
          </span>
          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Answers, code and notes in one chat
          </h1>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
            Tulasi AI helps you learn faster. Ask a question, request code, or get notes on any topic.
          </p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href="/sign-up" className={cn(buttonVariants({ size: 'lg' }), 'h-11 px-5 font-semibold')}>
              Create a free account
            </Link>
            <Link
              href="/sign-in"
              className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'h-11 px-5')}
            >
              I already have an account
            </Link>
          </div>
        </div>

        <ul className="mt-16 grid w-full max-w-4xl gap-4 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-lg border border-border bg-card p-6">
              <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 font-semibold text-foreground">{title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>

        <p className="mt-12 text-center text-sm text-muted-foreground">
          {'Need unlimited messages? Get Premium (Rs 999 / 30 days) in our '}
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
      </main>
    </div>
  )
}
