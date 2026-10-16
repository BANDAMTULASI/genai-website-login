import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getSession } from '@/lib/auth'
import { AuthForm } from '@/components/auth-form'
import { Logo } from '@/components/logo'

export const metadata: Metadata = { title: 'Sign up - Tulasi AI' }

export default async function SignUpPage() {
  const session = await getSession(await headers())
  if (session?.user) redirect('/chat')

  return (
    <main className="flex min-h-dvh flex-col items-center gap-8 bg-background px-4 py-12">
      <Logo />
      <AuthForm mode="sign-up" />
    </main>
  )
}
