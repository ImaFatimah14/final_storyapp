// ==================== src/sw-custom.js ====================
import { precacheAndRoute } from 'workbox-precaching';
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    // Fallback jika data bukan JSON, gunakan sebagai text
    console.error('Push data tidak valid JSON', e);
    data = {
      title: 'Notifikasi',
      body: event.data ? event.data.text() : 'Anda memiliki pesan baru',
    };
  }

  const title = data.title || 'Notifikasi Baru';
  const options = {
    body: data.body || 'Anda memiliki pesan baru',
    icon: 'icons/icon-192x192.png',
    badge: 'icons/icon-96x96.png',
    data: {
      url: data.url || '/',
    },
  };

  // Cek permission sebelum showNotification
  event.waitUntil(
    self.registration.pushManager.getSubscription().then(() => {
      if (Notification.permission === 'granted') {
        return self.registration.showNotification(title, options);
      } else {
        console.warn('Notifikasi tidak diizinkan oleh user.');
        return Promise.resolve();
      }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
