import HomePresenter from './home-presenter';

const HomePage = {
  async render() {
    const isLoggedIn = !!localStorage.getItem('token'); // atau cek cara autentikasi kamu

    if (!isLoggedIn) {
      return `
        <section class="home__guest">
          <h2>Selamat datang di StoryApp!</h2>
          <p>Silakan <a href="#/login">Login</a> atau <a href="#/register">Register</a> untuk melihat dan menambah cerita.</p>
        </section>
      `;
    }

    return `
      <section class="content">
        <h2>Daftar Cerita</h2>
        <div id="storyList"></div>

        <h3>Lokasi Cerita</h3>
        <div id="storyMap" style="height: 400px; border-radius: 12px; margin-top: 1rem;"></div>
      </section>
    `;
  },

  async afterRender() {
    const token = localStorage.getItem('token');
    if (!token) return; // Jangan jalankan presenter jika belum login

    await HomePresenter.init({
      token,
      container: document.getElementById('storyList'),
      mapContainer: document.getElementById('storyMap'),
    });
  },
};

export default HomePage;
