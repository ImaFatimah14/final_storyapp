import { getStories } from '../../data/api';
import createStoryItemTemplate from '../../views/templates/story-item';
import L from 'leaflet';
import { SavedStoryDB } from '../../utils/idb';
import { isPushSubscribed } from '../../utils/push-notification';

const HomePresenter = {
  async init({ token, container, mapContainer }) {
    const result = await getStories(token);

    if (result.error) {
      container.innerHTML = `<p class="error">${result.message}</p>`;
      return;
    }

    container.classList.add('story-grid');

    result.listStory.forEach((story) => {
      const storyItem = document.createElement('div');
      storyItem.classList.add('story-item');
      storyItem.innerHTML = createStoryItemTemplate(story);

      const saveButton = storyItem.querySelector('.save-button');
      if (saveButton) {
        saveButton.addEventListener('click', async (e) => {
          e.stopPropagation(); // Mencegah bubble jika ada event lain
          const confirmSave = confirm('Simpan cerita ini ke daftar tersimpan?');
          if (confirmSave) {
            const existing = await SavedStoryDB.get(story.id);
            if (!existing) {
              await SavedStoryDB.put(story);
              alert('Cerita telah disimpan.');
              // Notifikasi sukses simpan
              if (window.Notification && Notification.permission === 'granted' && await isPushSubscribed()) {
                new Notification('Cerita berhasil disimpan!', {
                  body: 'Cerita sudah masuk ke daftar tersimpan.',
                  icon: '/icons/icon-192x192.png',
                });
              }
            } else {
              alert('Cerita sudah ada dalam daftar tersimpan.');
              // Notifikasi duplikat
              if (window.Notification && Notification.permission === 'granted' && await isPushSubscribed()) {
                new Notification('Cerita sudah ada!', {
                  body: 'Cerita sudah ada dalam daftar tersimpan.',
                  icon: '/icons/icon-192x192.png',
                });
              }
            }
          }
        });
      }

      container.appendChild(storyItem);
    });

    const locations = result.listStory.filter((story) => story.lat && story.lon);
    if (locations.length && mapContainer) {
      const map = L.map(mapContainer).setView([locations[0].lat, locations[0].lon], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      locations.forEach((story) => {
        L.marker([story.lat, story.lon])
          .addTo(map)
          .bindPopup(`<b>${story.name}</b><br>${story.description}`);
      });
    }
  },
};

export default HomePresenter;
