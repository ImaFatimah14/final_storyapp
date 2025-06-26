const OfflinePage = {
  async render() {
    return `
      <section class="content">
        <h2>Cerita Tersimpan</h2>
        <div id="offlineStories"></div>
      </section>
    `;
  },

  async afterRender() {
    const offlineStories = JSON.parse(localStorage.getItem('offlineStories') || '[]');
    const container = document.getElementById('offlineStories');

    if (offlineStories.length === 0) {
      container.innerHTML = '<p>Tidak ada cerita tersimpan.</p>';
      return;
    }

    offlineStories.forEach(story => {
      const storyEl = document.createElement('div');
      storyEl.className = 'story-item';
      storyEl.innerHTML = `
        <h3>${story.name}</h3>
        <p>${story.description}</p>
        <button data-id="${story.id}">Hapus</button>
      `;
      storyEl.querySelector('button').addEventListener('click', () => {
        const updated = offlineStories.filter(s => s.id !== story.id);
        localStorage.setItem('offlineStories', JSON.stringify(updated));
        window.location.reload();
      });

      container.appendChild(storyEl);
    });
  }
};

export default OfflinePage;
