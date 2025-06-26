const DetailStory = {
  async render() {
    return `<div id="story-detail"></div>`;
  },

  async afterRender() {
    const url = UrlParser.parseActiveUrlWithoutCombiner();
    const story = await getStoryDetail(url.id);

    document.getElementById('story-detail').innerHTML = `
      <h2>${story.name}</h2>
      <img src="${story.photoUrl}" alt="${story.name}" />
      <p>${story.description}</p>
      <button id="save-btn">Simpan Cerita</button>
    `;

    document.getElementById('save-btn').addEventListener('click', () => {
      saveToOffline(story);
      alert('Cerita disimpan!');
    });
  }
};

export default DetailStory;
