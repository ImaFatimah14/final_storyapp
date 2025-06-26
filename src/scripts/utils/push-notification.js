// ==================== src/utils/push-notification.js ====================
const VAPID_PUBLIC_KEY = 'BBOzWVKaj9DYKwjf2XZVdBPEDYK9RwEBP8EG_sQODyL6TmmE_oD7DO-GYr9TuO_XxK-9nUoP8PbGSGx9CQXL7oo';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}

const PushNotificationHelper = {
  async register(serviceWorkerRegistration) {
    if (!('PushManager' in window)) {
      console.warn('PushManager tidak tersedia di browser ini.');
      return;
    }

    try {
      const existingSubscription = await serviceWorkerRegistration.pushManager.getSubscription();

      if (existingSubscription) {
        console.log('✅ Sudah berlangganan push notification:', existingSubscription);
      } else {
        console.log('📭 Belum ada langganan push notification.');
      }
    } catch (error) {
      console.error('❌ Gagal mengecek subscription push notification:', error);
    }
  },

  async subscribe(serviceWorkerRegistration) {
    try {
      const subscription = await serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      console.log('✅ Push Subscription berhasil:', JSON.stringify(subscription));
      alert('Push notification berhasil diaktifkan!');

      // Kirim subscription ke backend
      try {
        // Import modul dan akses ENDPOINTS dengan .then agar kompatibel dengan transpiler lama
        const apiModule = await import('../data/api.js');
        const ENDPOINTS = apiModule && apiModule.default ? apiModule.default.ENDPOINTS : apiModule.ENDPOINTS;
        const subscribeUrl = ENDPOINTS && ENDPOINTS.SUBSCRIBE ? ENDPOINTS.SUBSCRIBE : (apiModule.SUBSCRIBE || (apiModule.ENDPOINTS && apiModule.ENDPOINTS.SUBSCRIBE));
        if (!subscribeUrl) throw new Error('ENDPOINTS.SUBSCRIBE tidak ditemukan');
        const token = localStorage.getItem('token');
        const response = await fetch(subscribeUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
          },
          body: JSON.stringify(subscription),
        });
        if (!response.ok) {
          throw new Error('Gagal mendaftarkan endpoint notifikasi ke server');
        }
        console.log('✅ Endpoint notifikasi berhasil didaftarkan ke server');
      } catch (err) {
        console.error('❌ Gagal mendaftarkan endpoint notifikasi:', err);
      }

      return subscription;
    } catch (err) {
      console.error('❌ Gagal subscribe push notification:', err);
      alert('Gagal mengaktifkan push notification: ' + err.message);
    }
  },
};

// Helper subscribe/unsubscribe push notification sesuai best practice Dicoding
export async function isPushSubscribed() {
  if (!('serviceWorker' in navigator)) return false;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return !!subscription;
}

export async function subscribePush() {
  if (!('serviceWorker' in navigator)) {
    alert('Service worker tidak didukung browser ini.');
    return;
  }
  if (!('PushManager' in window)) {
    alert('PushManager tidak didukung browser ini.');
    return;
  }
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    alert('Izin notifikasi tidak diberikan.');
    return;
  }
  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    try {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      // Kirim ke backend jika perlu
      const apiModule = await import('../data/api.js');
      const ENDPOINTS = apiModule && apiModule.default ? apiModule.default.ENDPOINTS : apiModule.ENDPOINTS;
      const subscribeUrl = ENDPOINTS && ENDPOINTS.SUBSCRIBE ? ENDPOINTS.SUBSCRIBE : (apiModule.SUBSCRIBE || (apiModule.ENDPOINTS && apiModule.ENDPOINTS.SUBSCRIBE));
      if (!subscribeUrl) throw new Error('ENDPOINTS.SUBSCRIBE tidak ditemukan');
      const token = localStorage.getItem('token');
      await fetch(subscribeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
        },
        body: JSON.stringify(subscription),
      });
      alert('Push notification berhasil diaktifkan!');
    } catch (err) {
      alert('Gagal mengaktifkan push notification: ' + err.message);
    }
  } else {
    alert('Push notification sudah aktif!');
  }
}

export async function unsubscribePush() {
  if (!('serviceWorker' in navigator)) return;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    try {
      const { ENDPOINTS } = await import('../data/api.js');
      await fetch(ENDPOINTS.UNSUBSCRIBE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
    } catch (err) {
      // Tampilkan error di console, tapi tetap lanjut unsubscribe lokal agar UX tetap baik
      console.error('Gagal unsubscribe ke backend:', err);
    }
    await subscription.unsubscribe();
    alert('Push notification berhasil dinonaktifkan!');
  } else {
    alert('Belum ada push notification yang aktif.');
  }
}

export default PushNotificationHelper;
