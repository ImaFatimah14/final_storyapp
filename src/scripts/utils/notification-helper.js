import { VAPID_PUBLIC_KEY } from '../config.js';
import { subscribePushNotification, unsubscribePushNotification } from '../data/api.js';

export function isNotificationAvailable() {
  return 'Notification' in window;
}

export function isNotificationGranted() {
  return Notification.permission === 'granted';
}

export async function requestNotificationPermission() {
  if (!isNotificationAvailable()) {
    alert('Notification API tidak didukung browser.');
    return false;
  }
  if (isNotificationGranted()) return true;
  const status = await Notification.requestPermission();
  if (status === 'denied') {
    alert('Izin notifikasi ditolak.');
    return false;
  }
  if (status === 'default') {
    alert('Izin notifikasi ditutup atau diabaikan.');
    return false;
  }
  return true;
}

export async function getPushSubscription() {
  let registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    // Tunggu service worker ready jika belum terdaftar
    try {
      registration = await navigator.serviceWorker.ready;
    } catch (e) {
      console.warn('Service worker belum siap.');
      return null;
    }
  }
  return await registration.pushManager.getSubscription();
}

export async function isCurrentPushSubscriptionAvailable() {
  return !!(await getPushSubscription());
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}

export function generateSubscribeOptions() {
  return {
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  };
}

export async function subscribe() {
  if (!(await requestNotificationPermission())) return;
  if (await isCurrentPushSubscriptionAvailable()) {
    alert('Sudah berlangganan push notification.');
    return;
  }
  let pushSubscription;
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      alert('Service worker belum terdaftar. Silakan refresh halaman.');
      return;
    }
    pushSubscription = await registration.pushManager.subscribe(generateSubscribeOptions());
    const { endpoint, keys } = pushSubscription.toJSON();
    const response = await subscribePushNotification({ endpoint, keys });
    if (!response.ok) {
      alert('Langganan push notification gagal diaktifkan.');
      await pushSubscription.unsubscribe();
      return;
    }
    alert('Langganan push notification berhasil diaktifkan.');
  } catch (error) {
    alert('Langganan push notification gagal diaktifkan.');
    console.error('subscribe: error:', error);
    if (pushSubscription) await pushSubscription.unsubscribe();
  }
}

export async function unsubscribe() {
  const pushSubscription = await getPushSubscription();
  if (!pushSubscription) {
    alert('Tidak bisa memutus langganan push notification karena belum berlangganan sebelumnya.');
    return;
  }
  const { endpoint, keys } = pushSubscription.toJSON();
  const response = await unsubscribePushNotification({ endpoint });
  if (!response.ok) {
    alert('Langganan push notification gagal dinonaktifkan.');
    return;
  }
  const unsubscribed = await pushSubscription.unsubscribe();
  if (!unsubscribed) {
    alert('Langganan push notification gagal dinonaktifkan.');
    await subscribePushNotification({ endpoint, keys });
    return;
  }
  alert('Langganan push notification berhasil dinonaktifkan.');
}
