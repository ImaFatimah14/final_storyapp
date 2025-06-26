import { parseActivePathname } from '../../routes/url-parser';

const StoryDetailPage = {
  async render() {
    return `
      <section class="story-detail container">
        <h2 id="story-title">Memuat cerita...</h2>
        <p id="story-description"></p>
        <img id="story-image" src="" alt="Ilustrasi cerita" />
      </section>
    `;
  },

  async afterRender() {
    const { id } = parseActivePathname();

    if (!id) {
      document.getElementById('story-title').textContent = 'Cerita tidak ditemukan.';
      return;
    }

    try {
      const response = await fetch(`https://story-api.dicoding.dev/v1/stories/${id}`);
      const data = await response.json();

      const story = data.story;

      document.getElementById('story-title').textContent = story.name;
      document.getElementById('story-description').textContent = story.description;
      const storyImage = document.getElementById('story-image');
      storyImage.src = story.photoUrl;
      storyImage.alt = `Foto cerita dari ${story.name}`;
    } catch (error) {
      document.getElementById('story-title').textContent = 'Gagal memuat cerita.';
      document.getElementById('story-description').textContent = error.message;
    }
  },
};

export default StoryDetailPage;
