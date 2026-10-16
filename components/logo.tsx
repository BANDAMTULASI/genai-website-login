import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export function Logo({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-semibold text-foreground">
      <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Sparkles className="size-4" aria-hidden="true" />
      </span>
      Tulasi AI
    </Link>
  )
}
