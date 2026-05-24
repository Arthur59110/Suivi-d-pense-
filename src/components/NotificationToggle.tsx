'use client'
import { useEffect, useState, useTransition } from 'react'
import { subscribePush, unsubscribePush } from '@/lib/actions'
import { Bell, BellOff } from 'lucide-react'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i)
  return out
}

export default function NotificationToggle({ who }: { who: 'arthur' | 'paloma' }) {
  const [supported, setSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission | 'unknown'>('unknown')
  const [subscribed, setSubscribed] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    const ok = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
    setSupported(ok)
    if (!ok) return
    setPermission(Notification.permission)
    navigator.serviceWorker.ready
      .then(reg => reg.pushManager.getSubscription())
      .then(sub => setSubscribed(!!sub))
      .catch(() => {})
  }, [])

  async function enable() {
    setMsg(null)
    if (!supported) return
    const perm = await Notification.requestPermission()
    setPermission(perm)
    if (perm !== 'granted') {
      setMsg("Permission refusée. Active-la dans les réglages iOS.")
      return
    }
    const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!pub) { setMsg('Clé VAPID manquante') ; return }

    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(pub),
    })
    const json = sub.toJSON()
    startTransition(async () => {
      try {
        await subscribePush({
          endpoint: json.endpoint!,
          p256dh: json.keys!.p256dh,
          auth: json.keys!.auth,
          who,
        })
        setSubscribed(true)
        setMsg('Notifications activées')
      } catch (e) {
        const err = e instanceof Error ? e.message : String(e)
        setMsg(err)
      }
    })
  }

  async function disable() {
    setMsg(null)
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (!sub) { setSubscribed(false); return }
    const endpoint = sub.endpoint
    await sub.unsubscribe()
    startTransition(async () => {
      try {
        await unsubscribePush(endpoint)
        setSubscribed(false)
        setMsg('Notifications désactivées')
      } catch (e) {
        const err = e instanceof Error ? e.message : String(e)
        setMsg(err)
      }
    })
  }

  if (!supported) {
    return (
      <div className="rounded-[16px] bg-[#F7F7F7] p-4">
        <p className="text-[14px] font-semibold text-black">Notifications</p>
        <p className="text-[12px] text-[#8A8A8A] mt-1">
          Indisponible sur ce navigateur. Sur iPhone, installez l'app sur l'écran d'accueil.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-[16px] bg-[#F7F7F7] p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center flex-shrink-0">
          {subscribed
            ? <Bell size={18} color="#fff" strokeWidth={1.8} />
            : <BellOff size={18} color="#fff" strokeWidth={1.8} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-black">Notifications</p>
          <p className="text-[12px] text-[#8A8A8A] leading-snug">
            {subscribed
              ? 'Tu es averti de chaque ajout de Paloma'
              : 'Recevez une notif à chaque ajout de Paloma'}
          </p>
        </div>
      </div>
      <button
        onClick={subscribed ? disable : enable}
        disabled={isPending || permission === 'denied'}
        className="h-[44px] rounded-[12px] text-[14px] font-semibold transition-transform active:scale-[0.97] duration-100 disabled:opacity-40"
        style={{
          background: subscribed ? '#fff' : '#000',
          color: subscribed ? '#000' : '#fff',
          border: subscribed ? '1px solid #E5E5E5' : 'none',
        }}
      >
        {isPending ? '…' : subscribed ? 'Désactiver' : 'Activer les notifications'}
      </button>
      {permission === 'denied' && (
        <p className="text-[11px] text-[#C0392B]">
          Permission bloquée. Réglages iOS → Notifications → autoriser pour cette app.
        </p>
      )}
      {msg && <p className="text-[11px] text-[#8A8A8A]">{msg}</p>}
    </div>
  )
}
