// Service Worker registration helper
export function isServiceWorkerAvailable() {
  return 'serviceWorker' in navigator;
}

export async function registerServiceWorker() {
  if (!isServiceWorkerAvailable()) {
    console.log('Service Worker API unsupported');
    return;
  }
  // Di dev, jangan daftarkan service worker jika file tidak ada
  let swPath = '/service-worker.js';
  if (process.env.NODE_ENV === 'development') {
    try {
      const res = await fetch(swPath, { method: 'HEAD' });
      if (!res.ok) {
        console.warn('service-worker.js tidak ditemukan di dev, service worker tidak akan didaftarkan');
        return;
      }
    } catch (e) {
      console.warn('service-worker.js tidak ditemukan di dev, service worker tidak akan didaftarkan');
      return;
    }
  }
  try {
    const registration = await navigator.serviceWorker.register(swPath);
    console.log('Service worker telah terpasang', registration);
  } catch (error) {
    console.log('Failed to install service worker:', error);
  }
}
