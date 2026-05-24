'use client'
import { useEffect, useState, useTransition } from 'react'
import { subscribePush, unsubscribePush, sendTestPush, getPushStatus } from '@/lib/actions'
import { Bell, BellOff, Send, RefreshCw } from 'lucide-react'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i)
  return out
}

type Status = Awaited<ReturnType<typeof getPushStatus>>

export default function NotificationToggle({ who }: { who: 'arthur' | 'paloma' }) {
  const [supported, setSupported] = useState(false)
  const [standalone, setStandalone] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission | 'unknown'>('unknown')
  const [subscribed, setSubscribed] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)
  const [status, setStatus] = useState<Status | null>(null)

  async function refreshStatus() {
    try {
      const s = await getPushStatus(who)
      setStatus(s)
    } catch {}
  }

  useEffect(() => {
    const ok = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
    setSupported(ok)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true
    setStandalone(isStandalone)
    if (!ok) return
    setPermission(Notification.permission)
    navigator.serviceWorker.ready
      .then(reg => reg.pushManager.getSubscription())
      .then(sub => setSubscribed(!!sub))
      .catch(() => {})
    refreshStatus()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function enable() {
    setMsg('Étape 1 : demande permission...')
    if (!supported) { setMsg('Non supporté'); return }
    const perm = await Notification.requestPermission()
    setPermission(perm)
    if (perm !== 'granted') {
      setMsg("Permission refusée. Active-la dans les réglages iOS.")
      return
    }
    const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!pub) { setMsg('Clé VAPID publique manquante côté client') ; return }
    setMsg(`Étape 2 : clé VAPID ok (${pub.slice(0, 10)}...), abonnement push...`)

    try {
      const reg = await navigator.serviceWorker.ready
      setMsg('Étape 3 : SW prêt, subscribe...')
      const key = urlBase64ToUint8Array(pub)
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: key.buffer.slice(key.byteOffset, key.byteOffset + key.byteLength) as ArrayBuffer,
      })
      const json = sub.toJSON()
      setMsg(`Étape 4 : sub ok (${sub.endpoint.slice(-20)}), sauvegarde DB...`)
      startTransition(async () => {
        try {
          const res = await subscribePush({
            endpoint: json.endpoint!,
            p256dh: json.keys!.p256dh,
            auth: json.keys!.auth,
            who,
          })
          if (!res.ok) {
            setMsg('Sauvegarde DB échouée : ' + res.error)
          } else {
            setSubscribed(true)
            setMsg('Notifications activées ✓')
            refreshStatus()
          }
        } catch (e) {
          setMsg('Erreur réseau action : ' + (e instanceof Error ? e.message : String(e)))
        }
      })
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e)
      setMsg("Abonnement échoué à l'étape SW/subscribe : " + err)
    }
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
        refreshStatus()
      } catch (e) {
        const err = e instanceof Error ? e.message : String(e)
        setMsg(err)
      }
    })
  }

  async function test() {
    setMsg(null)
    startTransition(async () => {
      const res = await sendTestPush(who)
      if (res.ok) {
        setMsg(`Test envoyé à ${res.count} appareil${(res.count ?? 0) > 1 ? 's' : ''}. Si rien dans 30s → vérifie que les notifs sont autorisées dans Réglages iOS.`)
      } else {
        setMsg('Test échoué : ' + res.error)
      }
    })
  }

  async function debugBrowser() {
    const lines: string[] = []
    lines.push(`Permission: ${Notification.permission}`)
    lines.push(`SW: ${'serviceWorker' in navigator ? 'oui' : 'non'}`)
    lines.push(`Standalone: ${standalone ? 'oui' : 'non'}`)
    try {
      const reg = await navigator.serviceWorker.ready
      lines.push(`SW scope: ${reg.scope}`)
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        lines.push(`Sub endpoint: ...${sub.endpoint.slice(-30)}`)
        const json = sub.toJSON()
        lines.push(`p256dh: ${json.keys?.p256dh ? 'ok' : 'manquant'}`)
        lines.push(`auth: ${json.keys?.auth ? 'ok' : 'manquant'}`)
      } else {
        lines.push('Sub: aucune')
      }
    } catch (e) {
      lines.push('SW err: ' + (e instanceof Error ? e.message : String(e)))
    }
    setMsg(lines.join('\n'))
  }

  if (!supported) {
    return (
      <div className="rounded-[16px] bg-[#F7F7F7] p-4">
        <p className="text-[14px] font-semibold text-black">Notifications</p>
        <p className="text-[12px] text-[#8A8A8A] mt-1">
          Indisponible sur ce navigateur. Sur iPhone, installez l&apos;app sur l&apos;écran d&apos;accueil.
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

      {!standalone && (
        <div className="rounded-[10px] bg-[#FFF4E5] border border-[#FFD699] p-3">
          <p className="text-[12px] text-[#8A4B00] font-semibold">App non installée</p>
          <p className="text-[11px] text-[#8A4B00] leading-snug mt-1">
            Sur iPhone, les notifs ne fonctionnent QUE depuis l&apos;app installée (Safari → Partager → Sur l&apos;écran d&apos;accueil), pas depuis le navigateur.
          </p>
        </div>
      )}

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

      {subscribed && (
        <button
          onClick={test}
          disabled={isPending}
          className="h-[40px] rounded-[12px] text-[13px] font-semibold bg-white border border-[#E5E5E5] flex items-center justify-center gap-2 active:scale-[0.97] transition-transform duration-100 disabled:opacity-40"
        >
          <Send size={14} strokeWidth={1.8} />
          M&apos;envoyer un test
        </button>
      )}
      <button
        onClick={debugBrowser}
        className="h-[36px] rounded-[10px] text-[11px] text-[#8A8A8A] bg-white border border-[#EAEAEA] active:scale-[0.97] transition-transform duration-100"
      >
        Diagnostic browser
      </button>

      {permission === 'denied' && (
        <p className="text-[11px] text-[#C0392B]">
          Permission bloquée. Réglages iOS → Notifications → autoriser pour cette app.
        </p>
      )}
      {msg && <p className="text-[11px] text-[#8A8A8A] whitespace-pre-line">{msg}</p>}

      {status && (
        <div className="rounded-[10px] bg-white border border-[#EAEAEA] p-3 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-black uppercase tracking-wide">État serveur</p>
            <button onClick={refreshStatus} className="p-1 active:scale-90 transition-transform" aria-label="Rafraîchir">
              <RefreshCw size={12} color="#8A8A8A" />
            </button>
          </div>
          <p className="text-[11px] text-[#8A8A8A]">
            Clé VAPID publique : <span className={status.hasVapidPublic ? 'text-[#2E7D32]' : 'text-[#C0392B]'}>{status.hasVapidPublic ? 'OK' : 'MANQUANT'}</span>
          </p>
          <p className="text-[11px] text-[#8A8A8A]">
            Clé VAPID privée : <span className={status.hasVapidPrivate ? 'text-[#2E7D32]' : 'text-[#C0392B]'}>{status.hasVapidPrivate ? 'OK' : 'MANQUANT'}</span>
          </p>
          <p className="text-[11px] text-[#8A8A8A]">
            Appareils abonnés pour <b>{who}</b> : <span className={status.count > 0 ? 'text-[#2E7D32] font-semibold' : 'text-[#C0392B] font-semibold'}>{status.count}</span>
          </p>
          {status.endpoints.map(e => (
            <p key={e.id} className="text-[10px] text-[#8A8A8A] pl-2">
              · {e.provider}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
