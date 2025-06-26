// filepath: d:/CodingCamp/Praktek/Belajar Pengembangan Web Intermediate/fati/storyfati/src/scripts/pages/not-found-page.js
const NotFoundPage = {
  async render() {
    return `
      <section class="not-found-page" style="text-align:center; padding:4rem 1rem;">
        <h2 style="font-size:2.5rem; color:#ffdee0;">404</h2>
        <p style="font-size:1.2rem; margin-bottom:1.5rem;">Halaman tidak ditemukan.</p>
        <a href="#/home" style="color:#735557; text-decoration:underline; font-weight:bold;">Kembali ke Beranda</a>
      </section>
    `;
  },
  async afterRender() {}
};

export default NotFoundPage;
