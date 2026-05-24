// Service worker pour Web Push (notifications PWA)

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  let payload = { title: 'Suivi', body: '' }
  try {
    if (event.data) payload = event.data.json()
  } catch {
    payload.body = event.data ? event.data.text() : ''
  }

  const options = {
    body: payload.body || '',
    icon: '/icon.png',
    badge: '/icon.png',
    data: { url: payload.url || '/' },
    tag: payload.tag,
    renotify: true,
    vibrate: [80, 40, 80],
  }

  event.waitUntil(self.registration.showNotification(payload.title || 'Suivi', options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = (event.notification.data && event.notification.data.url) || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      for (const client of clientsArr) {
        if ('focus' in client) {
          client.navigate(targetUrl).catch(() => {})
          return client.focus()
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl)
    })
  )
})
