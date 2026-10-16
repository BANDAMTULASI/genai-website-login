'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'

type Mode = 'sign-in' | 'sign-up'

const inputClass =
  'h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const isSignUp = mode === 'sign-up'

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') ?? '').trim().toLowerCase()
    const password = String(form.get('password') ?? '')
    const name = String(form.get('name') ?? '').trim()

    setPending(true)
    const { error } = isSignUp
      ? await authClient.signUp.email({
          email,
          password,
          name: name || email.split('@')[0],
        })
      : await authClient.signIn.email({ email, password })
    setPending(false)

    if (error) {
      setError(
        isSignUp
          ? 'Could not create your account. This email may already be registered — try signing in.'
          : 'Wrong email or password. Please try again.',
      )
      return
    }
    router.push('/chat')
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 shadow-[0_2px_12px_rgba(68,28,23,0.06)]">
      <h1 className="text-balance text-2xl font-semibold text-foreground">
        {isSignUp ? 'Create your account' : 'Sign in to Tulasi AI'}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {isSignUp
          ? 'Free plan includes 5 messages every day.'
          : 'Welcome back. Pick up where you left off.'}
      </p>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        {isSignUp && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-foreground/80">
              Your name
            </label>
            <input id="name" name="name" placeholder="e.g. Ravi" autoComplete="name" className={inputClass} />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground/80">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            autoComplete="email"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-foreground/80">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            className={inputClass}
          />
          {isSignUp && (
            <p className="text-xs text-muted-foreground">At least 8 characters.</p>
          )}
        </div>

        {error && (
          <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" disabled={pending} className="h-11 font-semibold">
          {pending ? 'Please wait...' : 'Continue'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isSignUp ? 'Already have an account? ' : 'New here? '}
        <Link
          href={isSignUp ? '/sign-in' : '/sign-up'}
          className="font-medium text-primary hover:underline"
        >
          {isSignUp ? 'Sign in' : 'Create a free account'}
        </Link>
      </p>
    </div>
  )
}
