import webpush from 'web-push'
import { getSupabaseAdmin } from './supabase/admin'

let configured = false
function ensureConfigured() {
  if (configured) return
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || 'mailto:contact@example.com'
  if (!pub || !priv) throw new Error('VAPID keys missing')
  webpush.setVapidDetails(subject, pub, priv)
  configured = true
}

export interface PushPayload {
  title: string
  body: string
  url?: string
  tag?: string
}

export async function sendPushTo(who: 'arthur' | 'paloma', payload: PushPayload) {
  try {
    ensureConfigured()
  } catch {
    return
  }

  const db = getSupabaseAdmin()
  const { data: subs } = await db
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('who', who)

  if (!subs || subs.length === 0) return

  const body = JSON.stringify(payload)
  const stale: string[] = []

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          body,
        )
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode
        if (statusCode === 404 || statusCode === 410) {
          stale.push(s.id)
        }
      }
    }),
  )

  if (stale.length > 0) {
    await db.from('push_subscriptions').delete().in('id', stale)
  }
}
