// Import CSS utama
import '../styles/styles.css';

// Import komponen utama dan helper push notification
import App from './pages/app.js';
import PushNotificationHelper, { subscribePush } from './utils/push-notification.js';
import { registerServiceWorker } from './utils/sw-register.js';

// Inisialisasi aplikasi saat DOM dimuat
document.addEventListener('DOMContentLoaded', async () => {
  await registerServiceWorker();

  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  await app.renderPage();

  // Render ulang halaman saat hash di URL berubah
  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });

  // Inisialisasi tombol push notification
  const subscribeBtn = document.getElementById('subscribe-push-btn');
  if (subscribeBtn) {
    // Set status tombol sesuai subscription
    const updateBtn = async () => {
      const { isPushSubscribed } = await import('./utils/push-notification.js');
      if (await isPushSubscribed()) {
        subscribeBtn.textContent = 'Nonaktifkan Notifikasi';
        subscribeBtn.classList.add('active');
      } else {
        subscribeBtn.textContent = 'Aktifkan Notifikasi';
        subscribeBtn.classList.remove('active');
      }
    };
    await updateBtn();
    subscribeBtn.style.display = 'block';
    subscribeBtn.onclick = async () => {
      const { isPushSubscribed, subscribePush, unsubscribePush } = await import('./utils/push-notification.js');
      if (await isPushSubscribed()) {
        await unsubscribePush();
      } else {
        await subscribePush();
      }
      await updateBtn();
    };
  }

  // Inisialisasi Add to Homescreen (A2HS)
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // Jika ingin menampilkan prompt A2HS setelah subscribe, bisa tambahkan logika di sini
  });
});

// Unregister service worker lama di mode development agar tidak error precache
if (process.env.NODE_ENV === 'development' && 'serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const reg of registrations) {
      await reg.unregister();
      console.log('Service worker lama di-unregister di mode dev:', reg);
    }
  });
}

// Clear seluruh cache browser (Cache Storage) di mode development
if (process.env.NODE_ENV === 'development' && 'caches' in window) {
  window.addEventListener('load', async () => {
    const cacheNames = await caches.keys();
    for (const name of cacheNames) {
      await caches.delete(name);
      console.log('Cache storage dihapus:', name);
    }
  });
}

// Daftarkan Service Worker dan inisialisasi Push Notification
if ('serviceWorker' in navigator && 'PushManager' in window) {
  window.addEventListener('load', async () => {
    try {
      // Gunakan path relatif agar cocok di GitHub Pages
      const registration = await navigator.serviceWorker.register('service-worker.js');
      console.log('✅ Service Worker berhasil didaftarkan.');

      await PushNotificationHelper.register(registration);
    } catch (error) {
      console.error('❌ Gagal mendaftarkan Service Worker atau Push Notification:', error);
    }
  });
}
