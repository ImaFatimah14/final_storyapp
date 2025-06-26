const AboutPage = {
  async render() {
    return `
      <section class="about-page container">
        <h2>Tentang Aplikasi</h2>
        <p>Aplikasi <strong>Storyku</strong> dikembangkan sebagai bagian dari submission kelas Dicoding.</p>
        <p>Tujuannya adalah untuk membagikan cerita dari pengguna ke seluruh dunia.</p>
        <p>Dikembangkan oleh <strong>Manusia Bumi</strong> dengan ❤️.</p>
      </section>
    `;
  },

  async afterRender() {
    // tidak ada interaksi khusus
  },
};

export default AboutPage;
