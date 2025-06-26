// pages/saved-stories-page.js
import { SavedStoryDB } from '../../utils/idb';
import { isPushSubscribed } from '../../utils/push-notification';

const SavedStoriesPage = {
  async render() {
    return `
      <section class="saved-page">
        <h2 class="title">Cerita Tersimpan</h2>
        <div id="savedStoryList" class="story-grid"></div>
      </section>
    `;
  },

  async afterRender() {
    const container = document.getElementById('savedStoryList');
    container.innerHTML = '';

    const savedStories = await SavedStoryDB.getAll();

    if (!savedStories.length) {
      container.innerHTML = `<p>Tidak ada cerita yang disimpan.</p>`;
      return;
    }

    savedStories.forEach((story) => {
      const storyItem = document.createElement('div');
      storyItem.classList.add('story-item');
      storyItem.innerHTML = `
        <h3>${story.name}</h3>
        <p>${story.description}</p>
        <button class="delete-btn" data-id="${story.id}">Hapus</button>
      `;
      container.appendChild(storyItem);
    });

    // Selalu daftarkan event listener (event delegation)
    container.onclick = async (e) => {
      if (e.target.classList.contains('delete-btn')) {
        const id = e.target.dataset.id;
        await SavedStoryDB.delete(id);
        // Notifikasi hapus cerita
        if (window.Notification && Notification.permission === 'granted' && await isPushSubscribed()) {
          new Notification('Cerita dihapus dari tersimpan', {
            body: 'Cerita berhasil dihapus dari daftar tersimpan.',
            icon: '/icons/icon-192x192.png',
          });
        }
        await this.afterRender();
      }
    };
  },
};

export default SavedStoriesPage;
