import { and, eq, lt, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { dailyUsage } from '@/lib/db/schema'

export const DAILY_FREE_LIMIT = 5
export const TELEGRAM_URL = 'https://t.me/Tulasiaibot'

function today() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
}

export async function getRemaining(userId: string) {
  const [row] = await db
    .select({ count: dailyUsage.count })
    .from(dailyUsage)
    .where(and(eq(dailyUsage.userId, userId), eq(dailyUsage.day, today())))
  return Math.max(0, DAILY_FREE_LIMIT - (row?.count ?? 0))
}

/** Atomically consumes one message. Returns remaining count, or null when the limit is reached. */
export async function consumeMessage(userId: string) {
  const rows = await db
    .insert(dailyUsage)
    .values({ userId, day: today(), count: 1 })
    .onConflictDoUpdate({
      target: [dailyUsage.userId, dailyUsage.day],
      set: { count: sql`${dailyUsage.count} + 1` },
      setWhere: lt(dailyUsage.count, DAILY_FREE_LIMIT),
    })
    .returning({ count: dailyUsage.count })

  if (rows.length === 0) return null
  return DAILY_FREE_LIMIT - rows[0].count
}
