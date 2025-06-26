import routes from '../routes/routes';
import { getActiveRoute, parseRouteParams } from '../routes/url-parser';
import {
  isCurrentPushSubscriptionAvailable,
  subscribe,
  unsubscribe,
} from '../utils/notification-helper.js';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      const isOpen = this.#navigationDrawer.classList.toggle('open');
      this.#drawerButton.setAttribute('aria-expanded', String(isOpen));
    });

    document.body.addEventListener('click', (event) => {
      const isOutsideClick =
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target);

      if (isOutsideClick) {
        this.#navigationDrawer.classList.remove('open');
        this.#drawerButton.setAttribute('aria-expanded', 'false');
      }
    });

    this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', async (event) => {
        event.preventDefault();
        const href = link.getAttribute('href');
        window.location.hash = href;

        this.#navigationDrawer.classList.remove('open');
        this.#drawerButton.setAttribute('aria-expanded', 'false');

        this.#navigationDrawer.querySelectorAll('a').forEach((a) => {
          a.removeAttribute('aria-current');
        });
        link.setAttribute('aria-current', 'page');

        await this.renderPage();
      });
    });
  }

  async #setupPushNotification() {
    // Sinkronkan status tombol push notification utama (subscribe-push-btn)
    const subscribeBtn = document.getElementById('subscribe-push-btn');
    if (!subscribeBtn) return;
    const { isPushSubscribed, subscribePush, unsubscribePush } = await import('../utils/push-notification.js');
    if (await isPushSubscribed()) {
      subscribeBtn.textContent = 'Nonaktifkan Notifikasi';
      subscribeBtn.classList.add('active');
      subscribeBtn.onclick = async () => {
        await unsubscribePush();
        await this.#setupPushNotification();
      };
    } else {
      subscribeBtn.textContent = 'Aktifkan Notifikasi';
      subscribeBtn.classList.remove('active');
      subscribeBtn.onclick = async () => {
        await subscribePush();
        await this.#setupPushNotification();
      };
    }
  }

  async renderPage() {

    const url = getActiveRoute();

    let routeKey = Object.keys(routes).find((route) => route === url);

    if (!routeKey) {
      routeKey = Object.keys(routes).find((route) => {
        if (!route.includes(':')) return false;
        const regex = new RegExp('^' + route.replace(/:\w+/g, '([^\\/]+)') + '$');
        return regex.test(url);
      });
    }


    let page = routes[routeKey];
    if (!page) {
      // Tampilkan halaman Not Found
      page = routes['/404'];
      routeKey = '/404';
    }

    const params = parseRouteParams(routeKey, url);

    // Mendukung dynamic import (fungsi) dan static import (objek)
    let pageObj = page;
    if (typeof page === 'function') {
      const module = await page();
      pageObj = module.default || module;
    }

    try {
      const animateOut = () =>
        this.#content.animate(
          [
            { opacity: 1, transform: 'translateY(0)' },
            { opacity: 0, transform: 'translateY(10px)' },
          ],
          { duration: 200, fill: 'forwards' }
        ).finished;

      const animateIn = () =>
        this.#content.animate(
          [
            { opacity: 0, transform: 'translateY(10px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: 200, fill: 'forwards' }
        ).finished;

      if (document.startViewTransition) {
        await document.startViewTransition(async () => {
          await animateOut();
          this.#content.innerHTML = await pageObj.render(params);
          await pageObj.afterRender?.(params);
          await animateIn();
        });
      } else {
        await animateOut();
        this.#content.innerHTML = await pageObj.render(params);
        await pageObj.afterRender?.(params);
        await animateIn();
      }
    } catch (error) {
      this.#content.innerHTML = `<p>Terjadi kesalahan saat memuat halaman: ${error.message}</p>`;
    }

    if (routeKey === '/about') {
      import('./about/about-page.js').then(module => {
        module.default();
      });
    }
    await this.#setupPushNotification();
  }
}

export default App;
